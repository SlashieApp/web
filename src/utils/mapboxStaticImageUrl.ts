import { BRAND_MAP_PIN_HEX, BRAND_MAP_RADIUS } from '@/theme/brand'

const DEFAULT_STYLE = 'mapbox/light-v11'
const APPROX_RADIUS_M = 400
const BRAND_PIN_COLOR = BRAND_MAP_PIN_HEX

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
    properties: {
      // Approximate-radius overlay uses SDL info (status.info.solid) via brand.ts.
      fill: BRAND_MAP_RADIUS,
      'fill-opacity': 0.12,
      stroke: BRAND_MAP_RADIUS,
      'stroke-width': 2,
      'stroke-opacity': 0.4,
    },
    geometry: { type: 'Polygon' as const, coordinates: [ring] },
  }
}

export type MapboxStaticMapVariant = 'exact' | 'approximate'

export function parseMapHeightPx(height: string | undefined): number {
  if (!height) return 200
  const n = Number.parseInt(height.replace(/px$/i, '').trim(), 10)
  return Number.isFinite(n) && n > 0 ? Math.min(n, 1280) : 200
}

/** Mapbox Static Images API URL for task detail location previews. */
export function buildMapboxStaticImageUrl(options: {
  accessToken: string
  lat: number
  lng: number
  width?: number
  heightPx?: number
  variant: MapboxStaticMapVariant
  stylePath?: string
}): string {
  const { accessToken, lat, lng, variant, stylePath = DEFAULT_STYLE } = options
  const width = Math.min(1280, Math.max(1, options.width ?? 640))
  const heightPx = Math.min(1280, Math.max(1, options.heightPx ?? 200))
  const zoom = variant === 'exact' ? 15 : 12.5

  const overlays =
    variant === 'exact'
      ? `pin-l+${BRAND_PIN_COLOR}(${lng},${lat})`
      : `geojson(${encodeURIComponent(
          JSON.stringify({
            type: 'FeatureCollection',
            features: [circlePolygon(lat, lng, APPROX_RADIUS_M)],
          }),
        )})`

  const position = `${lng},${lat},${zoom},0,0`
  const size = `${width}x${heightPx}@2x`
  const token = encodeURIComponent(accessToken.trim())

  return `https://api.mapbox.com/styles/v1/${stylePath}/static/${overlays}/${position}/${size}?access_token=${token}`
}
