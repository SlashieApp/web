import type { LocationInput } from '@codegen/schema'

import { mapboxForwardGeocode } from '@/utils/mapboxGeocode'

import type { WorkerSetupFormState } from './workerSetupFormState'

export const WORKER_SETUP_LOCATION_GEOCODE_ERROR =
  "We couldn't find that place. Try a city name or full postcode (e.g. London or WD17 2AW)."

function mapboxToken(): string | null {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim()
  return token || null
}

function hasCoordinates(lat: number | null, lng: number | null): boolean {
  return (
    lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)
  )
}

export type ResolvedWorkerSetupLocation = {
  location: LocationInput
  formPatch: Pick<
    WorkerSetupFormState,
    'locationName' | 'locationLat' | 'locationLng'
  >
}

/** Resolve a typed label to coordinates required by `area.location` save. */
export async function resolveWorkerSetupLocation(
  form: WorkerSetupFormState,
): Promise<ResolvedWorkerSetupLocation | null> {
  const label = form.locationName.trim()
  if (!label) return null

  if (hasCoordinates(form.locationLat, form.locationLng)) {
    return {
      location: {
        name: label,
        address: label,
        lat: form.locationLat,
        lng: form.locationLng,
      },
      formPatch: {
        locationName: label,
        locationLat: form.locationLat,
        locationLng: form.locationLng,
      },
    }
  }

  const token = mapboxToken()
  if (!token) return null

  const geocoded = await mapboxForwardGeocode(label, token)
  if (!geocoded) return null

  return {
    location: {
      name: geocoded.placeName,
      address: geocoded.placeName,
      lat: geocoded.lat,
      lng: geocoded.lng,
    },
    formPatch: {
      locationName: geocoded.placeName,
      locationLat: geocoded.lat,
      locationLng: geocoded.lng,
    },
  }
}
