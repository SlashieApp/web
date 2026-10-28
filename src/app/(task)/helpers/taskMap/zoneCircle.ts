import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'

import { BRAND_MAP_RADIUS } from '@/theme/brand'

/**
 * Approximate-area radius for **privacy** maps (task-detail approximate,
 * worker service area). `/search` browse selection must not call
 * `syncZoneCircle` — selected search chrome is a pin on lat/lng. The shared
 * controller draws it only for an `approxZone` (task detail, FE-472).
 */
export const TASK_ZONE_RADIUS_M = 400

export type ZoneCircleLayerIds = {
  source: string
  fill: string
  line: string
}

export type ZoneCirclePaint = {
  fillColor: string
  fillOpacity: number
  lineColor: string
  lineOpacity: number
  lineWidth: number
}

/** The worker service-area look; task detail's approximate circle passes its own. */
export const ZONE_CIRCLE_PAINT: ZoneCirclePaint = {
  fillColor: BRAND_MAP_RADIUS,
  fillOpacity: 0.16,
  lineColor: BRAND_MAP_RADIUS,
  lineOpacity: 0.55,
  lineWidth: 2.5,
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
  paint: ZoneCirclePaint = ZONE_CIRCLE_PAINT,
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
      paint: {
        'fill-color': paint.fillColor,
        'fill-opacity': paint.fillOpacity,
      },
    })
  } else {
    map.setPaintProperty(ids.fill, 'fill-color', paint.fillColor)
    map.setPaintProperty(ids.fill, 'fill-opacity', paint.fillOpacity)
  }

  if (!map.getLayer(ids.line)) {
    map.addLayer({
      id: ids.line,
      type: 'line',
      source: ids.source,
      paint: {
        'line-color': paint.lineColor,
        'line-width': paint.lineWidth,
        'line-opacity': paint.lineOpacity,
      },
    })
  } else {
    map.setPaintProperty(ids.line, 'line-color', paint.lineColor)
    map.setPaintProperty(ids.line, 'line-width', paint.lineWidth)
    map.setPaintProperty(ids.line, 'line-opacity', paint.lineOpacity)
  }
}
