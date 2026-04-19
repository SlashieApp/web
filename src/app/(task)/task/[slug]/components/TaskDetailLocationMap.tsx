'use client'

import { Box } from '@chakra-ui/react'
import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'
import { useCallback, useRef } from 'react'

import 'mapbox-gl/dist/mapbox-gl.css'

const SOURCE_ID = 'task-approx-area'
const FILL_LAYER_ID = 'task-approx-fill'
const LINE_LAYER_ID = 'task-approx-line'
const APPROX_RADIUS_M = 400

function circlePolygon(
  lat: number,
  lng: number,
  radiusMeters: number,
  steps = 48,
) {
  const latRad = (lat * Math.PI) / 180
  const cosLat = Math.cos(latRad)
  const ring: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI
    const dLng =
      (radiusMeters * Math.cos(angle)) / (111111 * Math.max(cosLat, 0.01))
    const dLat = (radiusMeters * Math.sin(angle)) / 111111
    ring.push([lng + dLng, lat + dLat])
  }
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'Polygon' as const, coordinates: [ring] },
  }
}

export type TaskDetailLocationMapProps = {
  accessToken: string | undefined
  lat: number
  lng: number
}

export function TaskDetailLocationMap({
  accessToken,
  lat,
  lng,
}: TaskDetailLocationMapProps) {
  const mapRef = useRef<MapboxMap | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const coordsRef = useRef({ lat, lng })
  coordsRef.current = { lat, lng }

  const prevLatLngRef = useRef({ lat, lng })
  if (prevLatLngRef.current.lat !== lat || prevLatLngRef.current.lng !== lng) {
    prevLatLngRef.current = { lat, lng }
    const map = mapRef.current
    const nextLat = lat
    const nextLng = lng
    queueMicrotask(() => {
      if (!map?.isStyleLoaded()) return
      if (!map.getSource(SOURCE_ID)) return
      const src = map.getSource(SOURCE_ID) as GeoJSONSource
      src.setData(circlePolygon(nextLat, nextLng, APPROX_RADIUS_M))
      map.jumpTo({ center: [nextLng, nextLat] })
    })
  }

  const setContainerRef = useCallback(
    (el: HTMLDivElement | null) => {
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
      mapRef.current?.remove()
      mapRef.current = null

      if (!el || !accessToken?.trim()) return

      const ro = new ResizeObserver(() => {
        mapRef.current?.resize()
      })
      ro.observe(el)
      resizeObserverRef.current = ro

      void import('mapbox-gl').then((mapboxgl) => {
        if (!el.isConnected) return
        mapboxgl.default.accessToken = accessToken

        const { lat: startLat, lng: startLng } = coordsRef.current
        const map = new mapboxgl.default.Map({
          container: el,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [startLng, startLat],
          zoom: 12.5,
          scrollZoom: false,
          boxZoom: false,
          dragRotate: false,
          pitchWithRotate: false,
          keyboard: false,
          doubleClickZoom: false,
        })

        mapRef.current = map

        map.on('load', () => {
          if (!el.isConnected) return
          const { lat: la, lng: ln } = coordsRef.current
          const data = circlePolygon(la, ln, APPROX_RADIUS_M)
          map.addSource(SOURCE_ID, { type: 'geojson', data })
          map.addLayer({
            id: FILL_LAYER_ID,
            type: 'fill',
            source: SOURCE_ID,
            paint: {
              'fill-color': '#1A56DB',
              'fill-opacity': 0.12,
            },
          })
          map.addLayer({
            id: LINE_LAYER_ID,
            type: 'line',
            source: SOURCE_ID,
            paint: {
              'line-color': '#1A56DB',
              'line-width': 2,
              'line-opacity': 0.4,
            },
          })
        })
      })
    },
    [accessToken],
  )

  return (
    <Box
      ref={setContainerRef}
      w="full"
      h="200px"
      borderRadius="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor="cardBorder"
      bg="cardBg"
    />
  )
}
