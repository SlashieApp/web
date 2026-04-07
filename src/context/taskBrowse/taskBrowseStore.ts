import { createStore } from 'zustand/vanilla'

import type { UrgencyFilter } from '@/app/components/taskBrowse'

export const TASK_BROWSE_FILTER_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'HVAC',
] as const

const ALL_CATEGORIES = [...TASK_BROWSE_FILTER_CATEGORIES]

const DEFAULT_SEARCH_LAT = 51.5074
const DEFAULT_SEARCH_LNG = -0.1278

export type TaskBrowseState = {
  sort: string
  page: number
  selectedCategories: string[]
  radiusMiles: number
  minBudget: string
  maxBudget: string
  urgency: UrgencyFilter
  searchInput: string
  debouncedSearch: string
  /** Map / API search origin (tasks within radius of this point). */
  searchCenterLat: number
  searchCenterLng: number
  /** Address or place shown in filters; updated when geocoding or after panning the map. */
  areaLocationInput: string
  selectedTaskId: string | null
  filtersOpen: boolean
  mobileView: 'list' | 'map'

  setSort: (sort: string) => void
  setPage: (page: number | ((prev: number) => number)) => void
  toggleCategory: (category: string, checked: boolean) => void
  setRadiusMiles: (radiusMiles: number) => void
  setMinBudget: (minBudget: string) => void
  setMaxBudget: (maxBudget: string) => void
  setUrgency: (urgency: UrgencyFilter) => void
  setSearchInput: (searchInput: string) => void
  setDebouncedSearch: (debouncedSearch: string) => void
  setSearchCenter: (lat: number, lng: number) => void
  setAreaLocationInput: (value: string) => void
  setSelectedTaskId: (selectedTaskId: string | null) => void
  setFiltersOpen: (filtersOpen: boolean) => void
  setMobileView: (mobileView: 'list' | 'map') => void
}

export function createTaskBrowseStore() {
  return createStore<TaskBrowseState>((set) => ({
    sort: 'nearest',
    page: 0,
    selectedCategories: ALL_CATEGORIES,
    radiusMiles: 10,
    minBudget: '',
    maxBudget: '',
    urgency: 'any',
    searchInput: '',
    debouncedSearch: '',
    searchCenterLat: DEFAULT_SEARCH_LAT,
    searchCenterLng: DEFAULT_SEARCH_LNG,
    areaLocationInput: '',
    selectedTaskId: null,
    filtersOpen: false,
    mobileView: 'map',

    setSort: (sort) => set({ sort, page: 0 }),
    setPage: (page) =>
      set((s) => ({
        page:
          typeof page === 'function'
            ? (page as (prev: number) => number)(s.page)
            : page,
      })),
    toggleCategory: (category, checked) =>
      set((s) => {
        const next = new Set(s.selectedCategories)
        if (checked) next.add(category)
        else next.delete(category)
        return { selectedCategories: [...next], page: 0 }
      }),
    setRadiusMiles: (radiusMiles) => set({ radiusMiles, page: 0 }),
    setMinBudget: (minBudget) => set({ minBudget, page: 0 }),
    setMaxBudget: (maxBudget) => set({ maxBudget, page: 0 }),
    setUrgency: (urgency) => set({ urgency, page: 0 }),
    setSearchInput: (searchInput) => set({ searchInput, page: 0 }),
    setDebouncedSearch: (debouncedSearch) => set({ debouncedSearch }),
    setSearchCenter: (lat, lng) =>
      set((s) => {
        const same =
          Math.abs(s.searchCenterLat - lat) < 1e-5 &&
          Math.abs(s.searchCenterLng - lng) < 1e-5
        return {
          searchCenterLat: lat,
          searchCenterLng: lng,
          page: same ? s.page : 0,
        }
      }),
    setAreaLocationInput: (areaLocationInput) => set({ areaLocationInput }),
    setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),
    setFiltersOpen: (filtersOpen) => set({ filtersOpen }),
    setMobileView: (mobileView) => set({ mobileView }),
  }))
}

export type TaskBrowseStoreApi = ReturnType<typeof createTaskBrowseStore>
