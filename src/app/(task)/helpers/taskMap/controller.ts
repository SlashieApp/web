import type {
  GeoJSONSource,
  MapMouseEvent,
  Map as MapboxMap,
  Marker,
} from 'mapbox-gl'

import { ensureMapboxStyles } from '@/utils/ensureMapboxStyles'
import { distanceMilesBetween } from '@/utils/geoDistance'

import { MARKETPLACE_MAP_MOTION_MS } from '../marketplaceMap/motion'
import { mountMapFadeOverlay } from '../marketplaceMap/overlay/overlay'
import {
  CLUSTER_SOURCE_ID,
  TASK_STACK_LIMIT,
  type TaskCluster,
  clusterFeatureCollection,
  clusterMarkerElement,
  clusterViewFromFeatures,
  ensureClusterSource,
  shouldOpenTaskStack,
} from './clusters'
import { createCompassControl } from './compass'
import { createTaskMapNavRouteController } from './navRoute'
import {
  PIN_MAPBOX_ANCHOR,
  PIN_MAPBOX_OFFSET,
  referenceMarkerElement,
  taskLngLat,
  taskMarkerElement,
  taskPinContentSig,
} from './pin'
import { pinMotionEnabled } from './pin/animation'
import type { TaskMapPropsSnapshot, TaskMapTask } from './types'

const MAP_MIN_ZOOM = 10
const MAP_MAX_ZOOM = 17
const DEFAULT_MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12'

export const MAX_SEARCH_RADIUS_MILES = 50

