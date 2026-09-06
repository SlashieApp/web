import type { Map as MapboxMap } from 'mapbox-gl'

import {
  syncZoneCircle,
  zoneCirclePolygon,
} from '@/app/(task)/helpers/taskMap/zoneCircle'
import { ensureMapboxStyles } from '@/utils/ensureMapboxStyles'

const DEFAULT_STYLE = 'mapbox://styles/mapbox/streets-v12'
const MILES_TO_METERS = 1609.344

const AREA_LAYERS = {
  source: 'workers-search-area',
  fill: 'workers-search-area-fill',
  line: 'workers-search-area-line',
} as const

function styleUrlForMode(mode: 'light' | 'dark' | null | undefined): string {
  const light = process.env.NEXT_PUBLIC_MAPBOX_STYLE_LIGHT?.trim()
  const dark = process.env.NEXT_PUBLIC_MAPBOX_STYLE_DARK?.trim()
  if (mode === 'dark') return dark || DEFAULT_STYLE
  if (mode === 'light') return light || DEFAULT_STYLE
  return DEFAULT_STYLE
}

function radiusMeters(miles: number): number {
  const safe = Number.isFinite(miles) && miles > 0 ? miles : 10
  return Math.max(200, safe * MILES_TO_METERS)
}

function fitArea(
  map: MapboxMap,
  lat: number,
  lng: number,
  miles: number,
  animate: boolean,
) {
  const ring = zoneCirclePolygon(lat, lng, radiusMeters(miles)).geometry
    .coordinates[0]
  let minLng = ring[0][0]
  let minLat = ring[0][1]
  let maxLng = ring[0][0]
  let maxLat = ring[0][1]
  for (const [nextLng, nextLat] of ring) {
    if (nextLng < minLng) minLng = nextLng
    if (nextLng > maxLng) maxLng = nextLng
    if (nextLat < minLat) minLat = nextLat
    if (nextLat > maxLat) maxLat = nextLat
  }
  map.fitBounds(
    [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
    { padding: 36, duration: animate ? 420 : 0, maxZoom: 13.5 },
  )
}

export type WorkersAreaMapController = {
  setArea: (lat: number, lng: number, miles: number) => void
  setThemeMode: (mode: 'light' | 'dark') => void
  resize: () => void
  destroy: () => void
}

export function createWorkersAreaMapController(args: {
  container: HTMLDivElement
  accessToken: string
  lat: number
  lng: number
  radiusMiles: number
  themeMode: 'light' | 'dark'
  onMapReady?: () => void
}): WorkersAreaMapController {
  let cancelled = false
  let map: MapboxMap | null = null
  let lat = args.lat
  let lng = args.lng
  let miles = args.radiusMiles
  let themeMode = args.themeMode

  const paintArea = (m: MapboxMap) => {
    syncZoneCircle(m, AREA_LAYERS, { lat, lng }, radiusMeters(miles))
  }

  void Promise.all([ensureMapboxStyles(), import('mapbox-gl')]).then(
    ([, mapboxgl]) => {
      if (cancelled) return
      mapboxgl.default.accessToken = args.accessToken

      const m = new mapboxgl.default.Map({
        container: args.container,
        style: styleUrlForMode(themeMode),
        center: [lng, lat],
        zoom: 11,
        attributionControl: false,
      })
      m.scrollZoom.disable()
      map = m

      m.on('load', () => {
        if (cancelled) return
        paintArea(m)
        fitArea(m, lat, lng, miles, false)
        args.onMapReady?.()
      })
      m.on('style.load', () => {
        if (cancelled || !m.isStyleLoaded()) return
        paintArea(m)
      })
    },
  )

  return {
    setArea(nextLat, nextLng, nextMiles) {
      lat = nextLat
      lng = nextLng
      miles = nextMiles
      const m = map
      if (!m?.isStyleLoaded()) return
      paintArea(m)
      fitArea(m, lat, lng, miles, true)
    },
    setThemeMode(mode) {
      if (mode === themeMode) return
      themeMode = mode
      map?.setStyle(styleUrlForMode(mode))
    },
    resize() {
      map?.resize()
    },
    destroy() {
      cancelled = true
      map?.remove()
      map = null
    },
  }
}
