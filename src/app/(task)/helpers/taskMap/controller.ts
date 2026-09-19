import type { MapMouseEvent, Map as MapboxMap, Marker } from 'mapbox-gl'

import { ensureMapboxStyles } from '@/utils/ensureMapboxStyles'
import { distanceMilesBetween } from '@/utils/geoDistance'

import { MARKETPLACE_MAP_MOTION_MS } from '../marketplaceMap/motion'
import { mountMapFadeOverlay } from '../marketplaceMap/overlay/overlay'
import { createTaskMapNavRouteController } from './navRoute'
import {
  referenceMarkerElement,
  taskLngLat,
  taskMarkerElement,
  taskPinContentSig,
} from './pin'
import type { TaskMapPropsSnapshot, TaskMapTask } from './types'

const MAP_MIN_ZOOM = 10
const MAP_MAX_ZOOM = 17
const DEFAULT_MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12'

export const MAX_SEARCH_RADIUS_MILES = 50

/** Shared duration for search ↔ detail and search-center camera moves. */
const CAMERA_FLY_MS = MARKETPLACE_MAP_MOTION_MS

/** Inverse of browse `zoomToRadiusMiles` — keeps map zoom aligned with search radius. */
function radiusMilesToZoom(miles: number): number {
  const clamped = Math.min(
    MAX_SEARCH_RADIUS_MILES,
    Math.max(1, Number.isFinite(miles) ? miles : 10),
  )
  const zoom = 13 - Math.log2(clamped / 10)
  return Math.min(MAP_MAX_ZOOM, Math.max(MAP_MIN_ZOOM, zoom))
}

function fullscreenCenterOffsetPx(
  leftViewportPadding: number,
): [number, number] {
  return [Math.max(0, (leftViewportPadding - 120) / 2), 0]
}

function viewPaddingSig(
  padding: TaskMapPropsSnapshot['viewPadding'] | undefined,
): string {
  if (!padding) return '0'
  return `${padding.top ?? 0},${padding.right ?? 0},${padding.bottom ?? 0},${padding.left ?? 0}`
}

function zeroPadding() {
  return { top: 0, right: 0, bottom: 0, left: 0 }
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
  /** If the Mapbox instance is already loaded, notify `onReadyChange` (search remounts). */
  flushReady: () => void
  destroy: () => void
}