/** Shared duration for search ↔ detail and search-center camera moves. */
const CAMERA_FLY_MS = MARKETPLACE_MAP_MOTION_MS
/** Zooming into a tapped cluster. */
const CLUSTER_ZOOM_MS = 500

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
  /** False while the pin is folded into a cluster. */
  onMap: boolean
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
  let lastClusterDataSig: string | null = null
  let lastClusterViewSig = ''
  let stackOpen = false

  // --- map objects
  const markersById = new Map<string, MarkerRow>()
  const clusterMarkers = new Map<number, { marker: Marker; count: number }>()
  let referenceMarker: Marker | null = null
  let moveEndDebounce: ReturnType<typeof setTimeout> | null = null
  let resizeFrameRequested = false

  let moveEndRun: (() => void) | null = null
  let mapClickRun: ((e: MapMouseEvent) => void) | null = null
  let styleLoadRun: (() => void) | null = null
  let idleRun: (() => void) | null = null
  let renderRun: (() => void) | null = null
  let moveStartRun: (() => void) | null = null

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

    // Added by `applyClusterView` once it knows the pin is not in a cluster.
    const marker = new mapboxMod.Marker({
      element: el,
      anchor: PIN_MAPBOX_ANCHOR,
    })
      .setLngLat([lng, lat])
      .setOffset(PIN_MAPBOX_OFFSET)

    return {
      marker,
      onMap: false,
      taskId: task.id,
      markerSig: markerRowSig(task, lat, lng),
      setSelected,
      setExpanded,
    }
  }

  /** Tasks that get a pin in the current pin mode. */
  const pinCandidates = (p: TaskMapPropsSnapshot) => {
    const pinMode = p.taskPinMode ?? 'all'
    const selectedIdForPins = p.selectedTaskId ?? null
    return p.tasks.flatMap((task) => {
      if (pinMode === 'none') return []
      if (pinMode === 'solo' && task.id !== selectedIdForPins) return []
      const ll = taskLngLat(task)
      return ll ? [{ task, ...ll }] : []
    })
  }

  /** Diff task markers against props; synchronous and signature-guarded. */
  const syncMarkers = () => {
    if (!map || !mapboxMod) return
    const p = getProps()
    if (!(p.visible ?? true) || !(p.tasksLoaded ?? true)) return

    const withCoords = pinCandidates(p)

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
    if (structureChanged) {
      syncSelection(true)
      lastClusterViewSig = ''
    }
  }

  // -------------------------------------------------------------- clusters

  const setRowOnMap = (row: MarkerRow, on: boolean) => {
    if (!map || row.onMap === on) return
    row.onMap = on
    if (on) row.marker.addTo(map)
    else row.marker.remove()
  }

  const clearClusterMarkers = () => {
    for (const entry of clusterMarkers.values()) entry.marker.remove()
    clusterMarkers.clear()
  }

  /**
   * Feeds browse pins into the clustered source. The selected task stays
   * out so it always shows as its own pin.
   */
  const syncClusterData = () => {
    if (!map) return
    const p = getProps()
    if (!(p.visible ?? true) || !(p.tasksLoaded ?? true)) return
    const selectedId = p.selectedTaskId ?? null
    const points =
      (p.taskPinMode ?? 'all') === 'all'
        ? pinCandidates(p).flatMap(({ task, lat, lng }) =>
            task.id === selectedId ? [] : [{ id: task.id, lat, lng }],
          )
        : []
    const sig = points.map((pt) => `${pt.id}:${pt.lat},${pt.lng}`).join('|')
    if (sig === lastClusterDataSig) return
    lastClusterDataSig = sig
    lastClusterViewSig = ''
    ensureClusterSource(map, MAP_MAX_ZOOM).setData(
      clusterFeatureCollection(points),
    )
  }

  /**
   * Shows pins that are on their own at this zoom and a count bubble per
   * cluster. Runs every frame, so it bails on an unchanged view.
   */
  const applyClusterView = () => {
    if (!map || !mapboxMod) return
    const p = getProps()
    const selectedId = p.selectedTaskId ?? null

    if ((p.taskPinMode ?? 'all') !== 'all') {
      for (const row of markersById.values()) setRowOnMap(row, true)
      clearClusterMarkers()
      lastClusterViewSig = ''
      return
    }
    if (
      !map.getSource(CLUSTER_SOURCE_ID) ||
      !map.isSourceLoaded(CLUSTER_SOURCE_ID)
    ) {
      return
    }

    const view = clusterViewFromFeatures(
      map.querySourceFeatures(CLUSTER_SOURCE_ID),
    )
    const viewSig = [
      selectedId ?? '',
      [...view.loose].sort().join(','),
      view.clusters
        .map((c) => `${c.id}:${c.count}`)
        .sort()
        .join(','),
    ].join('|')
    if (viewSig === lastClusterViewSig) return
    lastClusterViewSig = viewSig

    for (const row of markersById.values()) {
      setRowOnMap(row, row.taskId === selectedId || view.loose.has(row.taskId))
    }

    const nextIds = new Set(view.clusters.map((c) => c.id))
    for (const [id, entry] of clusterMarkers) {
      if (nextIds.has(id)) continue
      entry.marker.remove()
      clusterMarkers.delete(id)
    }
    for (const cluster of view.clusters) {
      const existing = clusterMarkers.get(cluster.id)
      if (existing?.count === cluster.count) continue
      existing?.marker.remove()
      const marker = new mapboxMod.Marker({
        element: clusterMarkerElement(cluster.count, () =>
          openCluster(cluster),
        ),
        anchor: 'center',
      })
        .setLngLat([cluster.lng, cluster.lat])
        .addTo(map)
      clusterMarkers.set(cluster.id, { marker, count: cluster.count })
    }
  }

  /** Zoom to where the cluster splits, or list it when it never will. */
  const openCluster = (cluster: TaskCluster) => {
    const m = map
    const p = getProps()
    if (!m || p.mapInteractions === false) return
    const source = m.getSource(CLUSTER_SOURCE_ID) as GeoJSONSource | undefined
    if (!source) return

    source.getClusterExpansionZoom(cluster.id, (err, zoom) => {
      if (cancelled || map !== m || err || zoom == null) return

      if (shouldOpenTaskStack(zoom, m.getZoom(), MAP_MAX_ZOOM)) {
        source.getClusterLeaves(
          cluster.id,
          TASK_STACK_LIMIT,
          0,
          (leafErr, leaves) => {
            if (cancelled || map !== m || leafErr || !leaves) return
            const taskIds = leaves.flatMap((leaf) => {
              const id = leaf.properties?.id
              return typeof id === 'string' ? [id] : []
            })
            const point = m.project([cluster.lng, cluster.lat])
            stackOpen = true
            getProps().onOpenTaskStack?.({ taskIds, x: point.x, y: point.y })
          },
        )
        return
      }

      const duration = pinMotionEnabled() ? CLUSTER_ZOOM_MS : 0
      beginProgrammaticMove(duration + 400)
      m.flyTo({
        center: [cluster.lng, cluster.lat],
        zoom: Math.min(zoom, MAP_MAX_ZOOM),
        offset: fullscreenCenterOffsetPx(getProps().leftViewportPadding ?? 48),
        duration,
        essential: true,
      })
    })
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
      row.marker.setOffset(PIN_MAPBOX_OFFSET)
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
    syncClusterData()
    applyClusterView()
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
      m.addControl(
        new mapboxgl.default.NavigationControl({ showCompass: false }),
        'top-right',
      )
      m.addControl(createCompassControl(), 'top-right')
      map = m
      unmountFade = mountMapFadeOverlay(m.getContainer())

      m.once('load', () => {
        if (cancelled) return
        m.resize()
        requestAnimationFrame(() => m.resize())
        getProps().onReadyChange?.(true)
        const c = m.getCenter()
        getProps().onCenterChange?.(c.lat, c.lng)
        navRoute.flushWhenReady()
        scheduleSync()
      })

      styleLoadRun = () => {
        if (cancelled) return
        // Style reload drops the cluster source; re-add it on the next sync.
        lastClusterDataSig = null
        lastClusterViewSig = ''
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

      // Clusters split and merge as the zoom changes, frame by frame.
      renderRun = () => applyClusterView()
      m.on('render', renderRun)

      // The same-spot list belongs to where the map was; moving closes it.
      moveStartRun = () => {
        if (!stackOpen) return
        stackOpen = false
        getProps().onOpenTaskStack?.(null)
      }
      m.on('movestart', moveStartRun)

      moveEndRun = () => {
        const live = getProps()
        if (map && live.onCenterChange) {
          const c = map.getCenter()
          live.onCenterChange(c.lat, c.lng)
        }
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
      if (map && renderRun) map.off('render', renderRun)
      if (map && moveStartRun) map.off('movestart', moveStartRun)
      navRoute.destroy()
      clearAllMarkers()
      clearClusterMarkers()
      referenceMarker?.remove()
      referenceMarker = null
      map?.remove()
      map = null
      mapboxMod = null
      getProps().onReadyChange?.(false)
    },
  }
}
