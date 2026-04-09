'use client'

import { useQuery } from '@apollo/client/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { TASKS_QUERY } from '@/graphql/tasks'
import type { TaskListItem, TasksQueryData } from '@/graphql/tasks-query.types'
import {
  mapboxForwardGeocode,
  mapboxReverseGeocode,
} from '@/utils/mapboxGeocode'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import type { SearchThisAreaButtonProps } from '../components/(web)/SearchThisAreaButton'
import type { UrgencyFilter } from '../components/(web)/TaskBrowseFilters'
import type { TaskBrowseFiltersProps } from '../components/(web)/TaskBrowseFilters'
import type { TaskMapProps } from '../components/(web)/TaskMap'
import {
  PAGE_SIZE,
  SORT_OPTIONS,
  endOfLocalDay,
  formatBudget,
  matchesUrgency,
  startOfLocalDay,
  taskCreatedTime,
} from '../components/(web)/taskBrowseHelpers'

import { TaskCategory } from '@codegen/schema'

export const TASK_BROWSE_FILTER_CATEGORIES: readonly TaskCategory[] = [
  TaskCategory.Plumbing,
  TaskCategory.Electrical,
  TaskCategory.Painting,
  TaskCategory.Gardening,
] as const

type TaskBrowseDataContextValue = {
  sort: string
  setSort: (v: string) => void
  cycleSort: () => void
  page: number
  setPage: (v: number | ((prev: number) => number)) => void
  selectedCategories: TaskCategory[]
  selectedCategorySet: Set<TaskCategory>
  toggleCategory: (category: TaskCategory, checked: boolean) => void
  radiusMiles: number
  setRadiusMiles: (v: number) => void
  minBudget: string
  setMinBudget: (v: string) => void
  maxBudget: string
  setMaxBudget: (v: string) => void
  urgency: UrgencyFilter
  setUrgency: (v: UrgencyFilter) => void
  searchInput: string
  setSearchInput: (v: string) => void
  areaLocationInput: string
  setAreaLocationInput: (v: string) => void
  commitAreaLocationSearch: () => void
  searchCenterLat: number
  searchCenterLng: number
  confirmSearchThisAreaFromMap: (lat: number, lng: number, zoom: number) => void
  selectedTaskId: string | null
  setSelectedTaskId: (v: string | null) => void
  loading: boolean
  error: { message: string } | null | undefined
  dataLoaded: boolean
  filteredSorted: TaskListItem[]
  pageItems: TaskListItem[]
  totalPages: number
  safePage: number
  effectiveMapTasksForBox: {
    id: string
    title: string
    description: string | null | undefined
    category: string | null | undefined
    location: string | null | undefined
    locationLat: number | null | undefined
    locationLng: number | null | undefined
    priceLabel: string
    detailLine: string
  }[]
  shouldWaitForMap: boolean
  markMapReadyForQuery: (ready: boolean) => void
  categories: readonly TaskCategory[]
}

type TaskBrowseLayoutContextValue = {
  isFilterOpen: boolean
  setIsFilterOpen: (v: boolean) => void
  windowOffsetWidth: number
  searchThisAreaUi: SearchThisAreaButtonProps
  setSearchThisAreaUi: (ui: SearchThisAreaButtonProps) => void
}

const TaskBrowseDataContext = createContext<TaskBrowseDataContextValue | null>(
  null,
)
const TaskBrowseLayoutContext =
  createContext<TaskBrowseLayoutContextValue | null>(null)

const DEFAULT_SEARCH_LAT = 51.5074
const DEFAULT_SEARCH_LNG = -0.1278
const MIN_RADIUS_MILES = 1
const MAX_RADIUS_MILES = 50

function clampRadiusMiles(value: number): number {
  if (!Number.isFinite(value)) return 10
  return Math.min(
    MAX_RADIUS_MILES,
    Math.max(MIN_RADIUS_MILES, Math.round(value)),
  )
}

function zoomToRadiusMiles(zoom: number): number {
  const normalized = Number.isFinite(zoom) ? zoom : 11
  const miles = 10 * 2 ** (11 - normalized)
  return clampRadiusMiles(miles)
}

type TaskBrowseProviderProps = {
  children: React.ReactNode
  initialTasks: TaskListItem[]
  isDesktop: boolean
}

