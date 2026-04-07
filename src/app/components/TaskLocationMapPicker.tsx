'use client'

import { Box, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { Map as MapboxMap } from 'mapbox-gl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { FormField, TextInput } from '@ui'

import 'mapbox-gl/dist/mapbox-gl.css'

const DEFAULT_LAT = 51.5074
const DEFAULT_LNG = -0.1278

function parseCoordString(value: string): number | null {
  const n = Number.parseFloat(value.trim())
  return Number.isFinite(n) ? n : null
}

async function mapboxForwardGeocode(
  query: string,
  accessToken: string,
): Promise<{ lat: number; lng: number; placeName: string } | null> {
  const q = query.trim()
  if (!q) return null
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${encodeURIComponent(accessToken)}&limit=1`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as {
    features?: { center?: [number, number]; place_name?: string }[]
  }
  const f = data.features?.[0]
  if (!f?.center) return null
  const [lng, lat] = f.center
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return {
    lat,
    lng,
    placeName: (f.place_name ?? q).trim(),
  }
}

async function mapboxReverseGeocode(
  lat: number,
  lng: number,
  accessToken: string,
): Promise<string | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${encodeURIComponent(accessToken)}&limit=1`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as {
    features?: { place_name?: string }[]
  }
  const name = data.features?.[0]?.place_name?.trim()
  return name && name.length > 0 ? name : null
}

export type TaskLocationMapPickerProps = {
  accessToken: string | undefined
  location: string
  locationLat: string
  locationLng: string
  onLocationChange: (value: string) => void
  onLocationLatChange: (value: string) => void
  onLocationLngChange: (value: string) => void
}

export function TaskLocationMapPicker({
  accessToken,
  location,
  locationLat,
  locationLng,
  onLocationChange,
  onLocationLatChange,
  onLocationLngChange,
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
  const coordGeocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

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
        onLocationLatChange(c.lat.toFixed(6))
        onLocationLngChange(c.lng.toFixed(6))
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
  }, [accessToken, onLocationLatChange, onLocationLngChange])

  // Sync map center when coordinates are edited via text fields (or external reset).
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
        onLocationLatChange(latStr)
        onLocationLngChange(lngStr)

        if (skipReverseAfterForwardRef.current) {
          skipReverseAfterForwardRef.current = false
          return
        }

        moveEndCountRef.current += 1
        // Skip reverse on the first moveend (Mapbox often fires after load);
        // keep the address field empty until the user pans/zooms or searches.
        if (moveEndCountRef.current < 2) return

        void mapboxReverseGeocode(c.lat, c.lng, accessToken).then((name) => {
          if (name) onLocationChange(name)
        })
      }, 350)
    }

    map.on('moveend', onMoveEnd)
    return () => {
      map.off('moveend', onMoveEnd)
      if (moveDebounceRef.current) clearTimeout(moveDebounceRef.current)
    }
  }, [
    mapReady,
    accessToken,
    onLocationChange,
    onLocationLatChange,
    onLocationLngChange,
  ])

  useEffect(() => {
    return () => {
      if (locationGeocodeTimerRef.current)
        clearTimeout(locationGeocodeTimerRef.current)
      if (coordGeocodeTimerRef.current)
        clearTimeout(coordGeocodeTimerRef.current)
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
        onLocationLatChange(hit.lat.toFixed(6))
        onLocationLngChange(hit.lng.toFixed(6))
        onLocationChange(hit.placeName)
        applyCenter(hit.lat, hit.lng)
      })
    },
    [
      accessToken,
      applyCenter,
      onLocationChange,
      onLocationLatChange,
      onLocationLngChange,
    ],
  )

  const onLocationInputChange = (value: string) => {
    onLocationChange(value)
    if (locationGeocodeTimerRef.current)
      clearTimeout(locationGeocodeTimerRef.current)
    locationGeocodeTimerRef.current = setTimeout(() => {
      suggestFromLocationQuery(value)
    }, 600)
  }

  const suggestFromCoordFields = useCallback(() => {
    if (!accessToken?.trim()) return
    const lat = parseCoordString(locationLat)
    const lng = parseCoordString(locationLng)
    if (lat == null || lng == null) return
    skipReverseAfterForwardRef.current = true
    applyCenter(lat, lng)
    void mapboxReverseGeocode(lat, lng, accessToken).then((name) => {
      if (name) onLocationChange(name)
    })
  }, [accessToken, applyCenter, locationLat, locationLng, onLocationChange])

  const coordSummary =
    parseCoordString(locationLat) != null &&
    parseCoordString(locationLng) != null
      ? `${locationLat.trim()}, ${locationLng.trim()}`
      : '—'

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
              Drag the map to place the pin — the centre is your task location.
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
              to pick a location on the map. You can still enter an address or
              coordinates below.
            </Text>
          </Box>
        )}
      </Box>

      <FormField
        label="Address or place name"
        helperText="Search updates the map and suggested coordinates. Coordinates: use decimal degrees (shown when you move the map)."
      >
        <TextInput
          value={location}
          onChange={(e) => onLocationInputChange(e.target.value)}
          placeholder="e.g. Hackney, London"
        />
      </FormField>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <FormField
          label="Latitude"
          helperText={`Suggested from search / map: ${coordSummary}`}
        >
          <TextInput
            type="text"
            inputMode="decimal"
            value={locationLat}
            onChange={(e) => onLocationLatChange(e.target.value)}
            onBlur={() => {
              if (coordGeocodeTimerRef.current)
                clearTimeout(coordGeocodeTimerRef.current)
              coordGeocodeTimerRef.current = setTimeout(() => {
                suggestFromCoordFields()
              }, 200)
            }}
            placeholder="e.g. 51.5074"
          />
        </FormField>
        <FormField label="Longitude">
          <TextInput
            type="text"
            inputMode="decimal"
            value={locationLng}
            onChange={(e) => onLocationLngChange(e.target.value)}
            onBlur={() => {
              if (coordGeocodeTimerRef.current)
                clearTimeout(coordGeocodeTimerRef.current)
              coordGeocodeTimerRef.current = setTimeout(() => {
                suggestFromCoordFields()
              }, 200)
            }}
            placeholder="e.g. -0.1278"
          />
        </FormField>
      </SimpleGrid>
    </Stack>
  )
}
