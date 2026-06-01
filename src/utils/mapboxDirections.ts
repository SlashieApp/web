/**
 * Mapbox Directions API — driving route as GeoJSON LineString coordinates.
 * Requires `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` on the client.
 */

export type MapboxRouteLine = {
  type: 'LineString'
  coordinates: [number, number][]
}

const routeCache = new Map<string, MapboxRouteLine>()

function routeCacheKey(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
): string {
  const r = (n: number) => n.toFixed(5)
  return `${r(fromLng)},${r(fromLat)};${r(toLng)},${r(toLat)}`
}

export async function mapboxDrivingRoute(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  accessToken: string,
  signal?: AbortSignal,
): Promise<MapboxRouteLine | null> {
  if (
    !Number.isFinite(fromLng) ||
    !Number.isFinite(fromLat) ||
    !Number.isFinite(toLng) ||
    !Number.isFinite(toLat)
  ) {
    return null
  }

  const key = routeCacheKey(fromLng, fromLat, toLng, toLat)
  const cached = routeCache.get(key)
  if (cached) return cached

  const coords = `${fromLng},${fromLat};${toLng},${toLat}`
  const url = new URL(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}`,
  )
  url.searchParams.set('geometries', 'geojson')
  url.searchParams.set('overview', 'full')
  url.searchParams.set('access_token', accessToken.trim())

  const res = await fetch(url.toString(), { signal })
  if (!res.ok) return null

  const data = (await res.json()) as {
    routes?: { geometry?: MapboxRouteLine }[]
  }
  const geometry = data.routes?.[0]?.geometry
  if (
    geometry?.type !== 'LineString' ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length < 2
  ) {
    return null
  }

  routeCache.set(key, geometry)
  return geometry
}
