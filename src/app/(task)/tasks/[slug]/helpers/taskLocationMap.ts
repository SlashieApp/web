import type {
  GeoJSONSource,
  LngLatBoundsLike,
  Map as MapboxMap,
  Marker,
} from 'mapbox-gl'

import {
  referenceMarkerElement,
  taskMarkerElement,
  taskPinDotElement,
} from '@/app/(task)/helpers/taskMap/pin'
import type { TaskMapTask } from '@/app/(task)/helpers/taskMap/types'
import { syncZoneCircle } from '@/app/(task)/helpers/taskMap/zoneCircle'
import { BRAND_MAP_ROUTE } from '@/theme/brand'
import { ensureMapboxStyles } from '@/utils/ensureMapboxStyles'
import {
  distanceMilesBetween,
  formatDistanceAwayLabel,
} from '@/utils/geoDistance'
import { mapboxDrivingRoute } from '@/utils/mapboxDirections'
import {
  type TaskBudgetViewerContext,
  type TaskDetailRecord,
  taskBudgetDisplayLine,
} from './taskDetailUtils'

const DEFAULT_STYLE = 'mapbox://styles/mapbox/streets-v12'
const EXACT_ZOOM = 14.5
const APPROX_ZOOM = 12.5

const CIRCLE_LAYERS = {
  source: 'task-loc-approx',
  fill: 'task-loc-approx-fill',
  line: 'task-loc-approx-line',
} as const
const ROUTE_SOURCE = 'task-loc-route'
const ROUTE_LAYER = 'task-loc-route-line'

export type TaskLocationMapVariant = 'exact' | 'approximate'

/** Browse-style expanded price pin payload for the task-detail map. */
export function buildTaskDetailMapPinTask(
  task: TaskDetailRecord,
  coords: { lat: number; lng: number },
  viewer: TaskBudgetViewerContext,
  viewerUserId?: string | null,
): TaskMapTask {
  const priceLabel = taskBudgetDisplayLine(task, viewer, viewerUserId)
  return {
    id: task.id,
    title: task.title,
    locationLat: coords.lat,
    locationLng: coords.lng,
    priceLabel,
    detailLine: priceLabel,
    distanceLabel: '—',
  }
}

