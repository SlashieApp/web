'use client'

import { Box, Text } from '@chakra-ui/react'
import type { GeoJSONSource, Map as MapboxMap, Marker, Popup } from 'mapbox-gl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useTaskBrowseStore } from '@context/taskBrowse'
import { Button } from '@ui'

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
  /** Fills the positioned parent (`position: relative` + height). */
  variant?: 'panel' | 'fullscreen'
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
  onSearchThisAreaConfirm?: (lat: number, lng: number) => void
  /**
   * Horizontal inset of the left task list (margin + width). When set, the
   * button is centered in the map pane: `calc(50% + ${inset} / 2)`.
   */
  searchAreaButtonLeftInset?: string
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

function radiusFeature(
  centerLng: number,
  centerLat: number,
  radiusMiles: number,
) {
  const ring = circlePolygonRing(centerLng, centerLat, radiusMiles)
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Polygon' as const,
      coordinates: [ring],
    },
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

const POPUP_DESC_MAX = 240

function truncateDescription(text: string, max: number): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, Math.max(0, max - 1)).trim()}…`
}

/** Shared HTML for hover + selected task popup (Mapbox `.setHTML`). */
function buildTaskPopupHtml(task: TaskMapTask): string {
  const loc = (task.location ?? '').trim() || 'Location on map'
  const detail = (task.detailLine ?? '').trim()
  const cat = (task.category ?? '').trim()
  const rawDesc = (task.description ?? '').trim()
  const desc =
    rawDesc.length > 0 ? truncateDescription(rawDesc, POPUP_DESC_MAX) : ''

  const cta = `<a href="/task/${escapeHtml(task.id)}" style="display:inline-block;margin-top:12px;padding:9px 16px;background:linear-gradient(95deg,#003fb1 0%,#1a56db 100%);color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:13px;box-shadow:0 1px 4px rgba(15,23,42,0.2);">View details</a>`

  return `
    <div style="padding:8px 4px 4px;min-width:200px;max-width:300px;font-family:system-ui,-apple-system,sans-serif;font-size:13px;line-height:1.4;">
      ${cat ? `<div style="font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;margin-bottom:4px;">${escapeHtml(cat)}</div>` : ''}
      <div style="font-weight:700;color:#0f172a;margin-bottom:6px;font-size:14px;">${escapeHtml(task.title)}</div>
      <div style="color:#64748b;font-size:12px;margin-bottom:4px;">${escapeHtml(loc)}</div>
      ${detail ? `<div style="color:#1e293b;font-size:12px;font-weight:600;margin-bottom:6px;">${escapeHtml(detail)}</div>` : ''}
      ${desc ? `<div style="color:#475569;font-size:12px;line-height:1.45;">${escapeHtml(desc)}</div>` : ''}
      ${cta}
    </div>
  `
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

  const apply = (isSel: boolean) => {
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
      transition:
        'width 0.15s ease, height 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
    })
  }

  apply(selected)

  return {
    el: btn,
    setSelected: (v: boolean) => apply(v),
  }
}

export function TaskMap({
  accessToken,
  centerLat,
  centerLng,
  radiusMiles,
  tasks,
  variant = 'panel',
  visible = true,
  tasksLoaded = true,
  leftViewportPadding = 48,
  onSearchThisAreaConfirm,
  searchAreaButtonLeftInset,
}: TaskMapProps) {
  const selectedTaskId = useTaskBrowseStore((s) => s.selectedTaskId)
  const setSelectedTaskId = useTaskBrowseStore((s) => s.setSelectedTaskId)
  const selectTaskRef = useRef(setSelectedTaskId)
  selectTaskRef.current = setSelectedTaskId
  const selectedTaskIdRef = useRef<string | null>(null)
  selectedTaskIdRef.current = selectedTaskId

  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const mapboxRef = useRef<typeof import('mapbox-gl')['default'] | null>(null)
  const markersRef = useRef<
    { marker: Marker; taskId: string; setSelected: (v: boolean) => void }[]
  >([])
  const taskPopupRef = useRef<Popup | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [showSearchThisArea, setShowSearchThisArea] = useState(false)
  const prevTasksSigRef = useRef<string>('')
  const moveEndDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingViewRef = useRef<{ lat: number; lng: number } | null>(null)
  const programmaticMoveRef = useRef(false)
  const suppressSearchPromptUntilRef = useRef(0)

  const attachTaskPopup = useCallback(
    (map: MapboxMap, task: TaskMapTask, lng: number, lat: number) => {
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
        .setHTML(buildTaskPopupHtml(task))
        .addTo(map)
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
        map.addSource('search-radius', {
          type: 'geojson',
          data: radiusFeature(centerLng, centerLat, radiusMiles),
        })
        map.addLayer({
          id: 'search-radius-fill',
          type: 'fill',
          source: 'search-radius',
          paint: {
            'fill-color': '#1A56DB',
            'fill-opacity': 0.08,
          },
        })
        map.addLayer({
          id: 'search-radius-line',
          type: 'line',
          source: 'search-radius',
          paint: {
            'line-color': '#1A56DB',
            'line-width': 2,
            'line-opacity': 0.35,
          },
        })
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

    const source = map.getSource('search-radius') as GeoJSONSource | undefined
    source?.setData(radiusFeature(centerLng, centerLat, radiusMiles))
  }, [mapReady, centerLat, centerLng, radiusMiles])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map?.isStyleLoaded()) return
    const c = map.getCenter()
    const offset =
      variant === 'fullscreen'
        ? fullscreenCenterOffsetPx(leftViewportPadding)
        : ([0, 0] as [number, number])

    const geoMatch =
      Math.abs(c.lat - centerLat) < 5e-5 && Math.abs(c.lng - centerLng) < 5e-5

    if (geoMatch && variant !== 'fullscreen') return

    if (geoMatch && variant === 'fullscreen') {
      map.easeTo({
        center: [centerLng, centerLat],
        duration: 0,
        offset,
      })
      return
    }

    programmaticMoveRef.current = true
    map.easeTo({
      center: [centerLng, centerLat],
      duration: 450,
      offset,
    })
    map.once('moveend', () => {
      programmaticMoveRef.current = false
    })
  }, [mapReady, centerLat, centerLng, variant, leftViewportPadding])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map?.isStyleLoaded()) return
    const c = map.getCenter()
    if (
      Math.abs(c.lat - centerLat) < 8e-5 &&
      Math.abs(c.lng - centerLng) < 8e-5
    ) {
      setShowSearchThisArea(false)
      pendingViewRef.current = null
    }
  }, [mapReady, centerLat, centerLng])

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
        const differs =
          Math.abs(c.lat - centerLat) > 8e-5 ||
          Math.abs(c.lng - centerLng) > 8e-5
        if (differs) {
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
  }, [mapReady, centerLat, centerLng, onSearchThisAreaConfirm])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !visible) return
    const id = requestAnimationFrame(() => {
      bumpMapResize(map)
    })
    return () => cancelAnimationFrame(id)
  }, [mapReady, visible])

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
          const { el, setSelected } = taskMarkerElement(task, false)
          el.setAttribute(
            'aria-label',
            `${task.title}, ${pinPriceText(task)}. Select to highlight in list.`,
          )
          el.addEventListener('click', (e) => {
            e.stopPropagation()
            selectTaskRef.current(task.id)
          })

          let enterTimer: ReturnType<typeof setTimeout> | undefined
          el.addEventListener('mouseenter', () => {
            enterTimer = setTimeout(() => {
              attachTaskPopup(current, task, lng, lat)
            }, 120)
          })
          el.addEventListener('mouseleave', () => {
            if (enterTimer) clearTimeout(enterTimer)
            if (selectedTaskIdRef.current === task.id) return
            taskPopupRef.current?.remove()
            taskPopupRef.current = null
          })

          const marker = new mapbox.Marker({
            element: el,
            anchor: 'bottom',
          })
            .setLngLat([lng, lat])
            .addTo(current)
          markersRef.current.push({ marker, taskId: task.id, setSelected })
        }

        const sig = withCoords
          .map((row) => `${row.task.id}:${row.lat},${row.lng}`)
          .join('|')
        const tasksChanged = sig !== prevTasksSigRef.current
        prevTasksSigRef.current = sig

        const fitPadding =
          variant === 'fullscreen'
            ? {
                top: 80,
                right: 80,
                bottom: 80,
                left: Math.max(80, leftViewportPadding),
              }
            : 48

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
          const offset =
            variant === 'fullscreen'
              ? fullscreenCenterOffsetPx(leftViewportPadding)
              : ([0, 0] as [number, number])
          current.easeTo({
            center: [centerLng, centerLat],
            zoom: 11,
            duration: 400,
            offset,
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
    variant,
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
    if (!selectedTaskId) return

    const task = tasks.find((t) => t.id === selectedTaskId)
    const ll = task ? taskLngLat(task) : null
    if (!task || !ll) {
      return
    }

    attachTaskPopup(map, task, ll.lng, ll.lat)
    bumpMapResize(map)
    programmaticMoveRef.current = true
    suppressSearchPromptUntilRef.current = Date.now() + 2000
    setShowSearchThisArea(false)
    map.flyTo({
      center: [ll.lng, ll.lat],
      zoom: Math.max(map.getZoom(), 13.5),
      offset:
        variant === 'fullscreen'
          ? fullscreenCenterOffsetPx(leftViewportPadding)
          : [0, 0],
      duration: 650,
      essential: true,
    })
    map.once('moveend', () => {
      programmaticMoveRef.current = false
    })
  }, [
    mapReady,
    selectedTaskId,
    tasks,
    variant,
    leftViewportPadding,
    attachTaskPopup,
  ])

  useEffect(() => {
    for (const row of markersRef.current) {
      row.setSelected(row.taskId === selectedTaskId)
    }
  }, [selectedTaskId])

  if (!accessToken?.trim()) {
    return (
      <Box
        borderRadius={variant === 'fullscreen' ? '0' : 'xl'}
        position={variant === 'fullscreen' ? 'absolute' : { lg: 'sticky' }}
        inset={variant === 'fullscreen' ? 0 : undefined}
        top={variant === 'fullscreen' ? 0 : { lg: 6 }}
        h={
          variant === 'fullscreen'
            ? 'full'
            : { base: '280px', lg: 'min(70vh, 560px)' }
        }
        bg="surfaceContainerLow"
        boxShadow={variant === 'fullscreen' ? 'none' : 'ghostBorder'}
        borderWidth={variant === 'fullscreen' ? 0 : '1px'}
        borderColor="border"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={6}
        zIndex={variant === 'fullscreen' ? 0 : undefined}
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

  const isFull = variant === 'fullscreen'

  const handleSearchThisAreaClick = () => {
    const p = pendingViewRef.current
    if (!p || !onSearchThisAreaConfirm) return
    onSearchThisAreaConfirm(p.lat, p.lng)
    setShowSearchThisArea(false)
    pendingViewRef.current = null
  }

  return (
    <Box
      position={isFull ? 'absolute' : { lg: 'sticky' }}
      inset={isFull ? 0 : undefined}
      top={isFull ? 0 : { lg: 6 }}
      h={isFull ? 'full' : { base: '280px', lg: 'min(70vh, 560px)' }}
      overflow="hidden"
      borderRadius={isFull ? '0' : 'xl'}
      boxShadow={isFull ? 'none' : 'ghostBorder'}
      borderWidth={isFull ? 0 : '1px'}
      borderColor="border"
      zIndex={isFull ? 0 : undefined}
    >
      <Box
        ref={containerRef}
        w="full"
        h="full"
        aria-label="Map of tasks near the search area"
      />
      {showSearchThisArea && onSearchThisAreaConfirm && visible ? (
        <Box
          position="absolute"
          bottom={{ base: 20, md: 5 }}
          left={
            searchAreaButtonLeftInset
              ? `calc(50% + (${searchAreaButtonLeftInset}) / 2)`
              : '50%'
          }
          transform="translateX(-50%)"
          zIndex={10}
          pointerEvents="auto"
        >
          <Button
            type="button"
            size="sm"
            boxShadow="0 8px 28px rgba(15,23,42,0.22)"
            borderRadius="full"
            px={5}
            onClick={handleSearchThisAreaClick}
          >
            Search this area
          </Button>
        </Box>
      ) : null}
    </Box>
  )
}
