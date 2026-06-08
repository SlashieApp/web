import type { WorkerFilter, WorkerSort } from '@codegen/schema'
import { SortDirection, WorkerSortField } from '@codegen/schema'

export type WorkersDiscoveryState = {
  search: string
  verifiedOnly: boolean
  nearMe: boolean
}

export type UserGeoCoords = {
  lat: number
  lng: number
}

export function buildSearchProfessionalsVariables(
  state: WorkersDiscoveryState,
  userCoords?: UserGeoCoords | null,
): { filter?: WorkerFilter; sort?: WorkerSort } {
  const filter: WorkerFilter = {}
  const search = state.search.trim()
  if (search) filter.search = search
  if (state.verifiedOnly) filter.verifiedOnly = true
  if (state.nearMe && userCoords) {
    filter.lat = userCoords.lat
    filter.lng = userCoords.lng
  }

  const sort: WorkerSort | undefined =
    state.nearMe && userCoords
      ? { field: WorkerSortField.Distance, direction: SortDirection.Asc }
      : undefined

  return {
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    sort,
  }
}

export function workersDiscoveryHasActiveFilters(
  state: WorkersDiscoveryState,
): boolean {
  return Boolean(state.search.trim()) || state.verifiedOnly || state.nearMe
}
