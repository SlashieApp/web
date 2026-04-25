'use client'

import { useQuery } from '@apollo/client/react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { TASKS_QUERY } from '@/graphql/tasks'
import type { TaskListItem, TasksQueryData } from '@/graphql/tasks-query.types'
import {
  mapboxForwardGeocode,
  mapboxReverseGeocode,
} from '@/utils/mapboxGeocode'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import type { SearchThisAreaButtonProps } from '../components/SearchThisAreaButton'
import type { TaskMapProps } from '../components/TaskMap'
import type {
  TaskBrowseFiltersProps,
  UrgencyFilter,
} from '../helpers/taskBrowseFilters.types'
import {
  PAGE_SIZE,
  SORT_OPTIONS,
  effectiveTaskPricePenceForFilter,
  formatBudget,
  matchesUrgency,
  taskCreatedTime,
} from '../helpers/taskBrowseHelpers'

type TaskBrowseDataContextValue = {
  sort: string
  setSort: (v: string) => void
  cycleSort: () => void
  page: number
  setPage: (v: number | ((prev: number) => number)) => void
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
    category?: string | null | undefined
    location: string | null | undefined
    locationLat: number | null | undefined
    locationLng: number | null | undefined
    priceLabel: string
    detailLine: string
  }[]
  shouldWaitForMap: boolean
  markMapReadyForQuery: (ready: boolean) => void
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

/** Matches `WebLayout` list column: `left-2` + `min(420px, 38vw)` (+ small gutter). */
function desktopListPanelLeftInsetPx(): number {
  if (typeof window === 'undefined') return 320
  const w = window.innerWidth
  const panel = Math.min(420, w * 0.38)
  const marginGutter = 24
  return Math.round(marginGutter + panel)
}

function subscribeWindowResize(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('resize', onStoreChange)
  return () => window.removeEventListener('resize', onStoreChange)
}

