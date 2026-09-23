import { mapboxForwardGeocode } from '@/utils/mapboxGeocode'

/** Camera-only centre. Never submit these unless the poster put the pin here. */
export const TASK_MAP_PREVIEW_LAT = 51.5074
export const TASK_MAP_PREVIEW_LNG = -0.1278

export const TASK_LOCATION_GEOCODE_ERROR =
  "We couldn't find that place. Search for it on the map, or enter a clearer address."

export const TASK_LOCATION_MISSING_ERROR =
  'Search or move the map to set your task area.'

function finiteCoord(value: string): number | null {
  const n = Number.parseFloat(value.trim())
  return Number.isFinite(n) ? n : null
}

/** Street address wins; the map label is the fallback. */
export function taskLocationGeocodeQuery(
  streetAddress: string,
  mapPlaceName: string,
): string {
  return streetAddress.trim() || mapPlaceName.trim()
}

export type ResolvedTaskLocation = {
  lat: number
  lng: number
  placeName: string
}

/**
 * Coordinates to store for a task. A pin the poster moved or a place they
 * searched is kept. Otherwise the address (then the map label) is geocoded,
 * so a London map preview is not saved for somewhere else.
 */
export async function resolveSubmittedTaskLocation(input: {
  streetAddress: string
  mapPlaceName: string
  locationLat: string
  locationLng: string
  pinChosen: boolean
  accessToken: string | undefined
}): Promise<
  { ok: true; location: ResolvedTaskLocation } | { ok: false; error: string }
> {
  const placeName = input.mapPlaceName.trim()
  const lat = finiteCoord(input.locationLat)
  const lng = finiteCoord(input.locationLng)

  if (input.pinChosen && lat != null && lng != null) {
    return {
      ok: true,
      location: { lat, lng, placeName },
    }
  }

  const query = taskLocationGeocodeQuery(
    input.streetAddress,
    input.mapPlaceName,
  )
  if (!query) return { ok: false, error: TASK_LOCATION_MISSING_ERROR }

  const token = input.accessToken?.trim()
  if (!token) return { ok: false, error: TASK_LOCATION_GEOCODE_ERROR }

  const hit = await mapboxForwardGeocode(query, token)
  if (!hit) return { ok: false, error: TASK_LOCATION_GEOCODE_ERROR }

  return {
    ok: true,
    location: {
      lat: hit.lat,
      lng: hit.lng,
      placeName: placeName || hit.placeName,
    },
  }
}
