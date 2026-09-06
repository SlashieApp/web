import type { BrowseReferenceLocation } from '@/app/(task)/helpers/browseReferenceLocation'
import { URL_SEEDED_AREA_LABEL } from '@/app/(task)/helpers/browseReferenceLocation'

/**
 * URL codec for /workers. Area + filters live in the query string:
 *
 *   /workers?lat=51.54012&lng=-0.14370&radius=5&q=plumbing&verified=1
 */

export type WorkersUrlState = {
  lat?: number
  lng?: number
  radiusMiles?: number
  searchText?: string
  verifiedOnly?: boolean
}

export type WorkersPageSearchParams = Record<
  string,
  string | string[] | undefined
>

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value ?? undefined
}

function parseCoordinate(
  value: string | undefined,
  min: number,
  max: number,
): number | undefined {
  if (!value) return undefined
  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return undefined
  return parsed
}

export function parseWorkersUrlState(
  params: WorkersPageSearchParams,
): WorkersUrlState {
  const lat = parseCoordinate(firstParam(params.lat), -90, 90)
  const lng = parseCoordinate(firstParam(params.lng), -180, 180)
  const radiusRaw = Number.parseFloat(firstParam(params.radius) ?? '')

  return {
    lat: lat != null && lng != null ? lat : undefined,
    lng: lat != null && lng != null ? lng : undefined,
    radiusMiles:
      Number.isFinite(radiusRaw) && radiusRaw > 0 ? radiusRaw : undefined,
    searchText: firstParam(params.q)?.trim() || undefined,
    verifiedOnly: firstParam(params.verified) === '1' || undefined,
  }
}

export function referenceFromWorkersUrlState(
  state: WorkersUrlState,
): BrowseReferenceLocation | null {
  if (state.lat == null || state.lng == null) return null
  return {
    lat: state.lat,
    lng: state.lng,
    label: URL_SEEDED_AREA_LABEL,
    source: 'manual',
  }
}

export function buildWorkersUrl(state: WorkersUrlState): string {
  const params = new URLSearchParams()
  if (state.lat != null && state.lng != null) {
    params.set('lat', state.lat.toFixed(5))
    params.set('lng', state.lng.toFixed(5))
  }
  if (state.radiusMiles != null) {
    params.set('radius', String(Math.round(state.radiusMiles)))
  }
  if (state.searchText) params.set('q', state.searchText)
  if (state.verifiedOnly) params.set('verified', '1')
  const query = params.toString()
  return query ? `/workers?${query}` : '/workers'
}
