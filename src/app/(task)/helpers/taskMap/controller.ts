import type { MapMouseEvent, Map as MapboxMap, Marker } from 'mapbox-gl'

import { ensureMapboxStyles } from '@/utils/ensureMapboxStyles'
import { distanceMilesBetween } from '@/utils/geoDistance'

import { createTaskMapNavRouteController } from './navRoute'
import {
  referenceMarkerElement,
  taskLngLat,
  taskMarkerElement,
  taskPinContentSig,
} from './pin'
import type { TaskMapPropsSnapshot, TaskMapTask } from './types'
import { syncZoneCircle } from './zoneCircle'

/** Zone circle replacing the selected task's pin point on the browse map. */
const SELECTED_ZONE_LAYERS = {
  source: 'task-browse-selected-zone',
  fill: 'task-browse-selected-zone-fill',
  line: 'task-browse-selected-zone-line',
} as const

/** Selected-task zone radius on the browse map (tighter than the default). */
const SELECTED_ZONE_RADIUS_M = 280
/** Gap between the zone circle's top edge and the selected pin label card. */
const SELECTED_LABEL_GAP_PX = 6
/**
 * Invisible layout below the selected label card: the opacity-0 pin dot (14px)
 * + the popup's bottom margin (4px). Subtracted from the lift so the visible
 * card edge — not the hidden dot — sits `SELECTED_LABEL_GAP_PX` above the circle.
 */
const SELECTED_PIN_HIDDEN_BASE_PX = 18

const MAP_MIN_ZOOM = 10
const MAP_MAX_ZOOM = 17
const DEFAULT_MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12'

export const MAX_SEARCH_RADIUS_MILES = 50

/** Inverse of browse `zoomToRadiusMiles` — keeps map zoom aligned with search radius. */
function radiusMilesToZoom(miles: number): number {
  const clamped = Math.min(
    MAX_SEARCH_RADIUS_MILES,
    Math.max(1, Number.isFinite(miles) ? miles : 10),
  )
  const zoom = 13 - Math.log2(clamped / 10)
  return Math.min(MAP_MAX_ZOOM, Math.max(MAP_MIN_ZOOM, zoom))
}

/** Zone-circle radius in screen px at the current zoom (512px world tiles). */
function zoneRadiusPx(map: MapboxMap, lat: number): number {
  const metersPerPixel =
    (Math.cos((lat * Math.PI) / 180) * 40075016.686) /
    (512 * 2 ** map.getZoom())
  return SELECTED_ZONE_RADIUS_M / Math.max(metersPerPixel, 1e-9)
}

function fullscreenCenterOffsetPx(
  leftViewportPadding: number,
): [number, number] {
  return [Math.max(0, (leftViewportPadding - 120) / 2), 0]
}

function markerRowSig(task: TaskMapTask, lat: number, lng: number): string {
  return `${task.id}:${lat},${lng}:${taskPinContentSig(task)}`
}

type MarkerRow = {
  marker: Marker
  taskId: string
  markerSig: string
  setSelected: (v: boolean) => void
  setExpanded: (v: boolean) => void
}

export type TaskMapController = {
  sync: () => void
  scheduleSync: () => void
  destroy: () => void
}

/**
 * Imperative Mapbox controller for the task browse map. All state syncs flow
 * through ONE pipeline (`sync`) with a single camera authority per frame:
 *
 *   theme → reference marker → camera (search center, unless a task is
 *   selected) → markers → selection (expand + offset) → zone circle →
 *   selection fly + nav route → search-this-area UI.
 *
 * The controller owns its interaction state (search-area prompt, nav-route
 * presenting) — React only supplies a props snapshot via `getProps` and
 * receives UI callbacks. `scheduleSync` is safe to call at any time: syncs
 * requested before the map/style are ready are flushed by the load handlers.
 */
