import type { BrowseReferenceLocation } from '../../helpers/browseReferenceLocation'
import { URL_SEEDED_AREA_LABEL } from '../../helpers/browseReferenceLocation'

/**
 * URL codec for the unified /search surface. Mode, viewport, and per-mode
 * filters live in the query string so searches are shareable:
 *
 *   /search?mode=workers&lat=51.54012&lng=-0.14370&radius=5&verified=1
 *
 * Params: `mode` (tasks | workers), `lat`/`lng`/`radius` (shared viewport),
 * `q`/`category` (tasks mode), `wq`/`verified` (workers mode).
 */
export type SearchMode = 'tasks' | 'workers'

export const DEFAULT_SEARCH_MODE: SearchMode = 'tasks'

export type SearchUrlState = {
  mode: SearchMode
  lat?: number
  lng?: number
  radiusMiles?: number
  taskSearchText?: string
  taskCategory?: string
  workerSearchText?: string
  workerVerifiedOnly?: boolean
}

export type SearchPageSearchParams = Record<
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

export function parseSearchMode(value: string | undefined): SearchMode {
  return value === 'workers' ? 'workers' : DEFAULT_SEARCH_MODE
}

export function parseSearchUrlState(
  params: SearchPageSearchParams,
): SearchUrlState {
  const lat = parseCoordinate(firstParam(params.lat), -90, 90)
  const lng = parseCoordinate(firstParam(params.lng), -180, 180)
  const radiusRaw = Number.parseFloat(firstParam(params.radius) ?? '')

  return {
    mode: parseSearchMode(firstParam(params.mode)),
    // A center is only valid as a pair.
    lat: lat != null && lng != null ? lat : undefined,
    lng: lat != null && lng != null ? lng : undefined,
    radiusMiles:
      Number.isFinite(radiusRaw) && radiusRaw > 0 ? radiusRaw : undefined,
    taskSearchText: firstParam(params.q)?.trim() || undefined,
    taskCategory: firstParam(params.category)?.trim() || undefined,
    workerSearchText: firstParam(params.wq)?.trim() || undefined,
    workerVerifiedOnly: firstParam(params.verified) === '1' || undefined,
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
  if (state.mode !== DEFAULT_SEARCH_MODE) params.set('mode', state.mode)
  if (state.lat != null && state.lng != null) {
    params.set('lat', state.lat.toFixed(5))
    params.set('lng', state.lng.toFixed(5))
  }
  if (state.radiusMiles != null) {
    params.set('radius', String(Math.round(state.radiusMiles)))
  }
  if (state.mode === 'tasks') {
    if (state.taskSearchText) params.set('q', state.taskSearchText)
    if (state.taskCategory) params.set('category', state.taskCategory)
  } else {
    if (state.workerSearchText) params.set('wq', state.workerSearchText)
    if (state.workerVerifiedOnly) params.set('verified', '1')
  }
  const query = params.toString()
  return query ? `/search?${query}` : '/search'
}
