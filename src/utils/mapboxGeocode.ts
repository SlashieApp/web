/**
 * Mapbox Geocoding API helpers (forward + reverse).
 * Requires `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` on the client.
 */

export async function mapboxForwardGeocode(
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

export async function mapboxReverseGeocode(
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
