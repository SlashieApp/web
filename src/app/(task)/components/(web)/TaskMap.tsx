'use client'

import { Box, Text } from '@chakra-ui/react'
import type { GeoJSONSource, Map as MapboxMap, Marker, Popup } from 'mapbox-gl'
import { useCallback, useEffect, useRef, useState } from 'react'

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
  /** Called when the base map surface is clicked. */
  onMapClick?: () => void
  /** Emits map style readiness state for parent loading orchestration. */
  onReadyChange?: (ready: boolean) => void
  selectedTaskId?: string | null
  onSelectTask?: (taskId: string | null) => void
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

function milesToLatDegrees(miles: number) {
  return miles / 69
}

function milesToLngDegrees(miles: number, atLatDeg: number) {
  const cosLat = Math.cos((atLatDeg * Math.PI) / 180)
  const denom = 69 * Math.max(Math.abs(cosLat), 0.2)
  return miles / denom
}

function circlePolygonRing(
  centerLng: number,
  centerLat: number,
  radiusMiles: number,
  steps = 64,
): [number, number][] {
  const dLat = milesToLatDegrees(radiusMiles)
  const dLng = milesToLngDegrees(radiusMiles, centerLat)
  const ring: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI
    ring.push([centerLng + dLng * Math.cos(a), centerLat + dLat * Math.sin(a)])
  }
  return ring
}

const POPUP_DESC_MAX = 240

