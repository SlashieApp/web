import type { BrowseReferenceLocation } from '../../helpers/browseReferenceLocation'
import { URL_SEEDED_AREA_LABEL } from '../../helpers/browseReferenceLocation'

/**
 * URL codec for the task /search surface. Viewport and filters live in the
 * query string so searches are shareable:
 *
 *   /search?lat=51.54012&lng=-0.14370&radius=5&q=plumber&category=handyman
 */

export type SearchUrlState = {
  lat?: number
  lng?: number
  radiusMiles?: number
  taskSearchText?: string
  taskCategory?: string
}

export type SearchPageSearchParams = Record<
  string,
  string | string[] | undefined
>

export function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
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

export function parseSearchUrlState(
  params: SearchPageSearchParams,
): SearchUrlState {
  const lat = parseCoordinate(firstSearchParam(params.lat), -90, 90)
  const lng = parseCoordinate(firstSearchParam(params.lng), -180, 180)
  const radiusRaw = Number.parseFloat(firstSearchParam(params.radius) ?? '')

  return {
    lat: lat != null && lng != null ? lat : undefined,
    lng: lat != null && lng != null ? lng : undefined,
    radiusMiles:
      Number.isFinite(radiusRaw) && radiusRaw > 0 ? radiusRaw : undefined,
    taskSearchText: firstSearchParam(params.q)?.trim() || undefined,
    taskCategory: firstSearchParam(params.category)?.trim() || undefined,
  }
}

/** Reference location seeded from a shared URL (label resolves via reverse geocode). */
export function referenceFromSearchUrlState(
  state: SearchUrlState,
): BrowseReferenceLocation | null {
  if (state.lat == null || state.lng == null) return null
  return {
    lat: state.lat,
    lng: state.lng,
    label: URL_SEEDED_AREA_LABEL,
    source: 'manual',
  }
}

/** Builds the shareable /search URL, omitting defaults to keep links short. */
export function buildSearchUrl(state: SearchUrlState): string {
  const params = new URLSearchParams()
  if (state.lat != null && state.lng != null) {
    params.set('lat', state.lat.toFixed(5))
    params.set('lng', state.lng.toFixed(5))
  }
  if (state.radiusMiles != null) {
    params.set('radius', String(Math.round(state.radiusMiles)))
  }
  if (state.taskSearchText) params.set('q', state.taskSearchText)
  if (state.taskCategory) params.set('category', state.taskCategory)
  const query = params.toString()
  return query ? `/search?${query}` : '/search'
}
