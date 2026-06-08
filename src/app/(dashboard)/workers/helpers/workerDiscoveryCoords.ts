import type { MeQuery } from '@codegen/schema'

import type { UserGeoCoords } from './buildSearchProfessionalsVariables'

/** Signed-in user's worker service-area coordinates for Near me discovery. */
export function workerDiscoveryCoordsFromMe(
  me: MeQuery['me'] | null | undefined,
): UserGeoCoords | null {
  const lat = me?.worker?.locationLat
  const lng = me?.worker?.locationLng
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null
  }
  return { lat, lng }
}
