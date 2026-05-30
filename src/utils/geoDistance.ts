/** Haversine distance in miles between two WGS84 points. */
export function distanceMilesBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 3958.8
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/** GraphQL / JSON often returns coordinates as strings. */
export function parseGeoCoord(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number.parseFloat(value.trim())
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** Human-readable distance from a reference point (e.g. "2.1 miles away"). */
export function formatDistanceAwayLabel(
  miles: number | null,
): string | undefined {
  if (miles == null || !Number.isFinite(miles)) return undefined
  if (miles < 0.05) return 'Nearby'
  if (miles < 10) return `${miles.toFixed(1)} miles away`
  return `${Math.round(miles)} miles away`
}