export function TaskBrowseProvider({
  children,
  initialTasks,
  isDesktop: _isDesktop,
}: TaskBrowseProviderProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const hasMapboxToken = Boolean(mapboxToken?.trim())

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchThisAreaUi, setSearchThisAreaUi] =
    useState<SearchThisAreaButtonProps>({
      visible: false,
      enabled: false,
      position: 'bottom',
      leftInset: undefined,
      offsetX: '0px',
      onClick: () => {},
    })
  const [sort, setSort] = useState<string>('nearest')
  const [page, setPage] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState<TaskCategory[]>([
    ...TASK_BROWSE_FILTER_CATEGORIES,
  ])
  const [radiusMiles, setRadiusMiles] = useState(10)
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [urgency, setUrgency] = useState<UrgencyFilter>('any')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchCenterLat, setSearchCenterLat] = useState(DEFAULT_SEARCH_LAT)
  const [searchCenterLng, setSearchCenterLng] = useState(DEFAULT_SEARCH_LNG)
  const [areaLocationInput, setAreaLocationInput] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isMapReadyForQuery, setIsMapReadyForQuery] = useState(!hasMapboxToken)

  useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      300,
    )
    return () => window.clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setIsMapReadyForQuery(!hasMapboxToken)
  }, [hasMapboxToken])

  const selectedCategorySet = useMemo(
    () => new Set<TaskCategory>(selectedCategories),
    [selectedCategories],
  )

  const queryVariables = useMemo(() => {
    const minStr = minBudget.trim()
    const maxStr = maxBudget.trim()
    const minP = minStr === '' ? undefined : Number.parseFloat(minStr) * 100
    const maxP = maxStr === '' ? undefined : Number.parseFloat(maxStr) * 100
    const radius = clampRadiusMiles(radiusMiles)
    const singleCategory: TaskCategory | undefined =
      selectedCategories.length === 1 ? selectedCategories[0] : undefined

    let dateTimeFrom: string | undefined
    let dateTimeTo: string | undefined
    if (urgency === 'today') {
      dateTimeFrom = startOfLocalDay().toISOString()
      dateTimeTo = endOfLocalDay().toISOString()
    } else if (urgency === 'week') {
      const start = startOfLocalDay()
      start.setDate(start.getDate() - 6)
      dateTimeFrom = start.toISOString()
      dateTimeTo = endOfLocalDay().toISOString()
    }

    return {
      lat: searchCenterLat,
      lng: searchCenterLng,
      radiusMiles: radius,
      search: debouncedSearch || undefined,
      category: singleCategory,
      minPricePence:
        minP != null && Number.isFinite(minP) ? Math.round(minP) : undefined,
      maxPricePence:
        maxP != null && Number.isFinite(maxP) ? Math.round(maxP) : undefined,
      dateTimeFrom,
      dateTimeTo,
    }
  }, [
    debouncedSearch,
    minBudget,
    maxBudget,
    radiusMiles,
    searchCenterLat,
    searchCenterLng,
    selectedCategories,
    urgency,
  ])

  const shouldWaitForMap = hasMapboxToken
  const { data, loading, error } = useQuery<TasksQueryData>(TASKS_QUERY, {
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
    skip: shouldWaitForMap && !isMapReadyForQuery,
  })

  const filtered = useMemo(() => {
    const items = data?.tasks ?? initialTasks

    return items.filter((task) => {
      if (selectedCategories.length > 0) {
        const cat = task.category
        if (cat && !selectedCategorySet.has(cat)) return false
      }
      if (urgency === 'emergency' && !matchesUrgency(task, urgency))
        return false
      return true
    })
  }, [data, initialTasks, selectedCategories, selectedCategorySet, urgency])

  const filteredSorted = useMemo(() => {
    let next = filtered
    if (sort === 'newest' || sort === 'oldest') {
      next = [...next].sort((a, b) => {
        const ta = taskCreatedTime(a)
        const tb = taskCreatedTime(b)
        return sort === 'oldest' ? ta - tb : tb - ta
      })
    }
    return next
  }, [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE))
  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)))
  }, [totalPages])

  const safePage = Math.min(page, totalPages - 1)
  const pageItems = filteredSorted.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  )

  useEffect(() => {
    if (!selectedTaskId) return
    if (!filteredSorted.some((t) => t.id === selectedTaskId)) {
      setSelectedTaskId(null)
    }
  }, [filteredSorted, selectedTaskId])

  useEffect(() => {
    if (!selectedTaskId) return
    const idx = filteredSorted.findIndex((t) => t.id === selectedTaskId)
    if (idx < 0) return
    setPage(Math.floor(idx / PAGE_SIZE))
  }, [selectedTaskId, filteredSorted])

  const mapTasksForBox = useMemo(
    () =>
      filtered.map((task) => {
        const { main, sub } = formatBudget(task)
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          category: task.category,
          location: taskPublicLocationLabel(task),
          locationLat: task.locationLat,
          locationLng: task.locationLng,
          priceLabel: main,
          detailLine: `${main} · ${sub}`,
        }
      }),
    [filtered],
  )

  const initialMapTasksForBox = useMemo(
    () =>
      initialTasks.map((task) => {
        const { main, sub } = formatBudget(task)
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          category: task.category,
          location: taskPublicLocationLabel(task),
          locationLat: task.locationLat,
          locationLng: task.locationLng,
          priceLabel: main,
          detailLine: `${main} · ${sub}`,
        }
      }),
    [initialTasks],
  )

  const toggleCategory = useCallback(
    (category: TaskCategory, checked: boolean) => {
      setSelectedCategories((prev) => {
        const next = new Set(prev)
        if (checked) next.add(category)
        else next.delete(category)
        return [...next]
      })
      setPage(0)
    },
    [],
  )

  const setSearchCenter = useCallback((lat: number, lng: number) => {
    setSearchCenterLat(lat)
    setSearchCenterLng(lng)
  }, [])

  const confirmSearchThisAreaFromMap = useCallback(
    (lat: number, lng: number, zoom: number) => {
      setSearchCenter(lat, lng)
      setRadiusMiles(clampRadiusMiles(zoomToRadiusMiles(zoom)))
      const token = mapboxToken?.trim()
      if (token) {
        void mapboxReverseGeocode(lat, lng, token).then((name) => {
          if (name) setAreaLocationInput(name)
        })
      }
    },
    [mapboxToken, setSearchCenter],
  )

  const commitAreaLocationSearch = useCallback(() => {
    const q = areaLocationInput.trim()
    const token = mapboxToken?.trim()
    if (q.length < 2 || !token) return
    void mapboxForwardGeocode(q, token).then((hit) => {
      if (hit) {
        setSearchCenter(hit.lat, hit.lng)
        setAreaLocationInput(hit.placeName)
      }
    })
  }, [areaLocationInput, mapboxToken, setSearchCenter])

  useEffect(() => {
    const q = areaLocationInput.trim()
    const token = mapboxToken?.trim()
    if (q.length < 3 || !token) return
    const t = window.setTimeout(() => {
      void mapboxForwardGeocode(q, token).then((hit) => {
        if (hit) setSearchCenter(hit.lat, hit.lng)
      })
    }, 650)
    return () => window.clearTimeout(t)
  }, [areaLocationInput, mapboxToken, setSearchCenter])

  const cycleSort = useCallback(() => {
    const idx = SORT_OPTIONS.findIndex((opt) => opt.value === sort)
    const next =
      SORT_OPTIONS[(idx + 1 + SORT_OPTIONS.length) % SORT_OPTIONS.length]
    setSort(next.value)
  }, [sort])

  const dataValue = useMemo<TaskBrowseDataContextValue>(
    () => ({
      sort,
      setSort,
      cycleSort,
      page,
      setPage,
      selectedCategories,
      selectedCategorySet,
      toggleCategory,
      radiusMiles,
      setRadiusMiles,
      minBudget,
      setMinBudget,
      maxBudget,
      setMaxBudget,
      urgency,
      setUrgency,
      searchInput,
      setSearchInput,
      areaLocationInput,
      setAreaLocationInput,
      commitAreaLocationSearch,
      searchCenterLat,
      searchCenterLng,
      confirmSearchThisAreaFromMap,
      selectedTaskId,
      setSelectedTaskId,
      loading,
      error,
      dataLoaded: Boolean(data),
      filteredSorted,
      pageItems,
      totalPages,
      safePage,
      effectiveMapTasksForBox:
        data?.tasks != null ? mapTasksForBox : initialMapTasksForBox,
      shouldWaitForMap,
      markMapReadyForQuery: (ready) => {
        if (ready) setIsMapReadyForQuery(true)
      },
      categories: TASK_BROWSE_FILTER_CATEGORIES,
    }),
    [
      areaLocationInput,
      commitAreaLocationSearch,
      confirmSearchThisAreaFromMap,
      cycleSort,
      data,
      error,
      filteredSorted,
      loading,
      mapTasksForBox,
      maxBudget,
      minBudget,
      page,
      pageItems,
      radiusMiles,
      safePage,
      searchCenterLat,
      searchCenterLng,
      searchInput,
      selectedCategories,
      selectedCategorySet,
      selectedTaskId,
      shouldWaitForMap,
      sort,
      toggleCategory,
      totalPages,
      urgency,
      initialMapTasksForBox,
    ],
  )

  const layoutValue = useMemo<TaskBrowseLayoutContextValue>(
    () => ({
      isFilterOpen,
      setIsFilterOpen,
      windowOffsetWidth: 300,
      searchThisAreaUi,
      setSearchThisAreaUi,
    }),
    [isFilterOpen, searchThisAreaUi],
  )

  return (
    <TaskBrowseLayoutContext.Provider value={layoutValue}>
      <TaskBrowseDataContext.Provider value={dataValue}>
        {children}
      </TaskBrowseDataContext.Provider>
    </TaskBrowseLayoutContext.Provider>
  )
}

