'use client'

import type { MapOptions, Map as MapboxMap } from 'mapbox-gl'
import { useCallback, useRef, useState } from 'react'

import { currentPosition } from '@/app/(stepflow)/tasks/create/helpers/currentPosition'
import {
  TASK_MAP_PREVIEW_LAT,
  TASK_MAP_PREVIEW_LNG,
} from '@/app/(stepflow)/tasks/create/helpers/resolveTaskLocation'
import { useColorMode } from '@/ui/color-mode'
import { ensureMapboxStyles } from '@/utils/ensureMapboxStyles'
import {
  mapboxForwardGeocode,
  mapboxReverseGeocode,
} from '@/utils/mapboxGeocode'

type MapboxModule = typeof import('mapbox-gl').default

/** Mapbox's own streets style, when no `/search` style is set. */
const STREETS_STYLE = 'mapbox://styles/mapbox/streets-v12'

/**
 * The task location maps' Mapbox style (create's map and Edit task's,
 * FE-356): the muted `/search` style for the light or dark theme.
 */
export function taskLocationMapStyle(mode: 'light' | 'dark'): string {
  const light = process.env.NEXT_PUBLIC_MAPBOX_STYLE_LIGHT?.trim()
  const dark = process.env.NEXT_PUBLIC_MAPBOX_STYLE_DARK?.trim()
  return (mode === 'dark' ? dark : light) || STREETS_STYLE
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

function parseCoordString(value: string): number | null {
  const n = Number.parseFloat(value.trim())
  return Number.isFinite(n) ? n : null
}

export type UseTaskLocationMapInput = {
  accessToken: string | undefined
  location: string
  locationLat: string
  locationLng: string
  onLocationChange: (value: string) => void
  onLocationLatChange: (value: string) => void
  onLocationLngChange: (value: string) => void
  /** Locate-me couldn't tell where the poster is (denied, off, or too slow). */
  onLocateFailed?: () => void
  /** Extra Mapbox options (e.g. cooperative gestures). Read once per map. */
  mapOptions?: Partial<MapOptions>
  /** Add overlays to a new map (they live in its container). */
  onMapCreated?: (map: MapboxMap, mapboxgl: MapboxModule) => void
}

/**
 * Centre-pin location map: the map moves under a fixed pin. Dragging commits
 * the centre (then reverse geocodes a label); typing a place forward
 * geocodes and moves the map; locate-me commits the poster's position as a
 * drag would. Shared by the create stage and the edit card, so both have the
 * same style, logo corner and zoom buttons (top right).
 */
export function useTaskLocationMap({
  accessToken,
  location,
  locationLat,
  locationLng,
  onLocationChange,
  onLocationLatChange,
  onLocationLngChange,
  onLocateFailed,
  mapOptions,
  onMapCreated,
}: UseTaskLocationMapInput) {
  const { colorMode } = useColorMode()
  const mapRef = useRef<MapboxMap | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [locating, setLocating] = useState(false)
  const skipNextMoveEndRef = useRef(false)
  /** Drag commits the pin. The opening camera must not. */
  const pinDraggedRef = useRef(false)
  const moveDebounceRef = useRef<number | null>(null)
  const locationGeocodeTimerRef = useRef<number | null>(null)

  const accessTokenRef = useRef(accessToken)
  accessTokenRef.current = accessToken
  const mapStyle = taskLocationMapStyle(colorMode === 'dark' ? 'dark' : 'light')
  const mapStyleRef = useRef(mapStyle)
  mapStyleRef.current = mapStyle
  const mapOptionsRef = useRef(mapOptions)
  mapOptionsRef.current = mapOptions
  const onMapCreatedRef = useRef(onMapCreated)
  onMapCreatedRef.current = onMapCreated
  const onLocateFailedRef = useRef(onLocateFailed)
  onLocateFailedRef.current = onLocateFailed

  const locationLatRef = useRef(locationLat)
  const locationLngRef = useRef(locationLng)
  const locationRef = useRef(location)
  locationLatRef.current = locationLat
  locationLngRef.current = locationLng
  locationRef.current = location

  const onLocationChangeRef = useRef(onLocationChange)
  const onLocationLatChangeRef = useRef(onLocationLatChange)
  const onLocationLngChangeRef = useRef(onLocationLngChange)
  onLocationChangeRef.current = onLocationChange
  onLocationLatChangeRef.current = onLocationLatChange
  onLocationLngChangeRef.current = onLocationLngChange

  const applyCenter = useCallback(
    (lat: number, lng: number, opts?: { animate?: boolean }) => {
      const map = mapRef.current
      if (!map?.isStyleLoaded()) return
      skipNextMoveEndRef.current = true
      const animate = opts?.animate ?? true
      if (animate) {
        map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 13) })
      } else {
        map.jumpTo({ center: [lng, lat] })
      }
    },
    [],
  )

  /** The pin's new place, as a drag leaves it: the point, then its label. */
  const commitPin = useCallback((lat: number, lng: number) => {
    onLocationLatChangeRef.current(lat.toFixed(6))
    onLocationLngChangeRef.current(lng.toFixed(6))
    const token = accessTokenRef.current?.trim()
    if (!token) return
    void mapboxReverseGeocode(lat, lng, token)
      .then((name) => {
        if (name) onLocationChangeRef.current(name)
      })
      .catch(() => undefined)
  }, [])

  const attachMapContainer = useCallback(
    (el: HTMLDivElement | null) => {
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
      if (locationGeocodeTimerRef.current) {
        window.clearTimeout(locationGeocodeTimerRef.current)
        locationGeocodeTimerRef.current = null
      }
      if (moveDebounceRef.current) {
        window.clearTimeout(moveDebounceRef.current)
        moveDebounceRef.current = null
      }
      mapRef.current?.remove()
      mapRef.current = null
      skipNextMoveEndRef.current = false
      setMapReady(false)

      if (!el) return

      const token = accessTokenRef.current?.trim()
      if (!token) return

      const style = mapStyleRef.current
      // Which style the map wears, readable from the page (stories check it).
      el.dataset.mapStyle = style

      void Promise.all([ensureMapboxStyles(), import('mapbox-gl')]).then(
        ([, mapboxgl]) => {
          if (!el.isConnected) return
          mapboxgl.default.accessToken = token

          const lat =
            parseCoordString(locationLatRef.current) ?? TASK_MAP_PREVIEW_LAT
          const lng =
            parseCoordString(locationLngRef.current) ?? TASK_MAP_PREVIEW_LNG

          const map = new mapboxgl.default.Map({
            container: el,
            style,
            center: [lng, lat],
            zoom: 12,
            logoPosition: 'bottom-right',
            ...mapOptionsRef.current,
          })
          map.addControl(new mapboxgl.default.NavigationControl(), 'top-right')

          onMapCreatedRef.current?.(map, mapboxgl.default)
          mapRef.current = map

          const resizeObserver = new ResizeObserver(() => {
            mapRef.current?.resize()
          })
          resizeObserver.observe(el)
          resizeObserverRef.current = resizeObserver

          map.on('dragstart', () => {
            pinDraggedRef.current = true
          })

          const onMoveEnd = () => {
            if (skipNextMoveEndRef.current) {
              skipNextMoveEndRef.current = false
              return
            }
            if (!pinDraggedRef.current) return
            if (moveDebounceRef.current)
              window.clearTimeout(moveDebounceRef.current)
            moveDebounceRef.current = window.setTimeout(() => {
              const c = map.getCenter()
              // Resizes, zooms in place, and the camera arriving at a searched
              // place also end a move. The pin is already committed there.
              if (
                c.lat.toFixed(6) === locationLatRef.current &&
                c.lng.toFixed(6) === locationLngRef.current
              ) {
                return
              }
              commitPin(c.lat, c.lng)
            }, 350)
          }

          map.on('moveend', onMoveEnd)

          map.on('load', () => {
            if (!el.isConnected) return
            skipNextMoveEndRef.current = true
            bumpMapResize(map)
            setMapReady(true)
          })
        },
      )
    },
    [commitPin],
  )

  const prevCoordsKeyRef = useRef<string | null>(null)
  const coordsKey = `${locationLat}|${locationLng}`
  if (
    mapReady &&
    mapRef.current?.isStyleLoaded() &&
    coordsKey !== prevCoordsKeyRef.current
  ) {
    const lat = parseCoordString(locationLat)
    const lng = parseCoordString(locationLng)
    prevCoordsKeyRef.current = coordsKey
    if (lat != null && lng != null) {
      const current = mapRef.current.getCenter()
      const delta = Math.abs(current.lat - lat) + Math.abs(current.lng - lng)
      if (delta >= 1e-7) {
        queueMicrotask(() => {
          skipNextMoveEndRef.current = true
          mapRef.current?.jumpTo({ center: [lng, lat] })
        })
      }
    }
  }

  const suggestFromLocationQuery = useCallback(
    (query: string) => {
      if (!accessToken?.trim()) return
      const q = query.trim()
      if (q.length < 3) return

      const centre = mapRef.current?.getCenter()
      void mapboxForwardGeocode(q, accessToken, {
        proximity: centre ? { lat: centre.lat, lng: centre.lng } : null,
      }).then((hit) => {
        if (!hit) return
        onLocationLatChangeRef.current(hit.lat.toFixed(6))
        onLocationLngChangeRef.current(hit.lng.toFixed(6))
        onLocationChangeRef.current(hit.placeName)
        applyCenter(hit.lat, hit.lng)
      })
    },
    [accessToken, applyCenter],
  )

  const onLocationInputChange = (value: string) => {
    onLocationChangeRef.current(value)
    if (locationGeocodeTimerRef.current)
      window.clearTimeout(locationGeocodeTimerRef.current)
    locationGeocodeTimerRef.current = window.setTimeout(() => {
      suggestFromLocationQuery(value)
    }, 600)
  }

  const commitLocationQuery = () =>
    suggestFromLocationQuery(locationRef.current)

  /**
   * Locate-me (the search bar's button): the poster's position becomes the
   * pin and its label, as a drag would make them.
   */
  const locate = async () => {
    setLocating(true)
    const found = await currentPosition(true)
    setLocating(false)
    if (found) commitPin(found.lat, found.lng)
    else onLocateFailedRef.current?.()
  }

  return {
    attachMapContainer,
    mapRef,
    mapReady,
    onLocationInputChange,
    commitLocationQuery,
    locate,
    locating,
  }
}
