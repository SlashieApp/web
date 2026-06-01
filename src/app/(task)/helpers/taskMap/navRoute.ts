import type { ExpressionSpecification } from 'mapbox-gl'
import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'

import { mapboxDrivingRoute } from '@/utils/mapboxDirections'

export const TASK_MAP_NAV_ROUTE_SOURCE = 'task-browse-nav-route'
export const TASK_MAP_NAV_ROUTE_LAYER = 'task-browse-nav-route-line'

const ROUTE_GREEN = '#00AB63'
const ROUTE_FADE = 'rgba(0, 171, 99, 0)'
const ROUTE_ANIM_MS = 720

const emptyLine = {
  type: 'Feature' as const,
  properties: {},
  geometry: {
    type: 'LineString' as const,
    coordinates: [] as [number, number][],
  },
}

function routeMotionEnabled(): boolean {
  if (typeof window === 'undefined') return true
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

function targetKey(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
): string {
  return `${fromLng},${fromLat}->${toLng},${toLat}`
}

function lineGradient(progress: number): ExpressionSpecification {
  const p = Math.min(1, Math.max(0, progress))
  return ['step', ['line-progress'], ROUTE_GREEN, p, ROUTE_FADE]
}

function layerInsertBeforeId(map: MapboxMap): string | undefined {
  const layers = map.getStyle()?.layers
  if (!layers) return undefined
  for (const layer of layers) {
    if (layer.type === 'symbol') return layer.id
  }
  return undefined
}

export function ensureTaskMapNavRouteLayers(map: MapboxMap) {
  if (!map.getSource(TASK_MAP_NAV_ROUTE_SOURCE)) {
    map.addSource(TASK_MAP_NAV_ROUTE_SOURCE, {
      type: 'geojson',
      data: emptyLine,
      lineMetrics: true,
    })
  }
  if (!map.getLayer(TASK_MAP_NAV_ROUTE_LAYER)) {
    map.addLayer(
      {
        id: TASK_MAP_NAV_ROUTE_LAYER,
        type: 'line',
        source: TASK_MAP_NAV_ROUTE_SOURCE,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-width': 4,
          'line-opacity': 0.88,
          'line-gradient': lineGradient(1),
        },
      },
      layerInsertBeforeId(map),
    )
  }
}

function clearTaskMapNavRouteData(map: MapboxMap) {
  const src = map.getSource(TASK_MAP_NAV_ROUTE_SOURCE) as
    | GeoJSONSource
    | undefined
  if (src) src.setData(emptyLine)
  if (map.getLayer(TASK_MAP_NAV_ROUTE_LAYER)) {
    map.setPaintProperty(
      TASK_MAP_NAV_ROUTE_LAYER,
      'line-gradient',
      lineGradient(0),
    )
  }
}

export type TaskMapNavRouteController = {
  setSelectedRoute: (target: { lng: number; lat: number } | null) => void
  refreshForSearchCenter: () => void
  onStyleReload: () => void
  flushWhenReady: () => void
  clearRoute: () => void
  destroy: () => void
}