function truncateDescription(text: string, max: number): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, Math.max(0, max - 1)).trim()}…`
}

/** Shared popup DOM for hover + selected task popup (Mapbox `.setDOMContent`). */
function buildTaskPopupContent(task: TaskMapTask): HTMLDivElement {
  const loc = (task.location ?? '').trim() || 'Location on map'
  const detail = (task.detailLine ?? '').trim()
  const cat = (task.category ?? '').trim()
  const rawDesc = (task.description ?? '').trim()
  const desc =
    rawDesc.length > 0 ? truncateDescription(rawDesc, POPUP_DESC_MAX) : ''

  const root = document.createElement('div')
  Object.assign(root.style, {
    padding: '10px 6px 6px',
    minWidth: '220px',
    maxWidth: '320px',
    fontFamily: 'system-ui,-apple-system,sans-serif',
    fontSize: '13px',
    lineHeight: '1.4',
  })

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
    root.appendChild(catEl)
  }

  const titleEl = document.createElement('div')
  titleEl.textContent = task.title
  Object.assign(titleEl.style, {
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '6px',
    fontSize: '14px',
  })
  root.appendChild(titleEl)

  const locEl = document.createElement('div')
  locEl.textContent = loc
  Object.assign(locEl.style, {
    color: '#64748b',
    fontSize: '12px',
    marginBottom: '4px',
  })
  root.appendChild(locEl)

  if (detail) {
    const detailEl = document.createElement('div')
    detailEl.textContent = detail
    Object.assign(detailEl.style, {
      color: '#1e293b',
      fontSize: '12px',
      fontWeight: '600',
      marginBottom: '6px',
    })
    root.appendChild(detailEl)
  }

  if (desc) {
    const descEl = document.createElement('div')
    descEl.textContent = desc
    Object.assign(descEl.style, {
      color: '#475569',
      fontSize: '12px',
      lineHeight: '1.45',
    })
    root.appendChild(descEl)
  }

  const cta = document.createElement('a')
  cta.href = `/task/${task.id}`
  cta.textContent = 'View details'
  Object.assign(cta.style, {
    display: 'inline-block',
    marginTop: '14px',
    padding: '9px 16px',
    background: 'linear-gradient(95deg,#003fb1 0%,#1a56db 100%)',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '999px',
    fontWeight: '600',
    fontSize: '13px',
    boxShadow: '0 1px 4px rgba(15,23,42,0.2)',
  })
  root.appendChild(cta)

  return root
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
): {
  el: HTMLButtonElement
  setSelected: (v: boolean) => void
  setPopupVisible: (v: boolean) => void
} {
  const btn = document.createElement('button')
  btn.type = 'button'
  Object.assign(btn.style, {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '5px',
    padding: '0',
    margin: '0',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  })

  const pill = document.createElement('span')
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

  btn.appendChild(pill)
  btn.appendChild(ring)

  pill.textContent = pinPriceText(task)

  let isSelected = selected
  let isPopupVisible = false
  const apply = () => {
    const isSel = isSelected
    const dotPx = isSel ? 30 : 26
    Object.assign(pill.style, {
      display: 'inline-block',
      background: '#ffffff',
      color: '#1A56DB',
      fontWeight: '700',
      fontSize: '12px',
      lineHeight: '1.2',
      padding: '4px 10px',
      borderRadius: '999px',
      boxShadow: '0 1px 4px rgba(15,23,42,0.2)',
      whiteSpace: 'nowrap',
      maxWidth: '120px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      border: isSel ? '2px solid #ea580c' : '1px solid rgba(226,232,240,0.9)',
      opacity: isPopupVisible ? '0' : '1',
      transform: isPopupVisible
        ? 'translateY(4px) scale(0.94)'
        : 'translateY(0) scale(1)',
      transformOrigin: 'center bottom',
      pointerEvents: isPopupVisible ? 'none' : 'auto',
      transition:
        'opacity 0.18s ease, transform 0.18s ease, border-color 0.15s ease, box-shadow 0.15s ease',
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
      transform: isPopupVisible
        ? 'translateY(-2px) scale(1.05)'
        : 'translateY(0) scale(1)',
      transition:
        'width 0.15s ease, height 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, transform 0.18s ease',
    })
  }

  apply()

  return {
    el: btn,
    setSelected: (v: boolean) => {
      isSelected = v
      apply()
    },
    setPopupVisible: (v: boolean) => {
      isPopupVisible = v
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
  onMapClick,
  onReadyChange,
  selectedTaskId = null,
  onSelectTask,
}: TaskMapProps) {
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
      setPopupVisible: (v: boolean) => void
    }[]
  >([])
  const taskPopupRef = useRef<Popup | null>(null)
  const popupTaskIdRef = useRef<string | null>(null)
  const popupOpenReasonRef = useRef<'hover' | 'active' | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const prevTasksSigRef = useRef<string>('')
  const programmaticMoveRef = useRef(false)
  const didApplyStartupOffsetRef = useRef(false)

  const attachTaskPopup = useCallback(
    (
      map: MapboxMap,
      task: TaskMapTask,
      lng: number,
      lat: number,
      reason: 'hover' | 'active',
    ) => {
      const setPopupMarker = (taskId: string | null) => {
        popupTaskIdRef.current = taskId
        for (const row of markersRef.current) {
          row.setPopupVisible(row.taskId === taskId)
        }
      }
      const mapbox = mapboxRef.current
      if (!mapbox) return
      taskPopupRef.current?.remove()
      taskPopupRef.current = null
      const popup = new mapbox.Popup({
        closeButton: true,
        closeOnClick: true,
        offset: 28,
        maxWidth: '300px',
        className: 'task-browse-map-popup',
      })
        .setLngLat([lng, lat])
        .setDOMContent(buildTaskPopupContent(task))
        .addTo(map)
      const popupEl = popup.getElement()
      if (popupEl) {
        const contentEl = popupEl.querySelector('.mapboxgl-popup-content')
        if (contentEl instanceof HTMLElement) {
          Object.assign(contentEl.style, {
            borderRadius: '14px',
            padding: '10px 12px 8px',
            boxShadow: '0 10px 28px rgba(15,23,42,0.22)',
            border: '1px solid rgba(226,232,240,0.95)',
          })
        }
        const closeEl = popupEl.querySelector('.mapboxgl-popup-close-button')
        if (closeEl instanceof HTMLElement) {
          Object.assign(closeEl.style, {
            top: '6px',
            right: '6px',
            width: '26px',
            height: '26px',
            borderRadius: '999px',
            lineHeight: '26px',
            fontSize: '16px',
            color: '#334155',
            background: '#f8fafc',
          })
        }
      }
      setPopupMarker(task.id)
      popupOpenReasonRef.current = reason
      popup.on('close', () => {
        const wasActivePopup = popupOpenReasonRef.current === 'active'
        if (popupTaskIdRef.current === task.id) setPopupMarker(null)
        if (popupTaskIdRef.current === task.id)
          popupOpenReasonRef.current = null
        if (taskPopupRef.current === popup) taskPopupRef.current = null
        if (wasActivePopup) selectTaskRef.current?.(null)
      })
      taskPopupRef.current = popup
    },
    [],
  )

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
      taskPopupRef.current?.remove()
      taskPopupRef.current = null
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

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !onMapClick) return
    const handle = () => onMapClick()
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

      taskPopupRef.current?.remove()
      taskPopupRef.current = null
      popupTaskIdRef.current = null
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
          const { el, setSelected, setPopupVisible } = taskMarkerElement(
            task,
            false,
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
              attachTaskPopup(current, task, lng, lat, 'hover')
            }, 120)
          })
          el.addEventListener('mouseleave', () => {
            if (enterTimer) clearTimeout(enterTimer)
            if (selectedTaskIdRef.current === task.id) return
            const popupOpenedByHover =
              popupOpenReasonRef.current === 'hover' &&
              popupTaskIdRef.current === task.id
            if (!popupOpenedByHover) return
            taskPopupRef.current?.remove()
            taskPopupRef.current = null
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
            setPopupVisible,
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
    attachTaskPopup,
  ])

  useEffect(() => {
    const map = mapRef.current
    const mapbox = mapboxRef.current
    if (!mapReady || !map?.isStyleLoaded() || !mapbox) return

    taskPopupRef.current?.remove()
    taskPopupRef.current = null
    popupTaskIdRef.current = null
    popupOpenReasonRef.current = null
    for (const row of markersRef.current) row.setPopupVisible(false)
    if (!selectedTaskId) return

    const task = tasks.find((t) => t.id === selectedTaskId)
    const ll = task ? taskLngLat(task) : null
    if (!task || !ll) {
      return
    }

    attachTaskPopup(map, task, ll.lng, ll.lat, 'active')
    bumpMapResize(map)
    programmaticMoveRef.current = true
    map.flyTo({
      center: [ll.lng, ll.lat],
      zoom: Math.max(map.getZoom(), 13.5),
      offset: fullscreenCenterOffsetPx(leftViewportPadding),
      duration: 650,
      essential: true,
    })
    map.once('moveend', () => {
      programmaticMoveRef.current = false
    })
  }, [mapReady, selectedTaskId, tasks, leftViewportPadding, attachTaskPopup])

  useEffect(() => {
    for (const row of markersRef.current) {
      row.setSelected(row.taskId === selectedTaskId)
    }
  }, [selectedTaskId])

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
