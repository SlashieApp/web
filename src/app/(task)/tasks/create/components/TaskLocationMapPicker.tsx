'use client'

import { Box, Input, Stack, Text } from '@chakra-ui/react'
import type { Map as MapboxMap } from 'mapbox-gl'
import { useCallback, useRef, useState } from 'react'

import {
  mapboxForwardGeocode,
  mapboxReverseGeocode,
} from '@/utils/mapboxGeocode'
import 'mapbox-gl/dist/mapbox-gl.css'

const DEFAULT_LAT = 51.5074
const DEFAULT_LNG = -0.1278

function parseCoordString(value: string): number | null {
  const n = Number.parseFloat(value.trim())
  return Number.isFinite(n) ? n : null
}

export type TaskLocationMapPickerProps = {
  accessToken: string | undefined
  location: string
  locationLat: string
  locationLng: string
  onLocationChange: (value: string) => void
  onLocationLatChange: (value: string) => void
  onLocationLngChange: (value: string) => void
  /** When false, omits the paragraph under the map (parent can supply copy). */
  showCoordinateHelpText?: boolean
}

export function TaskLocationMapPicker({
  accessToken,
  location,
  locationLat,
  locationLng,
  onLocationChange,
  onLocationLatChange,
  onLocationLngChange,
  showCoordinateHelpText = true,
}: TaskLocationMapPickerProps) {
  const mapRef = useRef<MapboxMap | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const skipReverseAfterForwardRef = useRef(false)
  const moveEndCountRef = useRef(0)
  const moveDebounceRef = useRef<number | null>(null)
  const locationGeocodeTimerRef = useRef<number | null>(null)

  const accessTokenRef = useRef(accessToken)
  accessTokenRef.current = accessToken

  const locationLatRef = useRef(locationLat)
  const locationLngRef = useRef(locationLng)
  locationLatRef.current = locationLat
  locationLngRef.current = locationLng

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
    moveEndCountRef.current = 0
    setMapReady(false)

    if (!el) return

    const token = accessTokenRef.current?.trim()
    if (!token) return

    void import('mapbox-gl').then((mapboxgl) => {
      if (!el.isConnected) return
      mapboxgl.default.accessToken = token

      const lat = parseCoordString(locationLatRef.current) ?? DEFAULT_LAT
      const lng = parseCoordString(locationLngRef.current) ?? DEFAULT_LNG

      const map = new mapboxgl.default.Map({
        container: el,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: 12,
      })

      map.addControl(new mapboxgl.default.NavigationControl(), 'top-right')
      mapRef.current = map

      const onMoveEnd = () => {
        if (moveDebounceRef.current)
          window.clearTimeout(moveDebounceRef.current)
        moveDebounceRef.current = window.setTimeout(() => {
          const c = map.getCenter()
          const latStr = c.lat.toFixed(6)
          const lngStr = c.lng.toFixed(6)
          onLocationLatChangeRef.current(latStr)
          onLocationLngChangeRef.current(lngStr)

          if (skipReverseAfterForwardRef.current) {
            skipReverseAfterForwardRef.current = false
            return
          }

          moveEndCountRef.current += 1
          if (moveEndCountRef.current < 2) return

          const geocodeToken = accessTokenRef.current?.trim()
          if (!geocodeToken) return
          void mapboxReverseGeocode(c.lat, c.lng, geocodeToken).then((name) => {
            if (name) onLocationChangeRef.current(name)
          })
        }, 350)
      }

      map.on('moveend', onMoveEnd)

      map.on('load', () => {
        if (!el.isConnected) return
        const c = map.getCenter()
        onLocationLatChangeRef.current(c.lat.toFixed(6))
        onLocationLngChangeRef.current(c.lng.toFixed(6))
        setMapReady(true)
      })
    })
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

      void mapboxForwardGeocode(q, accessToken).then((hit) => {
        if (!hit) return
        skipReverseAfterForwardRef.current = true
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

  const token = accessToken?.trim()

  return (
    <Stack gap={4}>
      <Box
        position="relative"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="ghostBorder"
        borderWidth="1px"
        borderColor="cardBorder"
        h={{ base: '240px', md: '320px' }}
        bg="cardBg"
      >
        {token ? (
          <>
            <Box ref={attachMapContainer} w="full" h="full" aria-hidden />
            <Box position="absolute" left={3} right={3} top={3} zIndex={2}>
              <Input
                value={location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onLocationInputChange(e.target.value)
                }
                placeholder="Search for your location..."
                bg="whiteAlpha.950"
                backdropFilter="blur(8px)"
                borderWidth="1px"
                borderColor="cardBorder"
                borderRadius="lg"
                boxShadow="sm"
                aria-label="Search for your location"
              />
            </Box>
            <Box
              pointerEvents="none"
              position="absolute"
              left="50%"
              top="50%"
              w="32px"
              h="32px"
              ml="-16px"
              mt="-28px"
              zIndex={2}
              aria-hidden
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Selected location</title>
                <path
                  d="M12 0C5.383 0 0 5.285 0 11.8c0 6.515 12 20.2 12 20.2s12-13.685 12-20.2C24 5.285 18.617 0 12 0z"
                  fill="#1A56DB"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </svg>
            </Box>
            <Text
              position="absolute"
              bottom={2}
              left={2}
              right={2}
              fontSize="xs"
              color="jobCardTitle"
              bg="whiteAlpha.900"
              backdropFilter="blur(6px)"
              borderRadius="md"
              px={2}
              py={1}
              textAlign="center"
              pointerEvents="none"
            >
              Drag the map or search — the pin marks where workers will find
              your task.
            </Text>
          </>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="full"
            px={4}
          >
            <Text color="formLabelMuted" fontSize="sm" textAlign="center">
              Set{' '}
              <Text as="span" fontWeight={700} color="jobCardTitle">
                NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
              </Text>{' '}
              to pick a location on the map.
            </Text>
          </Box>
        )}
      </Box>

      {showCoordinateHelpText ? (
        <Text fontSize="sm" color="formLabelMuted">
          Adjust the map or use the search box. Map coordinates and the place
          label from Mapbox are saved for matching only — workers see
          approximate area, not your full street address, until you accept a
          quote.
        </Text>
      ) : null}
    </Stack>
  )
}
