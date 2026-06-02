import type { MapMouseEvent, Map as MapboxMap, Marker } from 'mapbox-gl'

import {
  referenceMarkerElement,
  taskLngLat,
  taskMarkerElement,
  taskPinContentSig,
  tasksCoordsSig,
  tasksMarkerSig,
} from './pin'
import type { TaskMapPropsSnapshot } from './types'

import { distanceMilesBetween } from '@/utils/geoDistance'

import { createTaskMapNavRouteController } from './navRoute'

const MAP_MIN_ZOOM = 10
const MAP_MAX_ZOOM = 17
const DEFAULT_MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12'

function bumpMapResize(map: MapboxMap) {
  map.resize()
  requestAnimationFrame(() => map.resize())
}

function fullscreenCenterOffsetPx(
  leftViewportPadding: number,
): [number, number] {
  return [Math.max(0, (leftViewportPadding - 120) / 2), 0]
}

function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number) {
  return distanceMilesBetween(lat1, lng1, lat2, lng2)
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
  destroy: () => void
  scheduleSync: () => void
}

export function createTaskMapController(args: {
  container: HTMLDivElement
  accessToken: string
  getProps: () => TaskMapPropsSnapshot
  getSelectTask: () => TaskMapPropsSnapshot['onSelectTask']
  getSelectedTaskId: () => string | null
  getIsNavRoutePresenting: () => boolean
  onNavRoutePresentingChange?: (presenting: boolean) => void
  setShowSearchThisArea: (v: boolean) => void
  getShowSearchThisArea: () => boolean
}): TaskMapController {
  const {
    getProps,
    getSelectTask,
    getSelectedTaskId,
    setShowSearchThisArea,
    getShowSearchThisArea,
  } = args

  let cancelled = false
  let map: MapboxMap | null = null
  let mapboxMod: typeof import('mapbox-gl').default | null = null
  let referenceMarker: Marker | null = null
  const markersById = new Map<string, MarkerRow>()
  let moveEndDebounce: ReturnType<typeof setTimeout> | null = null
  let pendingView: { lat: number; lng: number } | null = null
  let programmaticMove = false
  let suppressSearchPromptUntil = 0
  let prevSearchCenterKey: string | null = null
  let didApplyStartupOffset = false
  let prevVisible = false
  let moveEndRun: (() => void) | null = null
  let mapClickRun: ((e: MapMouseEvent) => void) | null = null
  let styleLoadRun: (() => void) | null = null
  let resizeFrameRequested = false

  let lastQueryCenterKey = ''
  let lastMarkerSig = ''
  let lastCoordsSig = ''
  let lastSelectionFlyKey = ''
  let lastSyncedRouteKey = ''
  let lastPinSelectedKey = ''
  let lastSearchThisAreaUiSig: string | null = null
  let lastThemeMode: 'light' | 'dark' | null = null
  let markerSyncGeneration = 0
  let syncQueued = false
  let pendingSyncWhileStyleLoading = false
  const navRoute = createTaskMapNavRouteController({
    getMap: () => map,
    getAccessToken: () => args.accessToken,
    getSearchCenter: () => {
      const p = getProps()
      return { lat: p.centerLat, lng: p.centerLng }
    },
    onNavRoutePresentingChange: args.onNavRoutePresentingChange,
  })

  const lightStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE_LIGHT?.trim()
  const darkStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE_DARK?.trim()

  const getStyleUrlForMode = (mode: 'light' | 'dark' | null | undefined) => {
    if (mode === 'dark') return darkStyle || DEFAULT_MAPBOX_STYLE
    if (mode === 'light') return lightStyle || DEFAULT_MAPBOX_STYLE
    return DEFAULT_MAPBOX_STYLE
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

  const scheduleSync = () => {
    if (syncQueued) return
    syncQueued = true
    queueMicrotask(() => {
      syncQueued = false
      sync()
    })
  }

  const clearAllMarkers = () => {
    for (const row of markersById.values()) row.marker.remove()
    markersById.clear()
  }

  const applyMarkerSelection = (selectedId: string | null) => {
    lastPinSelectedKey = selectedId ?? ''
    for (const row of markersById.values()) {
      const isSel = row.taskId === selectedId
      row.setSelected(isSel)
      row.setExpanded(isSel)
    }
  }

  const handleSearchThisAreaButtonClick = () => {
    const pr = getProps()
    const pv = pendingView
    if (!pv || !pr.onSearchThisAreaConfirm || !map) return
    const zoom = map.getZoom() ?? 11
    pr.onSearchThisAreaConfirm(pv.lat, pv.lng, zoom)
    setShowSearchThisArea(false)
    pendingView = null
    scheduleSync()
  }

  const syncReferenceMarker = () => {
    if (!map?.isStyleLoaded() || !mapboxMod) return
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

  const createMarkerForTask = (
    task: TaskMapPropsSnapshot['tasks'][number],
    lat: number,
    lng: number,
  ) => {
    if (!map || !mapboxMod) return null

    const { el, setSelected, setExpanded } = taskMarkerElement(
      task,
      false,
      () =>
        queueMicrotask(() => {
          if (args.getIsNavRoutePresenting()) return
          getSelectTask()?.(task.id)
        }),
    )

    const marker = new mapboxMod.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat([lng, lat])
      .addTo(map)

    return {
      marker,
      taskId: task.id,
      markerSig: `${task.id}:${lat},${lng}:${taskPinContentSig(task)}`,
      setSelected,
      setExpanded,
    } satisfies MarkerRow
  }

  const syncMarkers = () => {
    if (!map?.isStyleLoaded() || !mapboxMod) {
      pendingSyncWhileStyleLoading = true
      return
    }
    pendingSyncWhileStyleLoading = false

    const p = getProps()
    if (!(p.visible ?? true) || !(p.tasksLoaded ?? true)) return

    syncReferenceMarker()

    const withCoords = p.tasks
      .map((t) => {
        const ll = taskLngLat(t)
        return ll ? { task: t, ...ll } : null
      })
      .filter((x): x is NonNullable<typeof x> => x != null)

    const markerSig = `${tasksMarkerSig(p.tasks)}|${p.visible ?? true}|${p.tasksLoaded ?? true}`
    if (markerSig === lastMarkerSig) return

    const coordsSig = tasksCoordsSig(p.tasks)
    const coordsChanged = coordsSig !== lastCoordsSig
    lastMarkerSig = markerSig
    lastCoordsSig = coordsSig

    const generation = ++markerSyncGeneration
    requestAnimationFrame(() => {
      if (
        cancelled ||
        generation !== markerSyncGeneration ||
        !map?.isStyleLoaded() ||
        !mapboxMod
      ) {
        return
      }

      const mod = mapboxMod

      const nextIds = new Set(withCoords.map((row) => row.task.id))
      for (const [taskId, row] of markersById) {
        if (!nextIds.has(taskId)) {
          row.marker.remove()
          markersById.delete(taskId)
        }
      }

      for (const { task, lat, lng } of withCoords) {
        const nextRowSig = `${task.id}:${lat},${lng}:${taskPinContentSig(task)}`
        const existing = markersById.get(task.id)
        if (existing?.markerSig === nextRowSig) continue

        existing?.marker.remove()
        const created = createMarkerForTask(task, lat, lng)
        if (created) markersById.set(task.id, created)
      }

      const leftPad = p.leftViewportPadding ?? 48
      const fitPadding = {
        top: 80,
        right: 80,
        bottom: 80,
        left: Math.max(80, leftPad),
      }

      if (coordsChanged && withCoords.length > 0) {
        const b = new mod.LngLatBounds()
        for (const row of withCoords) b.extend([row.lng, row.lat])
        b.extend([p.centerLng, p.centerLat])
        map.fitBounds(b, {
          padding: fitPadding,
          maxZoom: MAP_MAX_ZOOM,
          duration: 500,
        })
      } else if (coordsChanged && withCoords.length === 0) {
        map.easeTo({
          center: [p.centerLng, p.centerLat],
          zoom: 11,
          duration: 400,
          offset: fullscreenCenterOffsetPx(leftPad),
        })
      }

      applyMarkerSelection(getSelectedTaskId())
    })
  }

  const syncCamera = () => {
    if (!map?.isStyleLoaded()) return
    const p = getProps()
    const leftPad = p.leftViewportPadding ?? 48

    const searchKey = `${p.centerLat},${p.centerLng}`
    if (prevSearchCenterKey !== searchKey) {
      if (prevSearchCenterKey !== null) {
        setShowSearchThisArea(false)
        pendingView = null
        suppressSearchPromptUntil = Date.now() + 1600
        navRoute.refreshForSearchCenter()
      }
      prevSearchCenterKey = searchKey
    }

    const queryCenterKey = `${p.centerLat}|${p.centerLng}|${leftPad}`
    if (queryCenterKey !== lastQueryCenterKey) {
      lastQueryCenterKey = queryCenterKey
      syncReferenceMarker()
      const c = map.getCenter()
      const geoMatch =
        Math.abs(c.lat - p.centerLat) < 5e-5 &&
        Math.abs(c.lng - p.centerLng) < 5e-5

      if (geoMatch) {
        map.easeTo({
          center: [p.centerLng, p.centerLat],
          duration: 0,
          offset: fullscreenCenterOffsetPx(leftPad),
        })
      } else {
        programmaticMove = true
        map.easeTo({
          center: [p.centerLng, p.centerLat],
          duration: 450,
          offset: fullscreenCenterOffsetPx(leftPad),
        })
        map.once('moveend', () => {
          programmaticMove = false
        })
      }
    }

    if ((p.visible ?? true) && !prevVisible) {
      requestAnimationFrame(() => {
        if (map) bumpMapResize(map)
      })
    }
    prevVisible = p.visible ?? true

    if ((p.visible ?? true) && !didApplyStartupOffset) {
      requestAnimationFrame(() => {
        if (!map?.isStyleLoaded()) return
        map.easeTo({
          center: [p.centerLng, p.centerLat],
          duration: 0,
          offset: fullscreenCenterOffsetPx(leftPad),
        })
        didApplyStartupOffset = true
      })
    }
  }

  const syncSelectionFly = () => {
    if (!map?.isStyleLoaded()) return
    const p = getProps()
    const leftPad = p.leftViewportPadding ?? 48
    const selectedId = p.selectedTaskId ?? null

    const selectedTask = selectedId
      ? p.tasks.find((t) => t.id === selectedId)
      : null
    const selLl = selectedTask ? taskLngLat(selectedTask) : null
    const selectionFlyKey =
      selectedId && selLl
        ? `${selectedId}|${selLl.lat}|${selLl.lng}|${leftPad}`
        : `__none__|${leftPad}`

    const routeSyncKey = selectedId
      ? `${selectedId}|${p.selectedTaskSelectionToken ?? 0}`
      : ''
    if (routeSyncKey !== lastSyncedRouteKey) {
      lastSyncedRouteKey = routeSyncKey
      if (selectedId && selLl) {
        navRoute.setSelectedRoute({ lng: selLl.lng, lat: selLl.lat })
      } else {
        navRoute.setSelectedRoute(null)
      }
    }

    if (selectionFlyKey === lastSelectionFlyKey) {
      const pinKey = selectedId ?? ''
      if (pinKey !== lastPinSelectedKey) applyMarkerSelection(selectedId)
      return
    }

    lastSelectionFlyKey = selectionFlyKey

    if (selectedId && selectedTask && selLl) {
      map.stop()
      programmaticMove = true
      suppressSearchPromptUntil = Date.now() + 1200
      setShowSearchThisArea(false)
      map.flyTo({
        center: [selLl.lng, selLl.lat],
        zoom: Math.min(
          MAP_MAX_ZOOM,
          Math.max(MAP_MIN_ZOOM, Math.max(map.getZoom(), 13.5)),
        ),
        offset: fullscreenCenterOffsetPx(leftPad),
        duration: 320,
        essential: true,
      })
      map.once('moveend', () => {
        programmaticMove = false
      })
    }

    applyMarkerSelection(selectedId)
  }

  const syncSearchUi = () => {
    const p = getProps()
    const nextVisible = Boolean(getShowSearchThisArea() && (p.visible ?? true))
    const nextEnabled = Boolean(p.onSearchThisAreaConfirm)
    const nextPosition = p.searchAreaButtonPosition ?? ''
    const nextLeftInset = p.searchAreaButtonLeftInset ?? ''
    const nextOffsetX = p.searchAreaButtonOffsetX ?? '0px'
    const uiSig = `${nextVisible}|${nextEnabled}|${nextPosition}|${nextLeftInset}|${nextOffsetX}`

    if (uiSig === lastSearchThisAreaUiSig) return
    lastSearchThisAreaUiSig = uiSig
    p.onSearchThisAreaUiChange?.({
      visible: nextVisible,
      enabled: nextEnabled,
      position: p.searchAreaButtonPosition,
      leftInset: p.searchAreaButtonLeftInset,
      offsetX: p.searchAreaButtonOffsetX,
      onClick: handleSearchThisAreaButtonClick,
    })
  }

  const sync = () => {
    if (!map) return

    if (!map.isStyleLoaded()) {
      pendingSyncWhileStyleLoading = true
      return
    }

    const p = getProps()

    if (p.themeMode && p.themeMode !== lastThemeMode) {
      lastThemeMode = p.themeMode
      clearAllMarkers()
      lastMarkerSig = ''
      lastCoordsSig = ''
      map.setStyle(getStyleUrlForMode(p.themeMode))
      pendingSyncWhileStyleLoading = true
      return
    }

    syncCamera()
    syncMarkers()
    syncSelectionFly()
    syncSearchUi()
  }

  void import('mapbox-gl').then((mapboxgl) => {
    if (cancelled || !args.container) return
    mapboxgl.default.accessToken = args.accessToken
    mapboxMod = mapboxgl.default

    const styleUrl = getStyleUrlForMode(getProps().themeMode)
    lastThemeMode = getProps().themeMode

    const m = new mapboxgl.default.Map({
      container: args.container,
      style: styleUrl,
      center: [getProps().centerLng, getProps().centerLat],
      zoom: 11,
      minZoom: MAP_MIN_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
    })

    m.addControl(new mapboxgl.default.NavigationControl(), 'top-right')
    map = m

    styleLoadRun = () => {
      if (cancelled) return
      if (pendingSyncWhileStyleLoading) pendingSyncWhileStyleLoading = false
      navRoute.onStyleReload()
      navRoute.flushWhenReady()
      scheduleSync()
    }

    m.on('load', () => {
      if (cancelled) return
      bumpMapResize(m)
      getProps().onReadyChange?.(true)
      navRoute.flushWhenReady()
      scheduleSync()
    })

    m.on('style.load', styleLoadRun)

    moveEndRun = () => {
      if (!map || !getProps().onSearchThisAreaConfirm) return
      if (moveEndDebounce) clearTimeout(moveEndDebounce)
      moveEndDebounce = setTimeout(() => {
        if (cancelled) return
        if (programmaticMove) return
        if (Date.now() < suppressSearchPromptUntil) {
          setShowSearchThisArea(false)
          scheduleSync()
          return
        }
        const mm = map
        if (!mm) return
        const cc = mm.getCenter()
        const pr = getProps()
        const movedOutsideSearchArea =
          distanceMiles(pr.centerLat, pr.centerLng, cc.lat, cc.lng) >
          pr.effectiveSearchRadiusMiles
        if (movedOutsideSearchArea) {
          pendingView = { lat: cc.lat, lng: cc.lng }
          setShowSearchThisArea(true)
        } else {
          pendingView = null
          setShowSearchThisArea(false)
        }
        scheduleSync()
      }, 400)
    }
    m.on('moveend', moveEndRun)

    mapClickRun = (e: MapMouseEvent) => {
      const target = e.originalEvent?.target
      if (target instanceof Element && target.closest('.mapboxgl-marker')) {
        return
      }
      if (args.getIsNavRoutePresenting()) return
      navRoute.clearRoute()
      if (getSelectedTaskId()) getSelectTask()?.(null)
      getProps().onMapClick?.()
    }
    m.on('click', mapClickRun)
  })

  return {
    scheduleSync,
    sync,
    destroy: () => {
      cancelled = true
      markerSyncGeneration += 1
      if (moveEndDebounce) clearTimeout(moveEndDebounce)
      resizeObserver.disconnect()
      if (map && moveEndRun) map.off('moveend', moveEndRun)
      if (map && mapClickRun) map.off('click', mapClickRun)
      if (map && styleLoadRun) map.off('style.load', styleLoadRun)
      navRoute.destroy()
      clearAllMarkers()
      referenceMarker?.remove()
      referenceMarker = null
      map?.remove()
      map = null
      mapboxMod = null
      lastSearchThisAreaUiSig = null
      getProps().onReadyChange?.(false)
    },
  }
}

export const MAX_SEARCH_RADIUS_MILES = 50
