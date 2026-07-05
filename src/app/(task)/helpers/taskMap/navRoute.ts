import type { ExpressionSpecification } from 'mapbox-gl'
import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'

import { BRAND_MAP_ROUTE } from '@/theme/brand'
import {
  mapboxDrivingRoute,
  peekDrivingRouteCache,
} from '@/utils/mapboxDirections'

export const TASK_MAP_NAV_ROUTE_SOURCE = 'task-browse-nav-route'
export const TASK_MAP_NAV_ROUTE_LAYER = 'task-browse-nav-route-line'

const ROUTE_GREEN = BRAND_MAP_ROUTE
const ROUTE_FADE = 'rgba(0, 220, 130, 0)'
const ROUTE_ANIM_MS = 400

const emptyLine = {
  type: 'Feature' as const,
  properties: {},
  geometry: {
    type: 'LineString' as const,
    coordinates: [] as [number, number][],
  },
}

/** Last drawn route geometry keyed by stable origin→destination (survives task re-selection). */
const presentationRouteCache = new Map<string, [number, number][]>()

function routeMotionEnabled(): boolean {
  if (typeof window === 'undefined') return true
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

function routeDisplayKey(
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

function rememberRouteGeometry(
  displayKey: string,
  coordinates: [number, number][],
) {
  if (coordinates.length >= 2) {
    presentationRouteCache.set(displayKey, coordinates)
  }
}

function resolveCachedCoordinates(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  displayKey: string,
): [number, number][] | null {
  const fromPresentation = presentationRouteCache.get(displayKey)
  if (fromPresentation && fromPresentation.length >= 2) {
    return fromPresentation
  }
  const fromDirections = peekDrivingRouteCache(
    fromLng,
    fromLat,
    toLng,
    toLat,
  )?.coordinates
  if (fromDirections && fromDirections.length >= 2) {
    rememberRouteGeometry(displayKey, fromDirections)
    return fromDirections
  }
  return null
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
  onNavRoutePresentingChange?: (presenting: boolean) => void
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
  let isPresenting = false

  const setPresenting = (presenting: boolean) => {
    if (presenting === isPresenting) return
    isPresenting = presenting
    // Defer so map init / sync never triggers React setState during a ref callback.
    queueMicrotask(() => {
      args.onNavRoutePresentingChange?.(presenting)
    })
  }

  const cancelAnimation = () => {
    if (animFrame != null) {
      cancelAnimationFrame(animFrame)
      animFrame = null
    }
  }

  /** Stop gradient animation only — keep line geometry for cache replay. */
  const cancelRoutePresentation = () => {
    cancelAnimation()
    const map = args.getMap()
    if (map?.isStyleLoaded() && map.getLayer(TASK_MAP_NAV_ROUTE_LAYER)) {
      setGradientProgress(map, 0)
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
      setPresenting(false)
      return
    }

    setGradientProgress(map, 0)
    animStart = performance.now()

    const tick = (now: number) => {
      if (displayKey !== activeDisplayKey || !activeDisplayKey) return
      const t = Math.min(1, (now - animStart) / ROUTE_ANIM_MS)
      setGradientProgress(map, easeOutCubic(t))
      if (t < 1) {
        animFrame = requestAnimationFrame(tick)
      } else {
        animFrame = null
        setPresenting(false)
      }
    }

    animFrame = requestAnimationFrame(tick)
  }

  const clearRoute = () => {
    routeRequestId += 1
    abort?.abort()
    abort = null
    cancelAnimation()
    setPresenting(false)
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

    rememberRouteGeometry(displayKey, coordinates)
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
    if (!map) {
      needsFlushWhenReady = true
      return
    }

    const { lat: fromLat, lng: fromLng } = args.getSearchCenter()
    const token = args.getAccessToken().trim()
    if (!token) return

    const displayKey = routeDisplayKey(fromLng, fromLat, toLng, toLat)
    if (!opts?.force && displayKey === activeDisplayKey) return

    const requestId = ++routeRequestId
    pendingDisplayKey = displayKey
    needsFlushWhenReady = false
    setPresenting(true)

    const cached = resolveCachedCoordinates(
      fromLng,
      fromLat,
      toLng,
      toLat,
      displayKey,
    )
    if (cached) {
      abort?.abort()
      abort = null
      cancelRoutePresentation()
      if (!map.isStyleLoaded()) {
        // Layer mutations throw while the style is busy — defer to `idle`.
        needsFlushWhenReady = true
        return
      }
      applyRoute(map, cached, displayKey, requestId)
      return
    }

    cancelRoutePresentation()
    activeDisplayKey = ''
    abort?.abort()
    abort = new AbortController()
    const { signal } = abort

    const fallbackLine: [number, number][] = [
      [fromLng, fromLat],
      [toLng, toLat],
    ]

    void mapboxDrivingRoute(fromLng, fromLat, toLng, toLat, token, signal)
      .then((geometry) => {
        if (requestId !== routeRequestId) return
        if (pendingDisplayKey !== displayKey) return

        const m = args.getMap()
        if (!m?.isStyleLoaded()) {
          // Style busy (e.g. tiles loading mid-fly) — the controller's `idle`
          // handler flushes this once the map settles.
          needsFlushWhenReady = true
          return
        }

        const coordinates =
          geometry?.coordinates.length && geometry.coordinates.length >= 2
            ? geometry.coordinates
            : fallbackLine

        applyRoute(m, coordinates, displayKey, requestId)
      })
      .catch((err: unknown) => {
        if (requestId !== routeRequestId) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        // Network/API failure — still show a straight-line path so the
        // selection always presents a route.
        const m = args.getMap()
        if (m?.isStyleLoaded()) {
          applyRoute(m, fallbackLine, displayKey, requestId)
        } else {
          needsFlushWhenReady = true
          setPresenting(false)
        }
      })
  }

  /**
   * Retry a route apply that was deferred because the style was busy. Cheap
   * no-op unless a deferral is actually pending — safe to call from the map's
   * `idle` event.
   */
  const flushWhenReady = () => {
    if (!needsFlushWhenReady) return
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
