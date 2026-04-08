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

import type { UrgencyFilter } from '../components/(web)/TaskBrowseFilters'
import {
  PAGE_SIZE,
  SORT_OPTIONS,
  endOfLocalDay,
  formatBudget,
  matchesUrgency,
  startOfLocalDay,
  taskCreatedTime,
} from '../components/(web)/taskBrowseHelpers'

export const TASK_BROWSE_FILTER_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'HVAC',
] as const

type TaskBrowseDataContextValue = {
  sort: string
  setSort: (v: string) => void
  cycleSort: () => void
  page: number
  setPage: (v: number | ((prev: number) => number)) => void
  selectedCategories: string[]
  selectedCategorySet: Set<string>
  toggleCategory: (category: string, checked: boolean) => void
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
  confirmSearchThisAreaFromMap: (lat: number, lng: number) => void
  selectedTaskId: string | null
  setSelectedTaskId: (v: string | null) => void
  loading: boolean
  error: { message: string } | null | undefined
  dataLoaded: boolean
  filteredSorted: TaskListItem[]
  pageItems: TaskListItem[]
  totalPages: number
  safePage: number
  subtitle: string
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
  categories: readonly string[]
}

type TaskBrowseLayoutContextValue = {
  isFilterOpen: boolean
  setIsFilterOpen: (v: boolean) => void
  windowOffsetWidth: number
}

const TaskBrowseDataContext = createContext<TaskBrowseDataContextValue | null>(
  null,
)
const TaskBrowseLayoutContext =
  createContext<TaskBrowseLayoutContextValue | null>(null)

const DEFAULT_SEARCH_LAT = 51.5074
const DEFAULT_SEARCH_LNG = -0.1278

type TaskBrowseProviderProps = {
  children: React.ReactNode
  initialTasks: TaskListItem[]
  isDesktop: boolean
  headerSubtitle?: string
}

export function TaskBrowseProvider({
  children,
  initialTasks,
  isDesktop,
  headerSubtitle,
}: TaskBrowseProviderProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const hasMapboxToken = Boolean(mapboxToken?.trim())

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sort, setSort] = useState<string>('nearest')
  const [page, setPage] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
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
    () => new Set<string>(selectedCategories),
    [selectedCategories],
  )

  const queryVariables = useMemo(() => {
    const minStr = minBudget.trim()
    const maxStr = maxBudget.trim()
    const minP = minStr === '' ? undefined : Number.parseFloat(minStr) * 100
    const maxP = maxStr === '' ? undefined : Number.parseFloat(maxStr) * 100
    const radius = Math.min(500, Math.max(1, radiusMiles))
    const singleCategory =
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
        const cat = (task.category ?? '').trim()
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

  const subtitle =
    headerSubtitle ??
    `Browse ${filteredSorted.length} open tasks. Details are read-only until you sign in to quote.`

  const mapTasksForBox = useMemo(
    () =>
      filtered.map((task) => {
        const { main, sub } = formatBudget(task)
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          category: task.category,
          location: task.location,
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
          location: task.location,
          locationLat: task.locationLat,
          locationLng: task.locationLng,
          priceLabel: main,
          detailLine: `${main} · ${sub}`,
        }
      }),
    [initialTasks],
  )

  const toggleCategory = useCallback((category: string, checked: boolean) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (checked) next.add(category)
      else next.delete(category)
      return [...next]
    })
    setPage(0)
  }, [])

  const setSearchCenter = useCallback((lat: number, lng: number) => {
    setSearchCenterLat(lat)
    setSearchCenterLng(lng)
  }, [])

  const confirmSearchThisAreaFromMap = useCallback(
    (lat: number, lng: number) => {
      setSearchCenter(lat, lng)
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
      subtitle,
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
      subtitle,
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
      windowOffsetWidth: isDesktop ? 540 : 80,
    }),
    [isDesktop, isFilterOpen],
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
