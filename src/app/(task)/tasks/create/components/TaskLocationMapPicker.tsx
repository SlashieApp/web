'use client'

import { Box, Stack, Text } from '@chakra-ui/react'
import type { Map as MapboxMap } from 'mapbox-gl'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  mapboxForwardGeocode,
  mapboxReverseGeocode,
} from '@/utils/mapboxGeocode'
import { TextInput } from '@ui'

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
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const skipReverseAfterForwardRef = useRef(false)
  const moveEndCountRef = useRef(0)
  const moveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const locationGeocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: map mounts once per token; centre updates use a separate effect
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

      const lat = parseCoordString(locationLat) ?? DEFAULT_LAT
      const lng = parseCoordString(locationLng) ?? DEFAULT_LNG

      const map = new mapboxgl.default.Map({
        container,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: 12,
      })

      map.addControl(new mapboxgl.default.NavigationControl(), 'top-right')
      mapRef.current = map

      map.on('load', () => {
        if (cancelled) return
        const c = map.getCenter()
        onLocationLatChangeRef.current(c.lat.toFixed(6))
        onLocationLngChangeRef.current(c.lng.toFixed(6))
        setMapReady(true)
      })
    })

    return () => {
      cancelled = true
      moveEndCountRef.current = 0
      if (moveDebounceRef.current) clearTimeout(moveDebounceRef.current)
      mapRef.current?.remove()
      mapRef.current = null
      setMapReady(false)
    }
  }, [accessToken])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map?.isStyleLoaded()) return
    const lat = parseCoordString(locationLat)
    const lng = parseCoordString(locationLng)
    if (lat == null || lng == null) return
    const current = map.getCenter()
    const delta = Math.abs(current.lat - lat) + Math.abs(current.lng - lng)
    if (delta < 1e-7) return
    map.jumpTo({ center: [lng, lat] })
  }, [mapReady, locationLat, locationLng])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map || !accessToken?.trim()) return

    const onMoveEnd = () => {
      if (moveDebounceRef.current) clearTimeout(moveDebounceRef.current)
      moveDebounceRef.current = setTimeout(() => {
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

        void mapboxReverseGeocode(c.lat, c.lng, accessToken).then((name) => {
          if (name) onLocationChangeRef.current(name)
        })
      }, 350)
    }

    map.on('moveend', onMoveEnd)
    return () => {
      map.off('moveend', onMoveEnd)
      if (moveDebounceRef.current) clearTimeout(moveDebounceRef.current)
    }
  }, [mapReady, accessToken])

  useEffect(() => {
    return () => {
      if (locationGeocodeTimerRef.current)
        clearTimeout(locationGeocodeTimerRef.current)
    }
  }, [])

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
      clearTimeout(locationGeocodeTimerRef.current)
    locationGeocodeTimerRef.current = setTimeout(() => {
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
        borderColor="border"
        h={{ base: '240px', md: '320px' }}
        bg="surfaceContainerLow"
      >
        {token ? (
          <>
            <Box ref={containerRef} w="full" h="full" aria-hidden />
            <Box position="absolute" left={3} right={3} top={3} zIndex={2}>
              <TextInput
                value={location}
                onChange={(e) => onLocationInputChange(e.target.value)}
                placeholder="Search for your location..."
                bg="surfaceContainerLowest/95"
                backdropFilter="blur(8px)"
                borderWidth="1px"
                borderColor="border"
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
              color="fg"
              bg="surfaceContainerLowest/90"
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
            <Text color="muted" fontSize="sm" textAlign="center">
              Set{' '}
              <Text as="span" fontWeight={700} color="fg">
                NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
              </Text>{' '}
              to pick a location on the map.
            </Text>
          </Box>
        )}
      </Box>

      {showCoordinateHelpText ? (
        <Text fontSize="sm" color="muted">
          Adjust the map or use the search box. Map coordinates and the place
          label from Mapbox are saved for matching only — workers see
          approximate area, not your full street address, until you accept an
          offer.
        </Text>
      ) : null}
    </Stack>
  )
}
