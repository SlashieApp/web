import {
  TASK_MAP_PREVIEW_LAT,
  TASK_MAP_PREVIEW_LNG,
} from './resolveTaskLocation'

export type CreateTaskLatLng = { lat: number; lng: number }

export type CreateTaskStartCentre = CreateTaskLatLng & {
  /**
   * `search` and `geolocation` are starting pins the poster confirms with
   * Continue. `default` (London) is a camera only, never a chosen pin.
   */
  source: 'search' | 'geolocation' | 'default'
}

function validLatLng(lat: number, lng: number): CreateTaskLatLng | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng }
}

/** `/search` map centre carried as `?from=search&lat=&lng=`. */
export function createTaskSearchCentreFromQuery(
  search: string,
): CreateTaskLatLng | null {
  const params = new URLSearchParams(search)
  if (params.get('from') !== 'search') return null
  const lat = params.get('lat')?.trim()
  const lng = params.get('lng')?.trim()
  if (!lat || !lng) return null
  return validLatLng(Number(lat), Number(lng))
}

/**
 * Where the create map opens: the `/search` centre, else the poster's
 * current location, else London.
 */
export function resolveCreateTaskStartCentre(input: {
  search: string
  geolocated?: CreateTaskLatLng | null
}): CreateTaskStartCentre {
  const fromSearch = createTaskSearchCentreFromQuery(input.search)
  if (fromSearch) return { ...fromSearch, source: 'search' }

  const located = input.geolocated
    ? validLatLng(input.geolocated.lat, input.geolocated.lng)
    : null
  if (located) return { ...located, source: 'geolocation' }

  return {
    lat: TASK_MAP_PREVIEW_LAT,
    lng: TASK_MAP_PREVIEW_LNG,
    source: 'default',
  }
}
