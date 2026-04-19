'use client'

import { Box, Text } from '@chakra-ui/react'
import type { Map as MapboxMap, Marker } from 'mapbox-gl'
import { useCallback, useRef, useState } from 'react'

import { useColorMode } from '@/ui/color-mode'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
  useTaskMapBindings,
} from '../context/TaskBrowseProvider'

import type { SearchThisAreaButtonProps } from './SearchThisAreaButton'

import 'mapbox-gl/dist/mapbox-gl.css'

export type TaskMapTask = {
  id: string
  title: string
  description?: string | null
  category?: string | null
  location?: string | null
  locationLat?: number | null
  locationLng?: number | null
  /** Shown on the map pin (e.g. £65). */
  priceLabel?: string | null
  /** Short line for popup (e.g. budget). */
  detailLine?: string | null
}

export type TaskMapProps = {
  accessToken: string | undefined
  centerLat: number
  centerLng: number
  radiusMiles: number
  tasks: TaskMapTask[]
  /**
   * When false, the map may be `display:none` (e.g. mobile list tab). Toggle to
   * true so Mapbox can `resize()` after becoming visible.
   */
  visible?: boolean
  /** Wait for data before fitting markers / bounds (avoids empty-first sync). */
  tasksLoaded?: boolean
  /** Extra left padding (px) for fitBounds in fullscreen (floating list panel). */
  leftViewportPadding?: number
  /** Called when the user taps “Search this area” after panning the map. */
  onSearchThisAreaConfirm?: (lat: number, lng: number, zoom: number) => void
  /**
   * Horizontal inset of the left task list (margin + width). When set, the
   * button is centered in the map pane: `calc(50% + ${inset} / 2)`.
   */
  searchAreaButtonLeftInset?: string
  /** Position of the “Search this area” button overlay. */
  searchAreaButtonPosition?: 'top' | 'bottom'
  /** Horizontal offset applied from the centered button anchor. */
  searchAreaButtonOffsetX?: string
  /** Called when the base map surface is clicked. */
  onMapClick?: () => void
  /** Emits map style readiness state for parent loading orchestration. */
  onReadyChange?: (ready: boolean) => void
  selectedTaskId?: string | null
  onSelectTask?: (taskId: string | null) => void
  onSearchThisAreaUiChange?: (ui: SearchThisAreaButtonProps) => void
}

type TaskMapPropsSnapshot = TaskMapProps & {
  effectiveSearchRadiusMiles: number
  themeMode: 'light' | 'dark'
}

function bumpMapResize(map: MapboxMap) {
  map.resize()
  requestAnimationFrame(() => {
    map.resize()
    requestAnimationFrame(() => {
      map.resize()
    })
  })
}

/** Shifts the camera so the geographic center sits in the visible map pane when a left column covers part of the viewport (matches flyTo selected-task behavior). */
function fullscreenCenterOffsetPx(
  leftViewportPadding: number,
): [number, number] {
  return [Math.max(0, (leftViewportPadding - 120) / 2), 0]
}

/** After `map.resize()`, re-apply pixel offset so the framing stays correct (same geo center, updated inset). */
function reapplyMapCenterOffsetForLeftInset(
  map: MapboxMap,
  leftViewportPadding: number,
) {
  if (!map.isStyleLoaded()) return
  const c = map.getCenter()
  map.easeTo({
    center: [c.lng, c.lat],
    zoom: map.getZoom(),
    duration: 0,
    bearing: map.getBearing(),
    pitch: map.getPitch(),
    offset: fullscreenCenterOffsetPx(leftViewportPadding),
  })
}

function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 3958.8
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const POPUP_DESC_MAX = 240
const MAX_SEARCH_RADIUS_MILES = 50
const MAP_MIN_ZOOM = 10
const MAP_MAX_ZOOM = 17
const DEFAULT_MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12'