export function createTaskMapController(args: {
  container: HTMLDivElement
  accessToken: string
  getProps: () => TaskMapPropsSnapshot
}): TaskMapController {
  const { getProps } = args

  // --- lifecycle
  let cancelled = false
  let map: MapboxMap | null = null
  let mapboxMod: typeof import('mapbox-gl').default | null = null
  let syncQueued = false

  // --- interaction state (owned here, never round-tripped through React)
  let showSearchThisArea = false
  let pendingView: { lat: number; lng: number } | null = null
  let programmaticMove = false
  let suppressSearchPromptUntil = 0
  let isNavRoutePresenting = false

  // --- idempotence signatures
  let lastThemeMode: 'light' | 'dark' | null = null
  let lastMarkerSetSig = ''
  let lastSearchCenterKey: string | null = null
  let lastCameraKey = ''
  let lastSelectedId: string | null = null
  let lastZoneKey = ''
  let lastRouteKey = ''
  let lastSelectionFlyKey = ''
  let lastSearchUiSig = ''
  let didInitialCamera = false
  let prevVisible = false

  // --- map objects
  const markersById = new Map<string, MarkerRow>()
  let referenceMarker: Marker | null = null
  let selectedRow: MarkerRow | null = null
  let moveEndDebounce: ReturnType<typeof setTimeout> | null = null
  let resizeFrameRequested = false

  let moveEndRun: (() => void) | null = null
  let mapClickRun: ((e: MapMouseEvent) => void) | null = null
  let styleLoadRun: (() => void) | null = null
  let zoomRun: (() => void) | null = null
  let idleRun: (() => void) | null = null

  const navRoute = createTaskMapNavRouteController({
    getMap: () => map,
    getAccessToken: () => args.accessToken,
    getSearchCenter: () => {
      const p = getProps()
      return { lat: p.centerLat, lng: p.centerLng }
    },
    onNavRoutePresentingChange: (presenting) => {
      isNavRoutePresenting = presenting
      getProps().onNavRoutePresentingChange?.(presenting)
    },
  })

  const lightStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE_LIGHT?.trim()
  const darkStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE_DARK?.trim()

  const getStyleUrlForMode = (mode: 'light' | 'dark' | null | undefined) => {
    if (mode === 'dark') return darkStyle || DEFAULT_MAPBOX_STYLE
    if (mode === 'light') return lightStyle || DEFAULT_MAPBOX_STYLE
    return DEFAULT_MAPBOX_STYLE
  }

  const scheduleSync = () => {
    if (syncQueued) return
    syncQueued = true
    queueMicrotask(() => {
      syncQueued = false
      sync()
    })
  }

  const scheduleResize = () => {
    if (resizeFrameRequested) return
    resizeFrameRequested = true
    requestAnimationFrame(() => {
      resizeFrameRequested = false
      if (!map || cancelled) return
      map.resize()
    })
  }

  const resizeObserver = new ResizeObserver(scheduleResize)
  resizeObserver.observe(args.container)

  const beginProgrammaticMove = (suppressMs: number) => {
    if (!map) return
    programmaticMove = true
    suppressSearchPromptUntil = Date.now() + suppressMs
    map.once('moveend', () => {
      programmaticMove = false
    })
  }

  // ------------------------------------------------------- search-area UI

  const setShowSearchThisArea = (visible: boolean) => {
    if (showSearchThisArea === visible) return
    showSearchThisArea = visible
    syncSearchUi()
  }

  const handleSearchThisAreaButtonClick = () => {
    const p = getProps()
    const view = pendingView
    if (!view || !p.onSearchThisAreaConfirm || !map) return
    p.onSearchThisAreaConfirm(view.lat, view.lng, map.getZoom() ?? 11)
    pendingView = null
    setShowSearchThisArea(false)
  }

  const syncSearchUi = () => {
    const p = getProps()
    const visible = Boolean(showSearchThisArea && (p.visible ?? true))
    const enabled = Boolean(p.onSearchThisAreaConfirm)
    const uiSig = `${visible}|${enabled}|${p.searchAreaButtonPosition ?? ''}|${p.searchAreaButtonLeftInset ?? ''}|${p.searchAreaButtonOffsetX ?? '0px'}`
    if (uiSig === lastSearchUiSig) return
    lastSearchUiSig = uiSig
    p.onSearchThisAreaUiChange?.({
      visible,
      enabled,
      position: p.searchAreaButtonPosition,
      leftInset: p.searchAreaButtonLeftInset,
      offsetX: p.searchAreaButtonOffsetX,
      onClick: handleSearchThisAreaButtonClick,
    })
  }

  // ------------------------------------------------------------- reference

  const syncReferenceMarker = () => {
    if (!map || !mapboxMod) return
    const p = getProps()
    if (!referenceMarker) {
      referenceMarker = new mapboxMod.Marker({
        element: referenceMarkerElement(),
        anchor: 'center',
      })
        .setLngLat([p.centerLng, p.centerLat])
        .addTo(map)
      return
    }
    referenceMarker.setLngLat([p.centerLng, p.centerLat])
  }

  // ---------------------------------------------------------------- camera

  /**
   * Single search-center camera authority. Runs only when the center /
   * padding / radius actually changes, and yields entirely to the selection
   * fly while a task is selected.
   */
  const syncCamera = () => {
    if (!map) return
    const p = getProps()
    const leftPad = p.leftViewportPadding ?? 48
    const searchKey = `${p.centerLat},${p.centerLng}`

    // New search submitted → drop the stale area prompt, re-anchor the route.
    if (lastSearchCenterKey !== searchKey) {
      const isFirst = lastSearchCenterKey === null
      lastSearchCenterKey = searchKey
      if (!isFirst) {
        pendingView = null
        setShowSearchThisArea(false)
        suppressSearchPromptUntil = Date.now() + 1600
        navRoute.refreshForSearchCenter()
      }
    }

    // Visibility flip (mobile map tab) → Mapbox must re-measure.
    const visibleNow = p.visible ?? true
    if (visibleNow && !prevVisible) {
      const m = map
      requestAnimationFrame(() => {
        m.resize()
        requestAnimationFrame(() => m.resize())
      })
    }
    prevVisible = visibleNow

    const cameraKey = `${searchKey}|${leftPad}|${p.effectiveSearchRadiusMiles}`
    if (cameraKey === lastCameraKey) return
    // While a task is selected the selection fly owns the camera; leave the
    // key unconsumed so the search recenter applies after deselection.
    if (p.selectedTaskId) return
    lastCameraKey = cameraKey

    const easeArgs = {
      center: [p.centerLng, p.centerLat] as [number, number],
      zoom: radiusMilesToZoom(p.effectiveSearchRadiusMiles),
      offset: fullscreenCenterOffsetPx(leftPad),
    }

    if (!didInitialCamera) {
      // Map was constructed at the search center — apply offset without motion.
      didInitialCamera = true
      map.easeTo({ ...easeArgs, duration: 0 })
      return
    }

    beginProgrammaticMove(1200)
    map.easeTo({ ...easeArgs, duration: 450 })
  }

  // --------------------------------------------------------------- markers

  const clearAllMarkers = () => {
    for (const row of markersById.values()) row.marker.remove()
    markersById.clear()
    selectedRow = null
    lastMarkerSetSig = ''
  }

  const createMarkerForTask = (
    task: TaskMapTask,
    lat: number,
    lng: number,
    selected: boolean,
  ): MarkerRow | null => {
    if (!map || !mapboxMod) return null

    const { el, setSelected, setExpanded } = taskMarkerElement(
      task,
      selected,
      () =>
        queueMicrotask(() => {
          if (isNavRoutePresenting) return
          getProps().onSelectTask?.(task.id)
        }),
    )
    if (selected) setExpanded(true)

    const marker = new mapboxMod.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .addTo(map)

    return {
      marker,
      taskId: task.id,
      markerSig: markerRowSig(task, lat, lng),
      setSelected,
      setExpanded,
    }
  }

  /** Diff task markers against props; synchronous and signature-guarded. */
  const syncMarkers = () => {
    if (!map || !mapboxMod) return
    const p = getProps()
    if (!(p.visible ?? true) || !(p.tasksLoaded ?? true)) return

    const withCoords = p.tasks.flatMap((task) => {
      const ll = taskLngLat(task)
      return ll ? [{ task, ...ll }] : []
    })

    const setSig = withCoords
      .map(({ task, lat, lng }) => markerRowSig(task, lat, lng))
      .join('|')
    if (setSig === lastMarkerSetSig) return
    lastMarkerSetSig = setSig

    const selectedId = p.selectedTaskId ?? null
    const nextIds = new Set(withCoords.map((row) => row.task.id))
    let structureChanged = false

    for (const [taskId, row] of markersById) {
      if (!nextIds.has(taskId)) {
        row.marker.remove()
        markersById.delete(taskId)
        structureChanged = true
      }
    }

    for (const { task, lat, lng } of withCoords) {
      const nextSig = markerRowSig(task, lat, lng)
      const existing = markersById.get(task.id)
      if (existing?.markerSig === nextSig) continue

      existing?.marker.remove()
      const created = createMarkerForTask(
        task,
        lat,
        lng,
        task.id === selectedId,
      )
      if (created) markersById.set(task.id, created)
      structureChanged = true
    }

    // Rebuilt markers carry fresh DOM — re-derive the selection bindings.
    if (structureChanged) syncSelection(true)
  }

  // ------------------------------------------------------------- selection

  /** Lift the selected marker so its label card sits above the zone circle. */
  const syncSelectedMarkerOffset = () => {
    if (!map || !selectedRow) return
    const ll = selectedRow.marker.getLngLat()
    const lift =
      zoneRadiusPx(map, ll.lat) +
      SELECTED_LABEL_GAP_PX -
      SELECTED_PIN_HIDDEN_BASE_PX
    selectedRow.marker.setOffset([0, -Math.max(0, lift)])
  }

  const syncSelection = (force = false) => {
    const selectedId = getProps().selectedTaskId ?? null
    if (!force && selectedId === lastSelectedId) return
    lastSelectedId = selectedId

    selectedRow = null
    for (const row of markersById.values()) {
      const isSelected = row.taskId === selectedId
      row.setSelected(isSelected)
      row.setExpanded(isSelected)
      if (isSelected) selectedRow = row
      else row.marker.setOffset([0, 0])
    }
    syncSelectedMarkerOffset()
  }

  const syncZone = () => {
    if (!map?.isStyleLoaded()) return
    const p = getProps()
    const selectedId = p.selectedTaskId ?? null
    const task = selectedId ? p.tasks.find((t) => t.id === selectedId) : null
    const ll = task ? taskLngLat(task) : null
    const zoneKey = ll ? `${selectedId}|${ll.lat}|${ll.lng}` : '__none__'
    if (zoneKey === lastZoneKey) return
    lastZoneKey = zoneKey
    syncZoneCircle(map, SELECTED_ZONE_LAYERS, ll, SELECTED_ZONE_RADIUS_M)
  }

  /**
   * Fly to the selected task and draw its nav route. Keys include the
   * selection token so re-selecting the SAME task re-flies + redraws.
   */
  const syncSelectionFly = () => {
    if (!map) return
    const p = getProps()
    const leftPad = p.leftViewportPadding ?? 48
    const selectedId = p.selectedTaskId ?? null
    const task = selectedId ? p.tasks.find((t) => t.id === selectedId) : null
    const ll = task ? taskLngLat(task) : null
    const token = p.selectedTaskSelectionToken ?? 0

    // Approximate-location pins (worker mode) never draw a driving route.
    const routeEnabled = p.navRouteEnabled ?? true
    const routeKey =
      selectedId && ll && routeEnabled ? `${selectedId}|${token}` : ''
    if (routeKey !== lastRouteKey) {
      lastRouteKey = routeKey
      navRoute.setSelectedRoute(
        ll && routeEnabled ? { lng: ll.lng, lat: ll.lat } : null,
      )
    }

    const flyKey =
      selectedId && ll
        ? `${selectedId}|${token}|${ll.lat}|${ll.lng}|${leftPad}`
        : '__none__'
    if (flyKey === lastSelectionFlyKey) return
    lastSelectionFlyKey = flyKey
    if (!selectedId || !ll) return

    map.stop()
    setShowSearchThisArea(false)
    beginProgrammaticMove(1200)
    map.flyTo({
      center: [ll.lng, ll.lat],
      zoom: Math.min(
        MAP_MAX_ZOOM,
        Math.max(MAP_MIN_ZOOM, Math.max(map.getZoom(), 13.5)),
      ),
      offset: fullscreenCenterOffsetPx(leftPad),
      duration: 320,
      essential: true,
    })
  }

  // ------------------------------------------------------------------ sync

  const sync = () => {
    if (cancelled || !map) return
    // Not ready yet — the `load` / `style.load` handlers re-schedule.
    if (!map.isStyleLoaded()) return

    const p = getProps()

    if (p.themeMode && p.themeMode !== lastThemeMode) {
      lastThemeMode = p.themeMode
      // Style swap drops GeoJSON layers; markers are DOM and survive.
      lastZoneKey = ''
      map.setStyle(getStyleUrlForMode(p.themeMode))
      return // style.load handler re-schedules the full sync
    }

    syncReferenceMarker()
    syncCamera()
    syncMarkers()
    syncSelection()
    syncZone()
    syncSelectionFly()
    syncSearchUi()
  }

  // ------------------------------------------------------------------ init

  void Promise.all([ensureMapboxStyles(), import('mapbox-gl')]).then(
    ([, mapboxgl]) => {
      if (cancelled) return
      mapboxgl.default.accessToken = args.accessToken
      mapboxMod = mapboxgl.default

      const initial = getProps()
      lastThemeMode = initial.themeMode

      const m = new mapboxgl.default.Map({
        container: args.container,
        style: getStyleUrlForMode(initial.themeMode),
        center: [initial.centerLng, initial.centerLat],
        zoom: radiusMilesToZoom(initial.effectiveSearchRadiusMiles),
        minZoom: MAP_MIN_ZOOM,
        maxZoom: MAP_MAX_ZOOM,
      })
      m.addControl(new mapboxgl.default.NavigationControl(), 'top-right')
      map = m

      m.once('load', () => {
        if (cancelled) return
        m.resize()
        requestAnimationFrame(() => m.resize())
        getProps().onReadyChange?.(true)
        navRoute.flushWhenReady()
        scheduleSync()
      })

      styleLoadRun = () => {
        if (cancelled) return
        // Style reload drops GeoJSON layers — re-sync zone circle + route.
        lastZoneKey = ''
        navRoute.onStyleReload()
        navRoute.flushWhenReady()
        scheduleSync()
      }
      m.on('style.load', styleLoadRun)

      zoomRun = () => syncSelectedMarkerOffset()
      m.on('zoom', zoomRun)

      // Flush route applies deferred while the style was busy (tiles loading
      // mid-fly make `isStyleLoaded()` flicker false — the route would
      // otherwise silently never draw). No-op unless a deferral is pending.
      idleRun = () => navRoute.flushWhenReady()
      m.on('idle', idleRun)

      moveEndRun = () => {
        if (!map || !getProps().onSearchThisAreaConfirm) return
        if (moveEndDebounce) clearTimeout(moveEndDebounce)
        moveEndDebounce = setTimeout(() => {
          if (cancelled || programmaticMove || !map) return
          if (Date.now() < suppressSearchPromptUntil) {
            setShowSearchThisArea(false)
            return
          }
          const c = map.getCenter()
          const p = getProps()
          const movedOutsideSearchArea =
            distanceMilesBetween(p.centerLat, p.centerLng, c.lat, c.lng) >
            p.effectiveSearchRadiusMiles
          if (movedOutsideSearchArea) {
            pendingView = { lat: c.lat, lng: c.lng }
            setShowSearchThisArea(true)
          } else {
            pendingView = null
            setShowSearchThisArea(false)
          }
        }, 400)
      }
      m.on('moveend', moveEndRun)

      mapClickRun = (e: MapMouseEvent) => {
        const target = e.originalEvent?.target
        if (target instanceof Element && target.closest('.mapboxgl-marker')) {
          return
        }
        if (isNavRoutePresenting) return
        navRoute.clearRoute()
        const p = getProps()
        if (p.selectedTaskId) p.onSelectTask?.(null)
        p.onMapClick?.()
      }
      m.on('click', mapClickRun)
    },
  )

  return {
    sync,
    scheduleSync,
    destroy: () => {
      cancelled = true
      if (moveEndDebounce) clearTimeout(moveEndDebounce)
      resizeObserver.disconnect()
      if (map && moveEndRun) map.off('moveend', moveEndRun)
      if (map && mapClickRun) map.off('click', mapClickRun)
      if (map && styleLoadRun) map.off('style.load', styleLoadRun)
      if (map && zoomRun) map.off('zoom', zoomRun)
      if (map && idleRun) map.off('idle', idleRun)
      navRoute.destroy()
      clearAllMarkers()
      referenceMarker?.remove()
      referenceMarker = null
      map?.remove()
      map = null
      mapboxMod = null
      getProps().onReadyChange?.(false)
    },
  }
}
