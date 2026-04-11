'use client'

import { Box, Text } from '@chakra-ui/react'
import type { Map as MapboxMap, Marker } from 'mapbox-gl'
import { useCallback, useEffect, useRef, useState } from 'react'

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
const MAP_MAX_ZOOM = 15

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
  const effectiveSearchRadiusMiles = Math.max(
    0,
    Math.min(radiusMiles, MAX_SEARCH_RADIUS_MILES),
  )
  const selectTaskRef = useRef(onSelectTask)
  selectTaskRef.current = onSelectTask
  const selectedTaskIdRef = useRef<string | null>(null)
  selectedTaskIdRef.current = selectedTaskId

  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const mapboxRef = useRef<typeof import('mapbox-gl')['default'] | null>(null)
  const markersRef = useRef<
    {
      marker: Marker
      taskId: string
      setSelected: (v: boolean) => void
      setExpanded: (v: boolean) => void
    }[]
  >([])
  const [mapReady, setMapReady] = useState(false)
  const [showSearchThisArea, setShowSearchThisArea] = useState(false)
  const prevTasksSigRef = useRef<string>('')
  const moveEndDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingViewRef = useRef<{ lat: number; lng: number } | null>(null)
  const programmaticMoveRef = useRef(false)
  const suppressSearchPromptUntilRef = useRef(0)
  const didApplyStartupOffsetRef = useRef(false)
  const prevSearchCenterKeyRef = useRef<string | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      mapRef.current?.resize()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: init once per token; centre/radius sync in later effects
  useEffect(() => {
    if (!accessToken?.trim() || !containerRef.current) {
      setMapReady(false)
      return
    }

    let cancelled = false
    const container = containerRef.current

    void import('mapbox-gl').then((mapboxgl) => {
      if (cancelled || !container) return

      mapboxgl.default.accessToken = accessToken
      mapboxRef.current = mapboxgl.default

      const map = new mapboxgl.default.Map({
        container,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerLng, centerLat],
        zoom: 11,
        minZoom: MAP_MIN_ZOOM,
        maxZoom: MAP_MAX_ZOOM,
      })

      map.addControl(new mapboxgl.default.NavigationControl(), 'top-right')
      mapRef.current = map

      map.on('load', () => {
        if (cancelled) return
        bumpMapResize(map)
        setMapReady(true)
      })
    })

    return () => {
      cancelled = true
      setMapReady(false)
      mapboxRef.current = null
      for (const { marker } of markersRef.current) marker.remove()
      markersRef.current = []
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map?.isStyleLoaded()) return
    const c = map.getCenter()

    const geoMatch =
      Math.abs(c.lat - centerLat) < 5e-5 && Math.abs(c.lng - centerLng) < 5e-5

    if (geoMatch) {
      map.easeTo({
        center: [centerLng, centerLat],
        duration: 0,
        offset: fullscreenCenterOffsetPx(leftViewportPadding),
      })
      return
    }

    programmaticMoveRef.current = true
    map.easeTo({
      center: [centerLng, centerLat],
      duration: 450,
      offset: fullscreenCenterOffsetPx(leftViewportPadding),
    })
    map.once('moveend', () => {
      programmaticMoveRef.current = false
    })
  }, [mapReady, centerLat, centerLng, leftViewportPadding])

  // When geolocation / location search updates the query center, clear the prompt:
  // the map eases afterward; until then getCenter() still reflects the old view, so
  // the old "close enough to center" effect never ran again after the animation.
  useEffect(() => {
    const key = `${centerLat},${centerLng}`
    const prev = prevSearchCenterKeyRef.current
    prevSearchCenterKeyRef.current = key
    if (prev == null || prev === key) return
    setShowSearchThisArea(false)
    pendingViewRef.current = null
    suppressSearchPromptUntilRef.current = Date.now() + 1600
  }, [centerLat, centerLng])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !onSearchThisAreaConfirm) return

    const run = () => {
      if (moveEndDebounceRef.current) clearTimeout(moveEndDebounceRef.current)
      moveEndDebounceRef.current = setTimeout(() => {
        if (programmaticMoveRef.current) return
        if (Date.now() < suppressSearchPromptUntilRef.current) {
          setShowSearchThisArea(false)
          return
        }
        const c = map.getCenter()
        const movedOutsideSearchArea =
          distanceMiles(centerLat, centerLng, c.lat, c.lng) >
          effectiveSearchRadiusMiles
        if (movedOutsideSearchArea) {
          pendingViewRef.current = { lat: c.lat, lng: c.lng }
          setShowSearchThisArea(true)
        } else {
          pendingViewRef.current = null
          setShowSearchThisArea(false)
        }
      }, 400)
    }

    map.on('moveend', run)
    return () => {
      map.off('moveend', run)
      if (moveEndDebounceRef.current) clearTimeout(moveEndDebounceRef.current)
    }
  }, [
    mapReady,
    centerLat,
    centerLng,
    effectiveSearchRadiusMiles,
    onSearchThisAreaConfirm,
  ])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !onMapClick) return
    const handle = () => {
      if (selectedTaskIdRef.current) {
        selectTaskRef.current?.(null)
      }
      onMapClick()
    }
    map.on('click', handle)
    return () => {
      map.off('click', handle)
    }
  }, [mapReady, onMapClick])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !visible) return
    const id = requestAnimationFrame(() => {
      bumpMapResize(map)
    })
    return () => cancelAnimationFrame(id)
  }, [mapReady, visible])

  useEffect(() => {
    onReadyChange?.(mapReady)
  }, [mapReady, onReadyChange])

  // On first visible paint, force a zero-duration camera sync with offset.
  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !visible) return
    if (didApplyStartupOffsetRef.current) return

    const id = requestAnimationFrame(() => {
      if (!mapRef.current?.isStyleLoaded()) return
      mapRef.current.easeTo({
        center: [centerLng, centerLat],
        duration: 0,
        offset: fullscreenCenterOffsetPx(leftViewportPadding),
      })
      didApplyStartupOffsetRef.current = true
    })
    return () => cancelAnimationFrame(id)
  }, [mapReady, visible, centerLng, centerLat, leftViewportPadding])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !visible || !tasksLoaded) return

    const syncMarkers = () => {
      if (!map.isStyleLoaded()) return
      const mapbox = mapboxRef.current
      if (!mapbox) return

      bumpMapResize(map)

      for (const { marker } of markersRef.current) marker.remove()
      markersRef.current = []

      const withCoords = tasks
        .map((t) => {
          const ll = taskLngLat(t)
          return ll ? { task: t, ...ll } : null
        })
        .filter((x): x is NonNullable<typeof x> => x != null)

      const runAddMarkersAndBounds = () => {
        const current = mapRef.current
        if (!current?.isStyleLoaded() || !mapboxRef.current) return

        for (const { task, lat, lng } of withCoords) {
          const { el, setSelected, setExpanded } = taskMarkerElement(
            task,
            false,
            () => selectTaskRef.current?.(null),
          )
          el.setAttribute(
            'aria-label',
            `${task.title}, ${pinPriceText(task)}. Select to highlight in list.`,
          )
          el.addEventListener('click', (e) => {
            e.stopPropagation()
            selectTaskRef.current?.(task.id)
          })

          let enterTimer: ReturnType<typeof setTimeout> | undefined
          el.addEventListener('mouseenter', () => {
            enterTimer = setTimeout(() => {
              if (selectedTaskIdRef.current === task.id) return
              setExpanded(true)
            }, 120)
          })
          el.addEventListener('mouseleave', () => {
            if (enterTimer) clearTimeout(enterTimer)
            if (selectedTaskIdRef.current === task.id) return
            setExpanded(false)
          })

          const marker = new mapbox.Marker({
            element: el,
            anchor: 'bottom',
          })
            .setLngLat([lng, lat])
            .addTo(current)
          markersRef.current.push({
            marker,
            taskId: task.id,
            setSelected,
            setExpanded,
          })
        }

        const sig = withCoords
          .map((row) => `${row.task.id}:${row.lat},${row.lng}`)
          .join('|')
        const tasksChanged = sig !== prevTasksSigRef.current
        prevTasksSigRef.current = sig

        const fitPadding = {
          top: 80,
          right: 80,
          bottom: 80,
          left: Math.max(80, leftViewportPadding),
        }

        if (tasksChanged && withCoords.length > 0) {
          const b = new mapbox.LngLatBounds()
          for (const row of withCoords) {
            b.extend([row.lng, row.lat])
          }
          b.extend([centerLng, centerLat])
          current.fitBounds(b, {
            padding: fitPadding,
            maxZoom: 13,
            duration: 500,
          })
        } else if (tasksChanged && withCoords.length === 0) {
          current.easeTo({
            center: [centerLng, centerLat],
            zoom: 11,
            duration: 400,
            offset: fullscreenCenterOffsetPx(leftViewportPadding),
          })
        }

        current.once('idle', () => {
          mapRef.current?.resize()
        })
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(runAddMarkersAndBounds)
      })
    }

    if (map.isStyleLoaded()) {
      syncMarkers()
    } else {
      map.once('load', syncMarkers)
    }

    return () => {
      map.off('load', syncMarkers)
    }
  }, [
    mapReady,
    tasks,
    centerLat,
    centerLng,
    visible,
    tasksLoaded,
    leftViewportPadding,
  ])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map?.isStyleLoaded()) return

    for (const row of markersRef.current) row.setExpanded(false)
    if (!selectedTaskId) return

    const task = tasks.find((t) => t.id === selectedTaskId)
    const ll = task ? taskLngLat(task) : null
    if (!task || !ll) {
      return
    }

    bumpMapResize(map)
    programmaticMoveRef.current = true
    suppressSearchPromptUntilRef.current = Date.now() + 2000
    setShowSearchThisArea(false)
    map.flyTo({
      center: [ll.lng, ll.lat],
      zoom: Math.min(
        MAP_MAX_ZOOM,
        Math.max(MAP_MIN_ZOOM, Math.max(map.getZoom(), 13.5)),
      ),
      offset: fullscreenCenterOffsetPx(leftViewportPadding),
      duration: 650,
      essential: true,
    })
    map.once('moveend', () => {
      programmaticMoveRef.current = false
    })
    for (const row of markersRef.current) {
      row.setExpanded(row.taskId === selectedTaskId)
    }
  }, [mapReady, selectedTaskId, tasks, leftViewportPadding])

  useEffect(() => {
    for (const row of markersRef.current) {
      row.setSelected(row.taskId === selectedTaskId)
    }
  }, [selectedTaskId])

  const handleSearchThisAreaClick = useCallback(() => {
    const p = pendingViewRef.current
    if (!p || !onSearchThisAreaConfirm) return
    const zoom = mapRef.current?.getZoom() ?? 11
    onSearchThisAreaConfirm(p.lat, p.lng, zoom)
    setShowSearchThisArea(false)
    pendingViewRef.current = null
  }, [onSearchThisAreaConfirm])

  useEffect(() => {
    onSearchThisAreaUiChange?.({
      visible: showSearchThisArea && visible,
      enabled: Boolean(onSearchThisAreaConfirm),
      position: searchAreaButtonPosition,
      leftInset: searchAreaButtonLeftInset,
      offsetX: searchAreaButtonOffsetX,
      onClick: handleSearchThisAreaClick,
    })
  }, [
    onSearchThisAreaUiChange,
    showSearchThisArea,
    visible,
    onSearchThisAreaConfirm,
    searchAreaButtonPosition,
    searchAreaButtonLeftInset,
    searchAreaButtonOffsetX,
    handleSearchThisAreaClick,
  ])

  if (!accessToken?.trim()) {
    return (
      <Box
        borderRadius="0"
        position="absolute"
        inset={0}
        top={0}
        h="full"
        bg="surfaceContainerLow"
        boxShadow="none"
        borderWidth={0}
        borderColor="border"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={6}
        zIndex={0}
      >
        <Text color="muted" fontSize="sm" textAlign="center">
          Set{' '}
          <Text as="span" fontWeight={700} color="fg">
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
      borderColor="border"
      zIndex={0}
    >
      <Box
        ref={containerRef}
        w="full"
        h="full"
        aria-label="Map of tasks near the search area"
      />
    </Box>
  )
}
