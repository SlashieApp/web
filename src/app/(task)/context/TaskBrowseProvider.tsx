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
  DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES,
  PAGE_SIZE,
  SORT_OPTIONS,
  buildActiveBrowseFilterTags,
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
  /** Last submitted radius (drives fetch + map query disc); draft {@link radiusMiles} is edited in the filter UI. */
  submittedRadiusMiles: number
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
  /** Sets map search center from coordinates, reverse-geocodes label when Mapbox token exists. */
  applyGeolocatedSearch: (lat: number, lng: number) => Promise<void>
  /** Copies draft filter UI → submitted; triggers fetch (radius) + list filters. */
  submitBrowseFilters: () => void
  /** Resets draft filter fields from last submitted snapshot (call when opening the filter panel). */
  syncDraftFiltersFromSubmitted: () => void
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
  /** Chips derived from last submitted filters (see {@link submitBrowseFilters}). */
  activeFilterTags: readonly string[]
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
/** Edit this to tune map center offset for desktop split layout. */
const DESKTOP_MAP_CENTER_LEFT_INSET_PX = 420
/** Mobile (base < lg) should not offset map center. */
const MOBILE_MAP_CENTER_LEFT_INSET_PX = 0

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

/** Left inset used by map center offset in desktop split mode. */
function desktopListPanelLeftInsetPx(): number {
  if (typeof window === 'undefined') return DESKTOP_MAP_CENTER_LEFT_INSET_PX
  return DESKTOP_MAP_CENTER_LEFT_INSET_PX
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
    subscribeWindowResize,
    () =>
      isDesktop
        ? desktopListPanelLeftInsetPx()
        : MOBILE_MAP_CENTER_LEFT_INSET_PX,
    () => MOBILE_MAP_CENTER_LEFT_INSET_PX,
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
  const [radiusMiles, setRadiusMiles] = useState(
    DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES,
  )
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [urgency, setUrgency] = useState<UrgencyFilter>('any')
  const [submittedRadiusMiles, setSubmittedRadiusMiles] = useState(
    DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES,
  )
  const [submittedMinBudget, setSubmittedMinBudget] = useState('')
  const [submittedMaxBudget, setSubmittedMaxBudget] = useState('')
  const [submittedUrgency, setSubmittedUrgency] = useState<UrgencyFilter>('any')
  const [submittedSearchText, setSubmittedSearchText] = useState('')
  const [searchInput, setSearchInputRaw] = useState('')

  const setSearchInput = useCallback((v: string) => {
    setSearchInputRaw(v)
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
    const radius = clampRadiusMiles(submittedRadiusMiles)
    return {
      lat: searchCenterLat,
      lng: searchCenterLng,
      radiusMiles: radius,
    }
  }, [searchCenterLat, searchCenterLng, submittedRadiusMiles])

  const shouldWaitForMap = hasMapboxToken
  const { data, loading, error } = useQuery<TasksQueryData>(TASKS_QUERY, {
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
    skip: shouldWaitForMap && !isMapReadyForQuery,
  })

  const filtered = useMemo(() => {
    const items = data?.tasks ?? initialTasks
    const text = submittedSearchText.trim().toLowerCase()
    const minStr = submittedMinBudget.trim()
    const maxStr = submittedMaxBudget.trim()
    const minP = minStr === '' ? null : Number.parseFloat(minStr) * 100
    const maxP = maxStr === '' ? null : Number.parseFloat(maxStr) * 100

    return items.filter((task) => {
      if (text) {
        const hay = `${task.title} ${task.description}`.toLowerCase()
        if (!hay.includes(text)) return false
      }
      if (!matchesUrgency(task, submittedUrgency)) return false

      const eff = effectiveTaskPricePenceForFilter(task)
      if (minP != null && Number.isFinite(minP)) {
        if (eff == null || eff < Math.round(minP)) return false
      }
      if (maxP != null && Number.isFinite(maxP)) {
        if (eff != null && eff > Math.round(maxP)) return false
      }
      return true
    })
  }, [
    data,
    initialTasks,
    submittedMaxBudget,
    submittedMinBudget,
    submittedSearchText,
    submittedUrgency,
  ])

  const activeFilterTags = useMemo(
    () =>
      buildActiveBrowseFilterTags({
        submittedRadiusMiles,
        submittedMinBudget,
        submittedMaxBudget,
        submittedUrgency,
        submittedSearchText,
        areaLocationInput,
      }),
    [
      areaLocationInput,
      submittedMaxBudget,
      submittedMinBudget,
      submittedRadiusMiles,
      submittedSearchText,
      submittedUrgency,
    ],
  )

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
      const nextRadius = clampRadiusMiles(zoomToRadiusMiles(zoom))
      setRadiusMiles(nextRadius)
      setSubmittedRadiusMiles(nextRadius)
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

  const applyGeolocatedSearch = useCallback(
    async (lat: number, lng: number) => {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
      setSearchCenter(lat, lng)
      pendingAreaSearchQueryRef.current = null
      lastResolvedAreaSearchQueryRef.current = null
      const token = mapboxToken?.trim()
      if (token) {
        const name = await mapboxReverseGeocode(lat, lng, token)
        if (name) setAreaLocationInput(name)
        else setAreaLocationInput(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      } else {
        setAreaLocationInput(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      }
    },
    [mapboxToken, setSearchCenter],
  )

  const cycleSort = useCallback(() => {
    const idx = SORT_OPTIONS.findIndex((opt) => opt.value === sort)
    const next =
      SORT_OPTIONS[(idx + 1 + SORT_OPTIONS.length) % SORT_OPTIONS.length]
    setSort(next.value)
  }, [sort])

  const submitBrowseFilters = useCallback(() => {
    setSubmittedRadiusMiles(radiusMiles)
    setSubmittedMinBudget(minBudget)
    setSubmittedMaxBudget(maxBudget)
    setSubmittedUrgency(urgency)
    setSubmittedSearchText(searchInput.trim())
    setPage(0)
  }, [maxBudget, minBudget, radiusMiles, searchInput, urgency])

  const syncDraftFiltersFromSubmitted = useCallback(() => {
    setRadiusMiles(submittedRadiusMiles)
    setMinBudget(submittedMinBudget)
    setMaxBudget(submittedMaxBudget)
    setUrgency(submittedUrgency)
    setSearchInputRaw(submittedSearchText)
  }, [
    submittedMaxBudget,
    submittedMinBudget,
    submittedRadiusMiles,
    submittedSearchText,
    submittedUrgency,
  ])

  const dataValue = useMemo<TaskBrowseDataContextValue>(
    () => ({
      sort,
      setSort,
      cycleSort,
      page,
      setPage,
      radiusMiles,
      submittedRadiusMiles,
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
      applyGeolocatedSearch,
      submitBrowseFilters,
      syncDraftFiltersFromSubmitted,
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
      activeFilterTags,
    }),
    [
      activeFilterTags,
      areaLocationInput,
      applyGeolocatedSearch,
      commitAreaLocationSearch,
      confirmSearchThisAreaFromMap,
      submitBrowseFilters,
      syncDraftFiltersFromSubmitted,
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
      submittedRadiusMiles,
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
    radiusMiles: data.submittedRadiusMiles,
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