export function useTaskBrowseData() {
  const ctx = useContext(TaskBrowseDataContext)
  if (!ctx) {
    throw new Error('useTaskBrowseData must be used within TaskBrowseProvider')
  }
  return ctx
}

export function useTaskBrowseLayout() {
  const ctx = useContext(TaskBrowseLayoutContext)
  if (!ctx) {
    throw new Error(
      'useTaskBrowseLayout must be used within TaskBrowseProvider',
    )
  }
  return ctx
}

export function useTaskBrowseFiltersProps(
  variant: 'default' | 'compact' = 'compact',
): TaskBrowseFiltersProps {
  const data = useTaskBrowseData()
  return {
    categories: data.categories,
    selectedCategories: data.selectedCategorySet,
    onToggleCategory: data.toggleCategory,
    searchQuery: data.searchInput,
    onSearchChange: data.setSearchInput,
    areaLocationInput: data.areaLocationInput,
    onAreaLocationChange: data.setAreaLocationInput,
    onAreaLocationCommit: data.commitAreaLocationSearch,
    radiusMiles: data.radiusMiles,
    onRadiusChange: data.setRadiusMiles,
    minBudgetPounds: data.minBudget,
    maxBudgetPounds: data.maxBudget,
    onMinBudgetChange: data.setMinBudget,
    onMaxBudgetChange: data.setMaxBudget,
    urgency: data.urgency,
    onUrgencyChange: data.setUrgency,
    sortValue: data.sort,
    sortOptions: SORT_OPTIONS,
    onSortChange: data.setSort,
    showMapPromo: false,
    variant,
  }
}

type SharedTaskMapBindings = Pick<
  TaskMapProps,
  | 'accessToken'
  | 'centerLat'
  | 'centerLng'
  | 'radiusMiles'
  | 'tasks'
  | 'visible'
  | 'tasksLoaded'
  | 'onSearchThisAreaConfirm'
  | 'onMapClick'
  | 'onReadyChange'
  | 'selectedTaskId'
  | 'onSelectTask'
  | 'onSearchThisAreaUiChange'
>

export function useTaskMapBindings(): SharedTaskMapBindings {
  const data = useTaskBrowseData()
  const layout = useTaskBrowseLayout()
  return {
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    centerLat: data.searchCenterLat,
    centerLng: data.searchCenterLng,
    radiusMiles: data.radiusMiles,
    tasks: data.effectiveMapTasksForBox,
    visible: true,
    tasksLoaded: true,
    onSearchThisAreaConfirm: data.confirmSearchThisAreaFromMap,
    onMapClick: () => layout.setIsFilterOpen(false),
    onReadyChange: data.markMapReadyForQuery,
    selectedTaskId: data.selectedTaskId,
    onSelectTask: data.setSelectedTaskId,
    onSearchThisAreaUiChange: layout.setSearchThisAreaUi,
  }
}
