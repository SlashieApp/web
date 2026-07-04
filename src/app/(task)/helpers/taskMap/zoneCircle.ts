import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'

import { BRAND_MAP_RADIUS } from '@/theme/brand'

/** Approximate task zone radius shown instead of an exact point. */
export const TASK_ZONE_RADIUS_M = 400

export type ZoneCircleLayerIds = {
  source: string
  fill: string
  line: string
}

/** Circle polygon approximation around a lat/lng (Mapbox has no native circle-by-meters). */
export function zoneCirclePolygon(
  lat: number,
  lng: number,
  radiusMeters: number,
) {
  const latRad = (lat * Math.PI) / 180
  const cosLat = Math.cos(latRad)
  const ring: [number, number][] = []
  const steps = 64
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

/**
 * Idempotently upsert the brand zone-circle source + fill/line layers and set
 * its data. Pass `center: null` to clear the circle while keeping the layers.
 * Requires the style to be loaded.
 */
export function syncZoneCircle(
  map: MapboxMap,
  ids: ZoneCircleLayerIds,
  center: { lat: number; lng: number } | null,
  radiusMeters: number = TASK_ZONE_RADIUS_M,
) {
  const data = {
    type: 'FeatureCollection' as const,
    features: center
      ? [zoneCirclePolygon(center.lat, center.lng, radiusMeters)]
      : [],
  }

  const source = map.getSource(ids.source) as GeoJSONSource | undefined
  if (source) source.setData(data)
  else map.addSource(ids.source, { type: 'geojson', data })

  if (!map.getLayer(ids.fill)) {
    map.addLayer({
      id: ids.fill,
      type: 'fill',
      source: ids.source,
      paint: { 'fill-color': BRAND_MAP_RADIUS, 'fill-opacity': 0.16 },
    })
  } else {
    map.setPaintProperty(ids.fill, 'fill-color', BRAND_MAP_RADIUS)
    map.setPaintProperty(ids.fill, 'fill-opacity', 0.16)
  }

  if (!map.getLayer(ids.line)) {
    map.addLayer({
      id: ids.line,
      type: 'line',
      source: ids.source,
      paint: {
        'line-color': BRAND_MAP_RADIUS,
        'line-width': 2.5,
        'line-opacity': 0.55,
      },
    })
  } else {
    map.setPaintProperty(ids.line, 'line-color', BRAND_MAP_RADIUS)
    map.setPaintProperty(ids.line, 'line-width', 2.5)
    map.setPaintProperty(ids.line, 'line-opacity', 0.55)
  }
}