/**
 * Imperative Mapbox controller for the task browse map. All state syncs flow
 * through ONE pipeline (`sync`) with a single camera authority per frame:
 *
 *   theme → reference marker → camera (search center, unless a task is
 *   selected) → markers → selection (expand, pin stays on lat/lng) →
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
  let unmountFade: (() => void) | null = null

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
  let lastRouteKey = ''
  let lastSelectionFlyKey = ''
  let lastSearchUiSig = ''
  let didInitialCamera = false
  let prevVisible = false

  // --- map objects
  const markersById = new Map<string, MarkerRow>()
  let referenceMarker: Marker | null = null
  let moveEndDebounce: ReturnType<typeof setTimeout> | null = null
  let resizeFrameRequested = false

  let moveEndRun: (() => void) | null = null
  let mapClickRun: ((e: MapMouseEvent) => void) | null = null
  let styleLoadRun: (() => void) | null = null
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

  const flushReady = () => {
    if (cancelled || !map) return
    if (!map.loaded() && !map.isStyleLoaded()) return
    getProps().onReadyChange?.(true)
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

  // ------------------------------------------------------------- reference

  const syncReferenceMarker = () => {
    if (!map || !mapboxMod) return
    const p = getProps()
    if (p.showReferenceMarker === false) {
      referenceMarker?.remove()
      referenceMarker = null
      return
    }
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

  const flyCamera = (args: {
    center: [number, number]
    zoom: number
    offset: [number, number]
    padding: { top: number; right: number; bottom: number; left: number }
  }) => {
    if (!map) return
    const duration = didInitialCamera ? CAMERA_FLY_MS : 0
    didInitialCamera = true
    map.stop()
    beginProgrammaticMove(duration + 400)
    map.flyTo({
      center: args.center,
      zoom: args.zoom,
      offset: args.offset,
      padding: args.padding,
      duration,
      essential: true,
    })
  }

  /**
   * Search-center camera. Yields to the selection fly while a task is
   * selected or the detail camera is up. Stamps the detail key so Back
   * to search is a real camera change and flyTo runs.
   */
  const syncCamera = () => {
    if (!map) return
    const p = getProps()
    const leftPad = p.leftViewportPadding ?? 48
    const searchKey = `${p.centerLat},${p.centerLng}`
    const cameraMode = p.cameraMode ?? 'browse'

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

    const cameraKey = `${searchKey}|${leftPad}|${p.effectiveSearchRadiusMiles}|${cameraMode}|${viewPaddingSig(p.viewPadding)}`
    if (cameraKey === lastCameraKey) return
    if (cameraMode === 'detail') {
      lastCameraKey = cameraKey
      return
    }
    // Pin-select on browse keeps the search key unconsumed so deselecting
    // does not yank the camera back to the search center.
    if (p.selectedTaskId) return
    lastCameraKey = cameraKey

    flyCamera({
      center: [p.centerLng, p.centerLat],
      zoom: radiusMilesToZoom(p.effectiveSearchRadiusMiles),
      offset: fullscreenCenterOffsetPx(leftPad),
      padding: zeroPadding(),
    })
  }

  // --------------------------------------------------------------- markers

  const clearAllMarkers = () => {
    for (const row of markersById.values()) row.marker.remove()
    markersById.clear()
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

    const pinMode = p.taskPinMode ?? 'all'
    const selectedIdForPins = p.selectedTaskId ?? null
    const withCoords = p.tasks.flatMap((task) => {
      if (pinMode === 'none') return []
      if (pinMode === 'solo' && task.id !== selectedIdForPins) return []
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

  const syncSelection = (force = false) => {
    const selectedId = getProps().selectedTaskId ?? null
    if (!force && selectedId === lastSelectedId) return
    lastSelectedId = selectedId

    for (const row of markersById.values()) {
      const isSelected = row.taskId === selectedId
      row.setSelected(isSelected)
      row.setExpanded(isSelected)
      // Pin tip stays on the true lat/lng — no zone-era lift offset.
      row.marker.setOffset([0, 0])
    }
  }

  /** Always push React's selected id onto pins (deselect must collapse). */
  const applySelectionVisuals = () => {
    syncSelection(true)
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

    const cameraMode = p.cameraMode ?? 'browse'
    const flyKey =
      selectedId && ll
        ? `${selectedId}|${token}|${ll.lat}|${ll.lng}|${leftPad}|${cameraMode}|${viewPaddingSig(p.viewPadding)}`
        : `__none__|${cameraMode}`
    if (flyKey === lastSelectionFlyKey) return
    lastSelectionFlyKey = flyKey
    if (!selectedId || !ll) return

    const detail = cameraMode === 'detail'
    const pad = detail ? (p.viewPadding ?? zeroPadding()) : zeroPadding()
    setShowSearchThisArea(false)
    flyCamera({
      center: [ll.lng, ll.lat],
      zoom: Math.min(
        MAP_MAX_ZOOM,
        Math.max(MAP_MIN_ZOOM, detail ? 14.5 : Math.max(map.getZoom(), 13.5)),
      ),
      offset: detail ? [0, 0] : fullscreenCenterOffsetPx(leftPad),
      padding: {
        top: pad.top ?? 0,
        right: pad.right ?? 0,
        bottom: pad.bottom ?? 0,
        left: pad.left ?? 0,
      },
    })
  }

  // ------------------------------------------------------------------ sync

  const sync = () => {
    if (cancelled || !map) return
    // Not ready yet — the `load` / `style.load` handlers re-schedule.
    if (!map.isStyleLoaded()) return

    flushReady()

    const p = getProps()

    if (p.themeMode && p.themeMode !== lastThemeMode) {
      lastThemeMode = p.themeMode
      // Style swap drops GeoJSON layers; markers are DOM and survive.
      map.setStyle(getStyleUrlForMode(p.themeMode))
      return // style.load handler re-schedules the full sync
    }

    syncReferenceMarker()
    syncCamera()
    syncMarkers()
    applySelectionVisuals()
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
        logoPosition: initial.logoPosition ?? 'bottom-left',
      })
      m.addControl(new mapboxgl.default.NavigationControl(), 'top-right')
      map = m
      unmountFade = mountMapFadeOverlay(m.getContainer())

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
        // Style reload drops GeoJSON layers — re-sync the nav route.
        navRoute.onStyleReload()
        navRoute.flushWhenReady()
        scheduleSync()
      }
      m.on('style.load', styleLoadRun)

      // Flush route applies deferred while the style was busy (tiles loading
      // mid-fly make `isStyleLoaded()` flicker false — the route would
      // otherwise silently never draw). No-op unless a deferral is pending.
      idleRun = () => navRoute.flushWhenReady()
      m.on('idle', idleRun)

      moveEndRun = () => {
        const live = getProps()
        if (!map || !live.onSearchThisAreaConfirm) return
        if (live.cameraMode === 'detail' || live.mapInteractions === false) {
          setShowSearchThisArea(false)
          return
        }
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
        const p = getProps()
        if (p.cameraMode === 'detail' || p.mapInteractions === false) return
        navRoute.clearRoute()
        if (p.selectedTaskId) p.onSelectTask?.(null)
        if (!isNavRoutePresenting) p.onMapClick?.()
      }
      m.on('click', mapClickRun)
    },
  )

  return {
    sync,
    scheduleSync,
    flushReady,
    destroy: () => {
      cancelled = true
      unmountFade?.()
      unmountFade = null
      if (moveEndDebounce) clearTimeout(moveEndDebounce)
      resizeObserver.disconnect()
      if (map && moveEndRun) map.off('moveend', moveEndRun)
      if (map && mapClickRun) map.off('click', mapClickRun)
      if (map && styleLoadRun) map.off('style.load', styleLoadRun)
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