function truncateDescription(text: string, max: number): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, Math.max(0, max - 1)).trim()}…`
}

/** GraphQL / JSON often returns coordinates as strings; Mapbox needs finite numbers. */
function parseCoord(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number.parseFloat(value.trim())
    return Number.isFinite(n) ? n : null
  }
  return null
}

function taskLngLat(task: TaskMapTask): { lng: number; lat: number } | null {
  const lat = parseCoord(task.locationLat)
  const lng = parseCoord(task.locationLng)
  if (lat == null || lng == null) return null
  return { lat, lng }
}

/** Price for the always-visible pill; falls back to detailLine before `·`. */
function pinPriceText(task: TaskMapTask): string {
  const p = task.priceLabel?.trim()
  if (p) return p
  const line = (task.detailLine ?? '').trim()
  if (!line) return '—'
  const head = line.split('·')[0]?.trim()
  return head || line
}

function taskMarkerElement(
  task: TaskMapTask,
  selected: boolean,
  onClearActiveSelection: () => void,
): {
  el: HTMLDivElement
  setSelected: (v: boolean) => void
  setExpanded: (v: boolean) => void
} {
  const root = document.createElement('div')
  root.setAttribute('role', 'button')
  root.tabIndex = 0
  Object.assign(root.style, {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '5px',
    padding: '0',
    margin: '0',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  })

  const card = document.createElement('div')
  const ring = document.createElement('span')
  ring.setAttribute('aria-hidden', 'true')

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('width', '14')
  svg.setAttribute('height', '14')
  svg.setAttribute('fill', 'none')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute(
    'd',
    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.36 6.36a2.83 2.83 0 1 1-4-4l6.36-6.36a6 6 0 0 1 7.94-7.94l-3.77 3.77Z',
  )
  path.setAttribute('stroke', '#ffffff')
  path.setAttribute('stroke-width', '1.75')
  path.setAttribute('stroke-linejoin', 'round')
  svg.appendChild(path)
  ring.appendChild(svg)

  root.appendChild(card)
  root.appendChild(ring)

  const priceRow = document.createElement('div')
  priceRow.textContent = pinPriceText(task)
  const detailsWrap = document.createElement('div')
  const cat = (task.category ?? '').trim()
  const detail = (task.detailLine ?? '').trim()
  const rawDesc = (task.description ?? '').trim()
  const desc =
    rawDesc.length > 0 ? truncateDescription(rawDesc, POPUP_DESC_MAX) : ''

  if (cat) {
    const catEl = document.createElement('div')
    catEl.textContent = cat
    Object.assign(catEl.style, {
      fontSize: '10px',
      fontWeight: '700',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: '#64748b',
      marginBottom: '4px',
    })
    detailsWrap.appendChild(catEl)
  }
  const titleEl = document.createElement('div')
  titleEl.textContent = task.title
  Object.assign(titleEl.style, {
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '6px',
    fontSize: '16px',
  })
  detailsWrap.appendChild(titleEl)
  if (detail) {
    const detailEl = document.createElement('div')
    detailEl.textContent = detail
    Object.assign(detailEl.style, {
      color: '#1e293b',
      fontSize: '12px',
      fontWeight: '600',
      marginBottom: '6px',
    })
    detailsWrap.appendChild(detailEl)
  }
  if (desc) {
    const descEl = document.createElement('div')
    descEl.textContent = desc
    Object.assign(descEl.style, {
      color: '#475569',
      fontSize: '12px',
      lineHeight: '1.45',
    })
    detailsWrap.appendChild(descEl)
  }
  const cta = document.createElement('a')
  cta.href = `/task/${task.id}`
  cta.textContent = 'View details'
  cta.addEventListener('click', (e) => e.stopPropagation())
  Object.assign(cta.style, {
    display: 'inline-block',
    marginTop: '12px',
    padding: '9px 16px',
    background: 'linear-gradient(95deg,#003fb1 0%,#1a56db 100%)',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '999px',
    fontWeight: '600',
    fontSize: '13px',
    boxShadow: '0 1px 4px rgba(15,23,42,0.2)',
  })
  detailsWrap.appendChild(cta)

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.setAttribute('aria-label', 'Close task details')
  closeBtn.textContent = '×'
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    expanded = false
    if (isSelected) onClearActiveSelection()
    apply()
  })
  Object.assign(closeBtn.style, {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '24px',
    height: '24px',
    border: 'none',
    borderRadius: '999px',
    background: '#f8fafc',
    color: '#334155',
    fontSize: '16px',
    lineHeight: '24px',
    cursor: 'pointer',
    opacity: '0',
    pointerEvents: 'none',
  })

  card.appendChild(priceRow)
  card.appendChild(detailsWrap)
  card.appendChild(closeBtn)

  let isSelected = selected
  let expanded = false
  let isHovered = false
  const apply = () => {
    const isSel = isSelected
    const isExpanded = expanded || isSel
    const dotPx = isSel ? 30 : 26
    const zIndex = isHovered && expanded ? '3' : isExpanded ? '2' : '1'
    Object.assign(root.style, {
      zIndex,
    })
    Object.assign(card.style, {
      display: 'block',
      background: '#ffffff',
      color: '#1A56DB',
      fontWeight: '700',
      fontSize: '12px',
      lineHeight: '1.2',
      padding: isExpanded ? '12px 12px 10px' : '4px 10px',
      borderRadius: isExpanded ? '14px' : '999px',
      boxShadow: '0 1px 4px rgba(15,23,42,0.2)',
      whiteSpace: isExpanded ? 'normal' : 'nowrap',
      width: isExpanded ? '260px' : 'auto',
      maxWidth: isExpanded ? '260px' : 'none',
      minHeight: isExpanded ? '140px' : '26px',
      overflow: 'hidden',
      textOverflow: isExpanded ? 'clip' : 'ellipsis',
      border: isSel ? '2px solid #ea580c' : '1px solid rgba(226,232,240,0.9)',
      transition:
        'min-height 0.2s ease, border-radius 0.2s ease, padding 0.2s ease',
    })
    Object.assign(priceRow.style, {
      display: isExpanded ? 'none' : 'block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    })
    Object.assign(detailsWrap.style, {
      display: isExpanded ? 'block' : 'none',
    })
    Object.assign(closeBtn.style, {
      opacity: isExpanded ? '1' : '0',
      pointerEvents: isExpanded ? 'auto' : 'none',
    })
    Object.assign(ring.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: `${dotPx}px`,
      height: `${dotPx}px`,
      borderRadius: '50%',
      background: isSel ? '#ea580c' : '#1A56DB',
      border: '3px solid #ffffff',
      boxShadow: isSel
        ? '0 2px 10px rgba(234,88,12,0.45)'
        : '0 1px 4px rgba(0,0,0,0.25)',
    })
  }

  apply()

  root.addEventListener('mouseenter', () => {
    isHovered = true
    apply()
  })
  root.addEventListener('mouseleave', () => {
    isHovered = false
    apply()
  })

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      root.click()
    }
  })

  return {
    el: root,
    setSelected: (v: boolean) => {
      isSelected = v
      apply()
    },
    setExpanded: (v: boolean) => {
      expanded = v
      apply()
    },
  }
}

type MarkerRow = {
  marker: Marker
  taskId: string
  setSelected: (v: boolean) => void
  setExpanded: (v: boolean) => void
}

type TaskMapController = {
  sync: () => void
  destroy: () => void
  scheduleSync: () => void
}

function createTaskMapController(args: {
  container: HTMLDivElement
  accessToken: string
  getProps: () => TaskMapPropsSnapshot
  getSelectTask: () => TaskMapProps['onSelectTask']
  getSelectedTaskId: () => string | null
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
  const markersRef: MarkerRow[] = []
  let moveEndDebounce: ReturnType<typeof setTimeout> | null = null
  let pendingView: { lat: number; lng: number } | null = null
  let programmaticMove = false
  let suppressSearchPromptUntil = 0
  let prevSearchCenterKey: string | null = null
  let didApplyStartupOffset = false
  let prevTasksSig = ''
  let prevVisible = false
  let moveEndRun: (() => void) | null = null
  let mapClickRun: (() => void) | null = null
  let resizeFrameRequested = false

  let lastQueryCenterKey = ''
  let lastMarkerFrameKey = ''
  let lastSelectionFlyKey = ''
  let lastPinSelectedKey = ''
  let lastSearchThisAreaUiSig: string | null = null
  let lastThemeMode: 'light' | 'dark' | null = null

  const lightStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE_LIGHT?.trim()
  const darkStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE_DARK?.trim()

  const getStyleUrlForMode = (mode: 'light' | 'dark' | null | undefined) => {
    if (mode === 'dark') {
      return darkStyle || DEFAULT_MAPBOX_STYLE
    }
    if (mode === 'light') {
      return lightStyle || DEFAULT_MAPBOX_STYLE
    }
    return DEFAULT_MAPBOX_STYLE
  }

  const scheduleResizeAndRecenter = () => {
    if (resizeFrameRequested) return
    resizeFrameRequested = true
    requestAnimationFrame(() => {
      resizeFrameRequested = false
      if (!map || cancelled) return
      map.resize()
      if (programmaticMove) return
      if (!(getProps().visible ?? true)) return
      reapplyMapCenterOffsetForLeftInset(
        map,
        getProps().leftViewportPadding ?? 48,
      )
    })
  }

  const resizeObserver = new ResizeObserver(() => {
    scheduleResizeAndRecenter()
  })
  resizeObserver.observe(args.container)

  let syncQueued = false
  const scheduleSync = () => {
    if (syncQueued) return
    syncQueued = true
    queueMicrotask(() => {
      syncQueued = false
      sync()
    })
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

  const syncMarkersAndBounds = () => {
    if (!map?.isStyleLoaded() || !mapboxMod) return
    const p = getProps()
    if (!(p.visible ?? true) || !(p.tasksLoaded ?? true)) return

    bumpMapResize(map)

    for (const { marker } of markersRef) marker.remove()
    markersRef.length = 0

    const withCoords = p.tasks
      .map((t) => {
        const ll = taskLngLat(t)
        return ll ? { task: t, ...ll } : null
      })
      .filter((x): x is NonNullable<typeof x> => x != null)

    const runAddMarkersAndBounds = () => {
      const current = map
      if (!current?.isStyleLoaded() || !mapboxMod) return

      const leftPad = p.leftViewportPadding ?? 48

      for (const { task, lat, lng } of withCoords) {
        const { el, setSelected, setExpanded } = taskMarkerElement(
          task,
          false,
          () => getSelectTask()?.(null),
        )
        el.setAttribute(
          'aria-label',
          `${task.title}, ${pinPriceText(task)}. Select to highlight in list.`,
        )
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          getSelectTask()?.(task.id)
        })

        let enterTimer: ReturnType<typeof setTimeout> | undefined
        el.addEventListener('mouseenter', () => {
          enterTimer = setTimeout(() => {
            if (getSelectedTaskId() === task.id) return
            setExpanded(true)
          }, 120)
        })
        el.addEventListener('mouseleave', () => {
          if (enterTimer) clearTimeout(enterTimer)
          if (getSelectedTaskId() === task.id) return
          setExpanded(false)
        })

        const marker = new mapboxMod.Marker({
          element: el,
          anchor: 'bottom',
        })
          .setLngLat([lng, lat])
          .addTo(current)
        markersRef.push({
          marker,
          taskId: task.id,
          setSelected,
          setExpanded,
        })
      }

      const sig = withCoords
        .map((row) => `${row.task.id}:${row.lat},${row.lng}`)
        .join('|')
      const tasksChanged = sig !== prevTasksSig
      prevTasksSig = sig

      const fitPadding = {
        top: 80,
        right: 80,
        bottom: 80,
        left: Math.max(80, leftPad),
      }

      if (tasksChanged && withCoords.length > 0) {
        const b = new mapboxMod.LngLatBounds()
        for (const row of withCoords) {
          b.extend([row.lng, row.lat])
        }
        b.extend([p.centerLng, p.centerLat])
        current.fitBounds(b, {
          padding: fitPadding,
          maxZoom: MAP_MAX_ZOOM,
          duration: 500,
        })
      } else if (tasksChanged && withCoords.length === 0) {
        current.easeTo({
          center: [p.centerLng, p.centerLat],
          zoom: 11,
          duration: 400,
          offset: fullscreenCenterOffsetPx(leftPad),
        })
      }

      current.once('idle', () => {
        map?.resize()
      })

      const curSel = getSelectedTaskId()
      lastPinSelectedKey = curSel ?? ''
      for (const row of markersRef) {
        row.setSelected(row.taskId === curSel)
      }
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(runAddMarkersAndBounds)
    })
  }

  const sync = () => {
    if (!map?.isStyleLoaded()) return
    const p = getProps()
    if (p.themeMode && p.themeMode !== lastThemeMode && map) {
      lastThemeMode = p.themeMode
      const nextStyle = getStyleUrlForMode(p.themeMode)
      map.setStyle(nextStyle)
    }
    const leftPad = p.leftViewportPadding ?? 48

    const searchKey = `${p.centerLat},${p.centerLng}`
    if (prevSearchCenterKey !== searchKey) {
      if (prevSearchCenterKey !== null) {
        setShowSearchThisArea(false)
        pendingView = null
        suppressSearchPromptUntil = Date.now() + 1600
      }
      prevSearchCenterKey = searchKey
    }

    const queryCenterKey = `${p.centerLat}|${p.centerLng}|${leftPad}`
    if (queryCenterKey !== lastQueryCenterKey) {
      lastQueryCenterKey = queryCenterKey
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

    const withCoordsSig = p.tasks
      .map((t) => {
        const ll = taskLngLat(t)
        return ll ? `${t.id}:${ll.lat},${ll.lng}` : ''
      })
      .filter(Boolean)
      .join('|')
    const markerFrameKey = `${withCoordsSig}|${p.visible ?? true}|${p.tasksLoaded ?? true}|${leftPad}|${p.centerLat}|${p.centerLng}`
    const markerFrameChanged = markerFrameKey !== lastMarkerFrameKey
    if (markerFrameChanged) {
      lastMarkerFrameKey = markerFrameKey
      syncMarkersAndBounds()
    }

    const selectedId = p.selectedTaskId ?? null
    for (const row of markersRef) row.setExpanded(false)

    const selectedTask = selectedId
      ? p.tasks.find((t) => t.id === selectedId)
      : null
    const selLl = selectedTask ? taskLngLat(selectedTask) : null
    const selectionFlyKey =
      selectedId && selLl
        ? `${selectedId}|${selLl.lat}|${selLl.lng}|${leftPad}`
        : `__none__|${leftPad}`

    if (selectionFlyKey !== lastSelectionFlyKey) {
      lastSelectionFlyKey = selectionFlyKey
      if (selectedId && selectedTask && selLl) {
        bumpMapResize(map)
        programmaticMove = true
        suppressSearchPromptUntil = Date.now() + 2000
        setShowSearchThisArea(false)
        map.flyTo({
          center: [selLl.lng, selLl.lat],
          zoom: Math.min(
            MAP_MAX_ZOOM,
            Math.max(MAP_MIN_ZOOM, Math.max(map.getZoom(), 13.5)),
          ),
          offset: fullscreenCenterOffsetPx(leftPad),
          duration: 650,
          essential: true,
        })
        map.once('moveend', () => {
          programmaticMove = false
        })
        for (const row of markersRef) {
          row.setExpanded(row.taskId === selectedId)
        }
      }
    }

    if (!markerFrameChanged) {
      const pinKey = selectedId ?? ''
      if (pinKey !== lastPinSelectedKey) {
        lastPinSelectedKey = pinKey
        for (const row of markersRef) {
          row.setSelected(row.taskId === selectedId)
        }
      }
    }

    const nextVisible = Boolean(getShowSearchThisArea() && (p.visible ?? true))
    const nextEnabled = Boolean(p.onSearchThisAreaConfirm)
    const nextPosition = p.searchAreaButtonPosition ?? ''
    const nextLeftInset = p.searchAreaButtonLeftInset ?? ''
    const nextOffsetX = p.searchAreaButtonOffsetX ?? '0px'
    const uiSig = `${nextVisible}|${nextEnabled}|${nextPosition}|${nextLeftInset}|${nextOffsetX}`

    if (uiSig !== lastSearchThisAreaUiSig) {
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
  }

  void import('mapbox-gl').then((mapboxgl) => {
    if (cancelled || !args.container) return
    mapboxgl.default.accessToken = args.accessToken
    mapboxMod = mapboxgl.default

    const styleUrl = getStyleUrlForMode(getProps().themeMode)

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

    m.on('load', () => {
      if (cancelled) return
      bumpMapResize(m)
      getProps().onReadyChange?.(true)
      scheduleSync()
    })

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

    mapClickRun = () => {
      const pr = getProps()
      if (getSelectedTaskId()) {
        getSelectTask()?.(null)
      }
      pr.onMapClick?.()
    }
    m.on('click', mapClickRun)
  })

  return {
    scheduleSync,
    sync,
    destroy: () => {
      cancelled = true
      if (moveEndDebounce) clearTimeout(moveEndDebounce)
      resizeObserver.disconnect()
      if (map && moveEndRun) map.off('moveend', moveEndRun)
      if (map && mapClickRun) map.off('click', mapClickRun)
      for (const { marker } of markersRef) marker.remove()
      markersRef.length = 0
      map?.remove()
      map = null
      mapboxMod = null
      lastSearchThisAreaUiSig = null
      getProps().onReadyChange?.(false)
    },
  }
}

export function TaskMap({
  accessToken,
  centerLat,
  centerLng,
  radiusMiles,
  tasks,
  visible = true,
  tasksLoaded = true,
  leftViewportPadding = 48,
  onSearchThisAreaConfirm,
  searchAreaButtonLeftInset,
  searchAreaButtonPosition = 'bottom',
  searchAreaButtonOffsetX = '0px',
  onMapClick,
  onReadyChange,
  selectedTaskId = null,
  onSelectTask,
  onSearchThisAreaUiChange,
}: TaskMapProps) {
  const { colorMode } = useColorMode()
  const effectiveSearchRadiusMiles = Math.max(
    0,
    Math.min(radiusMiles, MAX_SEARCH_RADIUS_MILES),
  )

  const [showSearchThisArea, setShowSearchThisArea] = useState(false)

  const propsRef = useRef<TaskMapPropsSnapshot>({
    accessToken,
    centerLat,
    centerLng,
    radiusMiles,
    tasks,
    visible,
    tasksLoaded,
    leftViewportPadding,
    onSearchThisAreaConfirm,
    searchAreaButtonLeftInset,
    searchAreaButtonPosition,
    searchAreaButtonOffsetX,
    onMapClick,
    onReadyChange,
    selectedTaskId,
    onSelectTask,
    onSearchThisAreaUiChange,
    effectiveSearchRadiusMiles,
    themeMode: colorMode,
  })

  propsRef.current = {
    accessToken,
    centerLat,
    centerLng,
    radiusMiles,
    tasks,
    visible,
    tasksLoaded,
    leftViewportPadding,
    onSearchThisAreaConfirm,
    searchAreaButtonLeftInset,
    searchAreaButtonPosition,
    searchAreaButtonOffsetX,
    onMapClick,
    onReadyChange,
    selectedTaskId,
    onSelectTask,
    onSearchThisAreaUiChange,
    effectiveSearchRadiusMiles,
    themeMode: colorMode,
  }

  const selectTaskRef = useRef(onSelectTask)
  selectTaskRef.current = onSelectTask
  const selectedTaskIdRef = useRef(selectedTaskId)
  selectedTaskIdRef.current = selectedTaskId

  const controllerRef = useRef<TaskMapController | null>(null)
  const syncDriverRef = useRef<string | null>(null)
  const showSearchRef = useRef(showSearchThisArea)
  showSearchRef.current = showSearchThisArea

  const mapContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      controllerRef.current?.destroy()
      controllerRef.current = null

      if (!node) {
        syncDriverRef.current = null
        return
      }

      const token = accessToken?.trim()
      if (!token) return

      controllerRef.current = createTaskMapController({
        container: node,
        accessToken: token,
        getProps: () => propsRef.current,
        getSelectTask: () => selectTaskRef.current,
        getSelectedTaskId: () => selectedTaskIdRef.current ?? null,
        setShowSearchThisArea,
        getShowSearchThisArea: () => showSearchRef.current,
      })
      controllerRef.current.scheduleSync()
    },
    [accessToken],
  )

  const tasksSig = tasks
    .map((t) => {
      const ll = taskLngLat(t)
      return ll ? `${t.id}:${ll.lat},${ll.lng}` : `${t.id}:`
    })
    .join('|')
  const syncDriver = [
    accessToken ?? '',
    centerLat,
    centerLng,
    radiusMiles,
    colorMode,
    visible,
    tasksLoaded,
    leftViewportPadding ?? '',
    selectedTaskId ?? '',
    showSearchThisArea,
    effectiveSearchRadiusMiles,
    searchAreaButtonLeftInset ?? '',
    searchAreaButtonPosition ?? '',
    searchAreaButtonOffsetX ?? '',
    tasksSig,
    Boolean(onSearchThisAreaConfirm),
  ].join('\x1e')

  if (controllerRef.current && syncDriverRef.current !== syncDriver) {
    syncDriverRef.current = syncDriver
    queueMicrotask(() => controllerRef.current?.scheduleSync())
  }

  if (!accessToken?.trim()) {
    return (
      <Box
        borderRadius="0"
        position="absolute"
        inset={0}
        top={0}
        h="full"
        bg="cardBg"
        boxShadow="none"
        borderWidth={0}
        borderColor="cardBorder"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={6}
        zIndex={0}
      >
        <Text color="formLabelMuted" fontSize="sm" textAlign="center">
          Set{' '}
          <Text as="span" fontWeight={700} color="cardFg">
            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          </Text>{' '}
          in your environment to load the map.
        </Text>
      </Box>
    )
  }

  return (
    <Box
      position="absolute"
      inset={0}
      top={0}
      h="full"
      overflow="hidden"
      borderRadius="0"
      boxShadow="none"
      borderWidth={0}
      borderColor="cardBorder"
      zIndex={0}
    >
      <Box
        ref={mapContainerRef}
        w="full"
        h="full"
        aria-label="Map of tasks near the search area"
      />
    </Box>
  )
}

const SINGLE_PANEL_BUTTON_LEFT_INSET = '1.25rem + min(420px, 38vw)'

export type TaskBrowseMapLayerProps = {
  /** When true, apply desktop map padding and search-area button inset. */
  isDesktop: boolean
}

/**
 * Single `TaskMap` instance for the task browse page so the map is not unmounted
 * when switching between web/mobile layouts on viewport resize.
 */
export function TaskBrowseMapLayer({ isDesktop }: TaskBrowseMapLayerProps) {
  const mapBindings = useTaskMapBindings()
  const { windowOffsetWidth, setIsFilterOpen } = useTaskBrowseLayout()
  const { setSelectedTaskId } = useTaskBrowseData()

  return (
    <Box position="absolute" inset={0} zIndex={isDesktop ? 1 : 0}>
      <TaskMap
        {...mapBindings}
        leftViewportPadding={isDesktop ? windowOffsetWidth : undefined}
        searchAreaButtonLeftInset={
          isDesktop ? SINGLE_PANEL_BUTTON_LEFT_INSET : undefined
        }
        onSelectTask={(taskId) => {
          if (taskId) setIsFilterOpen(false)
          setSelectedTaskId(taskId)
        }}
      />
    </Box>
  )
}
