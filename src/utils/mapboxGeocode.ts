/**
 * Mapbox Geocoding API helpers (forward + reverse).
 * Requires `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` on the client.
 */

/**
 * Slashie is UK-only, so matches stay in the UK; without this, a common
 * address such as "11 High Street" resolves to Australia. `proximity`
 * (the pin or map centre) picks the nearest of several UK matches.
 */
export async function mapboxForwardGeocode(
  query: string,
  accessToken: string,
  opts?: { proximity?: { lat: number; lng: number } | null },
): Promise<{ lat: number; lng: number; placeName: string } | null> {
  const q = query.trim()
  if (!q) return null
  const near = opts?.proximity
  const proximity =
    near && Number.isFinite(near.lat) && Number.isFinite(near.lng)
      ? `&proximity=${near.lng},${near.lat}`
      : ''
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${encodeURIComponent(accessToken)}&limit=1&country=gb${proximity}`
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

/**
 * Town / locality for a point, never a street or postcode: the public place
 * name for a task (FE-70). Returns the full Mapbox label, e.g.
 * "Bushey, Hertfordshire, England, United Kingdom".
 */
export async function mapboxReverseGeocodeArea(
  lat: number,
  lng: number,
  accessToken: string,
): Promise<string | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=locality,place&limit=1&access_token=${encodeURIComponent(accessToken)}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as {
    features?: { place_name?: string }[]
  }
  const name = data.features?.[0]?.place_name?.trim()
  return name && name.length > 0 ? name : null
}