export type TaskLocationMapViewPadding = {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export type TaskLocationMapController = {
  /** Draw a driving route from the given origin to the task location and frame both. */
  showRouteFrom: (origin: { lat: number; lng: number }) => Promise<void>
  clearRoute: () => void
  /** Shift the map's logical viewport so the pin can sit in a screen zone (e.g. header right). */
  setViewPadding: (padding: TaskLocationMapViewPadding) => void
  /** Re-fit the active route after a container resize. */
  reframeRoute: () => void
  setThemeMode: (mode: 'light' | 'dark') => void
  resize: () => void
  destroy: () => void
}

function styleUrlForMode(mode: 'light' | 'dark' | null | undefined): string {
  const light = process.env.NEXT_PUBLIC_MAPBOX_STYLE_LIGHT?.trim()
  const dark = process.env.NEXT_PUBLIC_MAPBOX_STYLE_DARK?.trim()
  if (mode === 'dark') return dark || DEFAULT_STYLE
  if (mode === 'light') return light || DEFAULT_STYLE
  return DEFAULT_STYLE
}

const emptyLine = {
  type: 'Feature' as const,
  properties: {},
  geometry: {
    type: 'LineString' as const,
    coordinates: [] as [number, number][],
  },
}

export function createTaskLocationMapController(args: {
  container: HTMLDivElement
  accessToken: string
  lat: number
  lng: number
  variant: TaskLocationMapVariant
  themeMode: 'light' | 'dark'
  viewPadding?: TaskLocationMapViewPadding
  onMapReady?: () => void
  /**
   * When provided (exact variant), the destination renders as the browse-map
   * expanded price pin instead of a bare dot. `distanceLabel` is replaced with
   * the live "x miles away" from the route origin once a route is drawn.
   */
  pinTask?: TaskMapTask
}): TaskLocationMapController {
  const { container, accessToken, lat, lng, variant } = args
  const pinTask: TaskMapTask | null = args.pinTask ? { ...args.pinTask } : null

  let cancelled = false
  let map: MapboxMap | null = null
  let mapboxMod: typeof import('mapbox-gl').default | null = null
  let destMarker: Marker | null = null
  let originMarker: Marker | null = null
  let routeAbort: AbortController | null = null
  let pendingRoute: { lat: number; lng: number } | null = null
  let currentRoute: {
    origin: { lat: number; lng: number }
    coordinates: [number, number][]
  } | null = null
  let viewPadding: TaskLocationMapViewPadding = args.viewPadding ?? {}

  const applyViewPadding = (
    m: MapboxMap,
    padding: TaskLocationMapViewPadding,
  ) => {
    m.setPadding({
      top: padding.top ?? 0,
      right: padding.right ?? 0,
      bottom: padding.bottom ?? 0,
      left: padding.left ?? 0,
    })
  }

  /** Pin framing — keeps the destination marker in the header's right zone. */
  const pinViewPadding = (): TaskLocationMapViewPadding => viewPadding

  /** Route framing — leaves room for header copy while showing the full path. */
  const routeViewPadding = (): TaskLocationMapViewPadding => {
    const w = container.offsetWidth
    const h = container.offsetHeight
    return {
      top: 96,
      left: Math.round(w * 0.36),
      right: 48,
      bottom: Math.max(96, Math.round(h * 0.12)),
    }
  }

  const resetCamera = (m: MapboxMap) => {
    applyViewPadding(m, pinViewPadding())
    m.jumpTo({
      center: [lng, lat],
      zoom: variant === 'exact' ? EXACT_ZOOM : APPROX_ZOOM,
    })
  }

  const addApproxCircle = (m: MapboxMap) => {
    syncZoneCircle(m, CIRCLE_LAYERS, { lat, lng })
  }

  const addDestMarker = (m: MapboxMap) => {
    if (!mapboxMod) return
    destMarker?.remove()
    if (pinTask) {
      // Non-interactive expanded price pin (no select/view-task actions).
      const handle = taskMarkerElement(pinTask, false, () => {})
      handle.setExpanded(true)
      destMarker = new mapboxMod.Marker({
        element: handle.el,
        anchor: 'bottom',
      })
        .setLngLat([lng, lat])
        .addTo(m)
      return
    }
    destMarker = new mapboxMod.Marker({
      element: taskPinDotElement(),
      anchor: 'center',
    })
      .setLngLat([lng, lat])
      .addTo(m)
  }

  const ensureRouteLayer = (m: MapboxMap) => {
    if (!m.getSource(ROUTE_SOURCE)) {
      m.addSource(ROUTE_SOURCE, { type: 'geojson', data: emptyLine })
    }
    if (!m.getLayer(ROUTE_LAYER)) {
      m.addLayer({
        id: ROUTE_LAYER,
        type: 'line',
        source: ROUTE_SOURCE,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': BRAND_MAP_ROUTE,
          'line-width': 4,
          'line-opacity': 0.9,
        },
      })
    }
  }

  const paintRoute = (m: MapboxMap, coordinates: [number, number][]) => {
    ensureRouteLayer(m)
    ;(m.getSource(ROUTE_SOURCE) as GeoJSONSource).setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates },
    })
  }

  const addOriginMarker = (
    m: MapboxMap,
    origin: { lat: number; lng: number },
  ) => {
    if (!mapboxMod) return
    originMarker?.remove()
    originMarker = new mapboxMod.Marker({
      element: referenceMarkerElement(),
      anchor: 'center',
    })
      .setLngLat([origin.lng, origin.lat])
      .addTo(m)
  }

  const frameRoute = (
    m: MapboxMap,
    origin: { lat: number; lng: number },
    coordinates: [number, number][],
  ) => {
    if (!mapboxMod) return
    const points: [number, number][] =
      coordinates.length >= 2
        ? coordinates
        : [
            [origin.lng, origin.lat],
            [lng, lat],
          ]
    const bounds = points.reduce(
      (b, c) => b.extend(c),
      new mapboxMod.LngLatBounds(points[0], points[0]),
    )
    applyViewPadding(m, routeViewPadding())
    m.fitBounds(bounds as LngLatBoundsLike, {
      padding: { top: 56, bottom: 56, left: 56, right: 56 },
      maxZoom: 14,
      duration: 600,
    })
  }

  const renderRoute = (m: MapboxMap) => {
    if (!currentRoute) return
    paintRoute(m, currentRoute.coordinates)
    addOriginMarker(m, currentRoute.origin)
    frameRoute(m, currentRoute.origin, currentRoute.coordinates)
  }

  const addOverlays = (m: MapboxMap) => {
    if (variant === 'exact') addDestMarker(m)
    else addApproxCircle(m)
    ensureRouteLayer(m)
    renderRoute(m)
  }

  void Promise.all([ensureMapboxStyles(), import('mapbox-gl')]).then(
    ([, mapboxgl]) => {
      if (cancelled || !container) return
      mapboxgl.default.accessToken = accessToken
      mapboxMod = mapboxgl.default

      const m = new mapboxgl.default.Map({
        container,
        style: styleUrlForMode(args.themeMode),
        center: [lng, lat],
        zoom: variant === 'exact' ? EXACT_ZOOM : APPROX_ZOOM,
        attributionControl: false,
      })
      // Don't trap page scroll behind the hero; drag/pinch/zoom stay interactive.
      m.scrollZoom.disable()
      map = m

      m.on('load', () => {
        if (cancelled) return
        resetCamera(m)
        addOverlays(m)
        if (pendingRoute) {
          const origin = pendingRoute
          pendingRoute = null
          void runRoute(origin)
        }
        args.onMapReady?.()
      })
      m.on('style.load', () => {
        if (cancelled || !m.isStyleLoaded()) return
        addOverlays(m)
      })
    },
  )

  const runRoute = async (origin: { lat: number; lng: number }) => {
    const m = map
    if (!m || !m.isStyleLoaded()) {
      pendingRoute = origin
      return
    }
    routeAbort?.abort()
    routeAbort = new AbortController()
    const geometry = await mapboxDrivingRoute(
      origin.lng,
      origin.lat,
      lng,
      lat,
      accessToken,
      routeAbort.signal,
    ).catch(() => null)
    if (cancelled || map !== m) return

    const coordinates: [number, number][] =
      geometry && geometry.coordinates.length >= 2
        ? geometry.coordinates
        : [
            [origin.lng, origin.lat],
            [lng, lat],
          ]
    currentRoute = { origin, coordinates }

    if (pinTask) {
      const awayLabel = formatDistanceAwayLabel(
        distanceMilesBetween(origin.lat, origin.lng, lat, lng),
      )
      if (awayLabel && awayLabel !== pinTask.distanceLabel) {
        pinTask.distanceLabel = awayLabel
        if (variant === 'exact') addDestMarker(m)
      }
    }

    renderRoute(m)
  }

  return {
    showRouteFrom: (origin) => runRoute(origin),
    clearRoute: () => {
      routeAbort?.abort()
      routeAbort = null
      currentRoute = null
      pendingRoute = null
      originMarker?.remove()
      originMarker = null
      const m = map
      if (m?.isStyleLoaded() && m.getSource(ROUTE_SOURCE)) {
        ;(m.getSource(ROUTE_SOURCE) as GeoJSONSource).setData(emptyLine)
        resetCamera(m)
      }
    },
    setViewPadding: (padding) => {
      viewPadding = padding
      const m = map
      if (!m?.isStyleLoaded()) return
      if (currentRoute) {
        frameRoute(m, currentRoute.origin, currentRoute.coordinates)
        return
      }
      resetCamera(m)
    },
    reframeRoute: () => {
      const m = map
      if (!m?.isStyleLoaded() || !currentRoute) return
      frameRoute(m, currentRoute.origin, currentRoute.coordinates)
    },
    setThemeMode: (mode) => {
      map?.setStyle(styleUrlForMode(mode))
    },
    resize: () => {
      map?.resize()
    },
    destroy: () => {
      cancelled = true
      routeAbort?.abort()
      destMarker?.remove()
      originMarker?.remove()
      map?.remove()
      map = null
      mapboxMod = null
    },
  }
}