export function TaskBrowseProvider({
  children,
  initialTasks,
  isDesktop,
}: TaskBrowseProviderProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const hasMapboxToken = Boolean(mapboxToken?.trim())

  const windowOffsetWidth = useSyncExternalStore(
    isDesktop ? subscribeWindowResize : () => () => {},
    () => (isDesktop ? desktopListPanelLeftInsetPx() : 320),
    () => 320,
  )

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
  const [radiusMiles, setRadiusMiles] = useState(10)
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [urgency, setUrgency] = useState<UrgencyFilter>('any')
  const [searchInput, setSearchInputRaw] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchDebounceRef = useRef<number | null>(null)

  const setSearchInput = useCallback((v: string) => {
    setSearchInputRaw(v)
    if (searchDebounceRef.current)
      window.clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = window.setTimeout(() => {
      setDebouncedSearch(v.trim())
    }, 300)
  }, [])
  const [searchCenterLat, setSearchCenterLat] = useState(DEFAULT_SEARCH_LAT)
  const [searchCenterLng, setSearchCenterLng] = useState(DEFAULT_SEARCH_LNG)
  const [areaLocationInput, setAreaLocationInput] = useState('')
  const pendingAreaSearchQueryRef = useRef<string | null>(null)
  const lastResolvedAreaSearchQueryRef = useRef<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isMapReadyForQuery, setIsMapReadyForQuery] = useState(!hasMapboxToken)

  const prevHasMapboxTokenRef = useRef(hasMapboxToken)
  if (hasMapboxToken !== prevHasMapboxTokenRef.current) {
    prevHasMapboxTokenRef.current = hasMapboxToken
    setIsMapReadyForQuery(!hasMapboxToken)
  }

  const queryVariables = useMemo(() => {
    const radius = clampRadiusMiles(radiusMiles)
    return {
      lat: searchCenterLat,
      lng: searchCenterLng,
      radiusMiles: radius,
    }
  }, [radiusMiles, searchCenterLat, searchCenterLng])

  const shouldWaitForMap = hasMapboxToken
  const { data, loading, error } = useQuery<TasksQueryData>(TASKS_QUERY, {
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
    skip: shouldWaitForMap && !isMapReadyForQuery,
  })

  const filtered = useMemo(() => {
    const items = data?.tasks ?? initialTasks
    const text = debouncedSearch.trim().toLowerCase()
    const minStr = minBudget.trim()
    const maxStr = maxBudget.trim()
    const minP = minStr === '' ? null : Number.parseFloat(minStr) * 100
    const maxP = maxStr === '' ? null : Number.parseFloat(maxStr) * 100

    return items.filter((task) => {
      if (text) {
        const hay = `${task.title} ${task.description}`.toLowerCase()
        if (!hay.includes(text)) return false
      }
      if (!matchesUrgency(task, urgency)) return false

      const eff = effectiveTaskPricePenceForFilter(task)
      if (minP != null && Number.isFinite(minP)) {
        if (eff == null || eff < Math.round(minP)) return false
      }
      if (maxP != null && Number.isFinite(maxP)) {
        if (eff != null && eff > Math.round(maxP)) return false
      }
      return true
    })
  }, [data, debouncedSearch, initialTasks, maxBudget, minBudget, urgency])

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
  const maxPageIndex = Math.max(0, totalPages - 1)
  if (page > maxPageIndex) {
    setPage(maxPageIndex)
  }

  const safePage = Math.min(page, maxPageIndex)
  const pageItems = filteredSorted.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  )

  if (selectedTaskId && !filteredSorted.some((t) => t.id === selectedTaskId)) {
    setSelectedTaskId(null)
  }

  const selectionPageSyncRef = useRef<{
    selectedTaskId: string | null
    filteredSorted: TaskListItem[]
  }>({ selectedTaskId: null, filteredSorted: [] })

  if (
    selectedTaskId !== selectionPageSyncRef.current.selectedTaskId ||
    filteredSorted !== selectionPageSyncRef.current.filteredSorted
  ) {
    selectionPageSyncRef.current = { selectedTaskId, filteredSorted }
    if (selectedTaskId) {
      const idx = filteredSorted.findIndex((t) => t.id === selectedTaskId)
      if (idx >= 0) {
        const desiredPage = Math.floor(idx / PAGE_SIZE)
        if (page !== desiredPage) {
          setPage(desiredPage)
        }
      }
    }
  }

  const mapTasksForBox = useMemo(
    () =>
      filtered.map((task) => {
        const { main, sub } = formatBudget(task)
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          location: taskPublicLocationLabel(task),
          locationLat: task.location?.lat ?? null,
          locationLng: task.location?.lng ?? null,
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
          location: taskPublicLocationLabel(task),
          locationLat: task.location?.lat ?? null,
          locationLng: task.location?.lng ?? null,
          priceLabel: main,
          detailLine: `${main} · ${sub}`,
        }
      }),
    [initialTasks],
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
    if (pendingAreaSearchQueryRef.current === q) return
    if (lastResolvedAreaSearchQueryRef.current === q) return

    pendingAreaSearchQueryRef.current = q
    void mapboxForwardGeocode(q, token)
      .then((hit) => {
        if (hit) {
          setSearchCenter(hit.lat, hit.lng)
          setAreaLocationInput(hit.placeName)
          lastResolvedAreaSearchQueryRef.current = q
        }
      })
      .finally(() => {
        if (pendingAreaSearchQueryRef.current === q) {
          pendingAreaSearchQueryRef.current = null
        }
      })
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
      setSearchInput,
      selectedTaskId,
      shouldWaitForMap,
      sort,
      totalPages,
      urgency,
      initialMapTasksForBox,
    ],
  )

  const layoutValue = useMemo<TaskBrowseLayoutContextValue>(
    () => ({
      isFilterOpen,
      setIsFilterOpen,
      windowOffsetWidth,
      searchThisAreaUi,
      setSearchThisAreaUi,
    }),
    [isFilterOpen, searchThisAreaUi, windowOffsetWidth],
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

export function useTaskBrowseFiltersProps(): TaskBrowseFiltersProps {
  const data = useTaskBrowseData()
  return {
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
