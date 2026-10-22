'use client'

import type { MapOptions, Map as MapboxMap } from 'mapbox-gl'
import { useCallback, useRef, useState } from 'react'

import {
  TASK_MAP_PREVIEW_LAT,
  TASK_MAP_PREVIEW_LNG,
} from '@/app/(stepflow)/tasks/create/helpers/resolveTaskLocation'
import { ensureMapboxStyles } from '@/utils/ensureMapboxStyles'
import {
  mapboxForwardGeocode,
  mapboxReverseGeocode,
} from '@/utils/mapboxGeocode'

type MapboxModule = typeof import('mapbox-gl').default

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
  /** Extra Mapbox options (style, logo corner). Read once per map. */
  mapOptions?: Partial<MapOptions>
  /** Add controls/overlays to a new map (they live in its container). */
  onMapCreated?: (map: MapboxMap, mapboxgl: MapboxModule) => void
  /** The poster starts moving the map (drag, pinch, wheel, keys); not flyTo. */
  onUserMoveStart?: () => void
}

/**
 * Centre-pin location map: the map moves under a fixed pin. Dragging commits
 * the centre (then reverse geocodes a label); typing a place forward
 * geocodes and moves the map. Shared by the create stage and the edit card.
 */
export function useTaskLocationMap({
  accessToken,
  location,
  locationLat,
  locationLng,
  onLocationChange,
  onLocationLatChange,
  onLocationLngChange,
  mapOptions,
  onMapCreated,
  onUserMoveStart,
}: UseTaskLocationMapInput) {
  const mapRef = useRef<MapboxMap | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const skipNextMoveEndRef = useRef(false)
  /** Drag commits the pin. The opening camera must not. */
  const pinDraggedRef = useRef(false)
  const moveDebounceRef = useRef<number | null>(null)
  const locationGeocodeTimerRef = useRef<number | null>(null)

  const accessTokenRef = useRef(accessToken)
  accessTokenRef.current = accessToken
  const mapOptionsRef = useRef(mapOptions)
  mapOptionsRef.current = mapOptions
  const onMapCreatedRef = useRef(onMapCreated)
  onMapCreatedRef.current = onMapCreated
  const onUserMoveStartRef = useRef(onUserMoveStart)
  onUserMoveStartRef.current = onUserMoveStart

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

  const attachMapContainer = useCallback((el: HTMLDivElement | null) => {
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
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [lng, lat],
          zoom: 12,
          ...mapOptionsRef.current,
        })

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

        // Gestures carry their input event; flyTo, jumpTo and resize don't.
        map.on('movestart', (event) => {
          if (event.originalEvent) onUserMoveStartRef.current?.()
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
            const latStr = c.lat.toFixed(6)
            const lngStr = c.lng.toFixed(6)
            // Resizes, zooms in place, and the camera arriving at a searched
            // place also end a move. The pin is already committed there.
            if (
              latStr === locationLatRef.current &&
              lngStr === locationLngRef.current
            ) {
              return
            }
            onLocationLatChangeRef.current(latStr)
            onLocationLngChangeRef.current(lngStr)

            const geocodeToken = accessTokenRef.current?.trim()
            if (!geocodeToken) return
            void mapboxReverseGeocode(c.lat, c.lng, geocodeToken).then(
              (name) => {
                if (name) onLocationChangeRef.current(name)
              },
            )
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
  }, [])

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

  return {
    attachMapContainer,
    mapRef,
    mapReady,
    onLocationInputChange,
    commitLocationQuery,
  }
}