export function createTaskMapNavRouteController(args: {
  getMap: () => MapboxMap | null
  getAccessToken: () => string
  getSearchCenter: () => { lat: number; lng: number }
}): TaskMapNavRouteController {
  let abort: AbortController | null = null
  let activeDisplayKey = ''
  let pendingDisplayKey = ''
  let animFrame: number | null = null
  let animStart = 0
  let selected: { lng: number; lat: number } | null = null
  let needsFlushWhenReady = false
  /** Invalidates in-flight fetches when the user picks another task. */
  let routeRequestId = 0

  const cancelAnimation = () => {
    if (animFrame != null) {
      cancelAnimationFrame(animFrame)
      animFrame = null
    }
  }

  const setGradientProgress = (map: MapboxMap, progress: number) => {
    if (!map.getLayer(TASK_MAP_NAV_ROUTE_LAYER)) return
    map.setPaintProperty(
      TASK_MAP_NAV_ROUTE_LAYER,
      'line-gradient',
      lineGradient(progress),
    )
  }

  const runGradientAnimation = (map: MapboxMap, displayKey: string) => {
    cancelAnimation()
    if (!routeMotionEnabled()) {
      setGradientProgress(map, 1)
      return
    }

    setGradientProgress(map, 0)
    animStart = performance.now()

    const tick = (now: number) => {
      if (displayKey !== activeDisplayKey) return
      const t = Math.min(1, (now - animStart) / ROUTE_ANIM_MS)
      setGradientProgress(map, easeOutCubic(t))
      if (t < 1) {
        animFrame = requestAnimationFrame(tick)
      } else {
        animFrame = null
      }
    }

    animFrame = requestAnimationFrame(tick)
  }

  const clearRoute = () => {
    routeRequestId += 1
    abort?.abort()
    abort = null
    cancelAnimation()
    activeDisplayKey = ''
    pendingDisplayKey = ''
    needsFlushWhenReady = false
    selected = null
    const map = args.getMap()
    if (map?.isStyleLoaded() && map.getSource(TASK_MAP_NAV_ROUTE_SOURCE)) {
      clearTaskMapNavRouteData(map)
    }
  }

  const applyRoute = (
    map: MapboxMap,
    coordinates: [number, number][],
    displayKey: string,
    requestId: number,
  ) => {
    if (requestId !== routeRequestId) return
    if (pendingDisplayKey !== displayKey) return

    ensureTaskMapNavRouteLayers(map)
    const src = map.getSource(TASK_MAP_NAV_ROUTE_SOURCE) as GeoJSONSource
    src.setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates },
    })
    activeDisplayKey = displayKey
    runGradientAnimation(map, displayKey)
  }

  const loadRouteTo = (
    toLng: number,
    toLat: number,
    opts?: { force?: boolean },
  ) => {
    const map = args.getMap()
    if (!map?.isStyleLoaded()) {
      needsFlushWhenReady = true
      return
    }

    const { lat: fromLat, lng: fromLng } = args.getSearchCenter()
    const token = args.getAccessToken().trim()
    if (!token) return

    const displayKey = targetKey(fromLng, fromLat, toLng, toLat)
    if (!opts?.force && displayKey === activeDisplayKey) return

    const requestId = ++routeRequestId
    pendingDisplayKey = displayKey
    needsFlushWhenReady = false
    cancelAnimation()
    abort?.abort()
    abort = new AbortController()
    const { signal } = abort

    const fallbackLine: [number, number][] = [
      [fromLng, fromLat],
      [toLng, toLat],
    ]

    void mapboxDrivingRoute(fromLng, fromLat, toLng, toLat, token, signal).then(
      (geometry) => {
        if (requestId !== routeRequestId) return
        if (pendingDisplayKey !== displayKey) return

        const m = args.getMap()
        if (!m?.isStyleLoaded()) {
          needsFlushWhenReady = true
          return
        }

        const coordinates =
          geometry?.coordinates.length && geometry.coordinates.length >= 2
            ? geometry.coordinates
            : fallbackLine

        applyRoute(m, coordinates, displayKey, requestId)
      },
    )
  }

  const flushWhenReady = () => {
    if (!needsFlushWhenReady && !selected) return
    const map = args.getMap()
    if (!map?.isStyleLoaded()) return
    needsFlushWhenReady = false
    if (!selected) return
    loadRouteTo(selected.lng, selected.lat, { force: true })
  }

  return {
    setSelectedRoute: (target) => {
      selected = target
      if (!selected) {
        clearRoute()
        return
      }
      loadRouteTo(selected.lng, selected.lat, { force: true })
    },
    refreshForSearchCenter: () => {
      if (!selected) return
      loadRouteTo(selected.lng, selected.lat, { force: true })
    },
    onStyleReload: () => {
      activeDisplayKey = ''
      cancelAnimation()
      needsFlushWhenReady = Boolean(selected)
      if (selected) loadRouteTo(selected.lng, selected.lat, { force: true })
    },
    flushWhenReady,
    clearRoute,
    destroy: clearRoute,
  }
}
