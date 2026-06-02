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

import Tasks from '@/app/(task)/graphql/Tasks.gql'
import type { TaskListItem, TasksQueryData } from '@/graphql/tasks-query.types'
import {
  mapboxForwardGeocode,
  mapboxReverseGeocode,
} from '@/utils/mapboxGeocode'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import type { SearchThisAreaButtonProps } from '../components/SearchThisAreaButton'
import type { TaskMapProps } from '../components/TaskMap'
import {
  type BrowseGeolocationStatus,
  type BrowseReferenceLocation,
  CURRENT_LOCATION_LABEL,
  DEFAULT_BROWSE_REFERENCE,
} from '../helpers/browseReferenceLocation'
import type {
  TaskBrowseFiltersProps,
  UrgencyFilter,
} from '../helpers/taskBrowseFilters.types'
import {
  type BrowseFilterTag,
  DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES,
  PAGE_SIZE,
  SORT_OPTIONS,
  buildActiveBrowseFilterTags,
  effectiveTaskPricePenceForFilter,
  formatBudget,
  matchesUrgency,
  taskCreatedTime,
  taskDistanceLabelFromReference,
  taskDistanceMilesFromReference,
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
  /** Sets map search center from coordinates (GPS). */
  applyGeolocatedSearch: (lat: number, lng: number) => Promise<void>
  /** Browser geolocation on load and via "Use my location". */
  requestUseMyLocation: () => void
  initGeolocationOnLoad: () => void
  referenceLocation: BrowseReferenceLocation
  geolocationStatus: BrowseGeolocationStatus
  /** Copies draft filter UI → submitted; triggers fetch (radius) + list filters. */
  submitBrowseFilters: () => void
  /** Resets draft filter fields from last submitted snapshot (call when opening the filter panel). */
  syncDraftFiltersFromSubmitted: () => void
  searchCenterLat: number
  searchCenterLng: number
  confirmSearchThisAreaFromMap: (lat: number, lng: number, zoom: number) => void
  selectedTaskId: string | null
  /** Bumps on every non-null selection (including re-selecting the same task). */
  selectedTaskSelectionToken: number
  setSelectedTaskId: (
    v: string | null | ((prev: string | null) => string | null),
  ) => void
  /** True while the map nav route is fetching or animating. */
  isNavRoutePresenting: boolean
  onNavRoutePresentingChange: (presenting: boolean) => void
  loading: boolean
  error: { message: string } | null | undefined
  dataLoaded: boolean
  /** Task count from the latest `tasks` query (or SSR initial list) before client-side filters. Discovery is cap-aware server-side. */
  browseSourceTaskCount: number
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
    distanceLabel?: string
  }[]
  shouldWaitForMap: boolean
  markMapReadyForQuery: (ready: boolean) => void
  /** Chips derived from last submitted filters (see {@link submitBrowseFilters}). */
  activeFilterTags: readonly BrowseFilterTag[]
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
  const [referenceLocation, setReferenceLocation] =
    useState<BrowseReferenceLocation>(DEFAULT_BROWSE_REFERENCE)
  const [geolocationStatus, setGeolocationStatus] =
    useState<BrowseGeolocationStatus>('idle')
  const [areaLocationInput, setAreaLocationInput] = useState(
    DEFAULT_BROWSE_REFERENCE.label,
  )
  const pendingAreaSearchQueryRef = useRef<string | null>(null)
  const lastResolvedAreaSearchQueryRef = useRef<string | null>(null)
  const geolocationInitStartedRef = useRef(false)
  const [selectedTaskId, setSelectedTaskIdState] = useState<string | null>(null)
  const [selectedTaskSelectionToken, setSelectedTaskSelectionToken] =
    useState(0)
  const [isNavRoutePresenting, setIsNavRoutePresenting] = useState(false)
  const isNavRoutePresentingRef = useRef(false)

  const onNavRoutePresentingChange = useCallback((presenting: boolean) => {
    isNavRoutePresentingRef.current = presenting
    setIsNavRoutePresenting(presenting)
  }, [])

  const setSelectedTaskId = useCallback(
    (value: string | null | ((prev: string | null) => string | null)) => {
      if (isNavRoutePresentingRef.current) return

      if (typeof value === 'function') {
        setSelectedTaskIdState((prev) => {
          const next = value(prev)
          if (next) {
            setSelectedTaskSelectionToken((t) => t + 1)
          }
          return next
        })
        return
      }
      if (value) {
        setSelectedTaskSelectionToken((t) => t + 1)
      }
      setSelectedTaskIdState(value)
    },
    [],
  )
  const [isMapReadyForQuery, setIsMapReadyForQuery] = useState(!hasMapboxToken)

  const searchCenterLat = referenceLocation.lat
  const searchCenterLng = referenceLocation.lng

  const applyReference = useCallback((next: BrowseReferenceLocation) => {
    setReferenceLocation(next)
    setAreaLocationInput(next.label)
  }, [])

  const prevHasMapboxTokenRef = useRef(hasMapboxToken)
  if (hasMapboxToken !== prevHasMapboxTokenRef.current) {
    prevHasMapboxTokenRef.current = hasMapboxToken
    setIsMapReadyForQuery(!hasMapboxToken)
  }

  const queryVariables = useMemo(() => {
    const radius = clampRadiusMiles(submittedRadiusMiles)
    return {
      filter: {
        lat: searchCenterLat,
        lng: searchCenterLng,
        radiusMiles: radius,
      },
    }
  }, [searchCenterLat, searchCenterLng, submittedRadiusMiles])

  const shouldWaitForMap = hasMapboxToken
  const { data, loading, error } = useQuery<TasksQueryData>(Tasks, {
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
        referenceLabel: referenceLocation.label,
      }),
    [
      referenceLocation.label,
      submittedMaxBudget,
      submittedMinBudget,
      submittedRadiusMiles,
      submittedSearchText,
      submittedUrgency,
    ],
  )

  const filteredSorted = useMemo(() => {
    let next = filtered
    if (sort === 'nearest') {
      next = [...next].sort((a, b) => {
        const da =
          taskDistanceMilesFromReference(a, referenceLocation) ??
          Number.POSITIVE_INFINITY
        const db =
          taskDistanceMilesFromReference(b, referenceLocation) ??
          Number.POSITIVE_INFINITY
        return da - db
      })
    } else if (sort === 'newest' || sort === 'oldest') {
      next = [...next].sort((a, b) => {
        const ta = taskCreatedTime(a)
        const tb = taskCreatedTime(b)
        return sort === 'oldest' ? ta - tb : tb - ta
      })
    }
    return next
  }, [filtered, referenceLocation, sort])

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE))
  const maxPageIndex = Math.max(0, totalPages - 1)
  const safePage = Math.min(page, maxPageIndex)
  const pageItems = filteredSorted.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  )

  const visibleSelectedTaskId =
    selectedTaskId && filteredSorted.some((task) => task.id === selectedTaskId)
      ? selectedTaskId
      : null

  const staleSelectionRef = useRef<string | null>(null)
  if (
    selectedTaskId &&
    !visibleSelectedTaskId &&
    staleSelectionRef.current !== selectedTaskId
  ) {
    staleSelectionRef.current = selectedTaskId
    queueMicrotask(() => {
      setSelectedTaskId((current) =>
        current && !filteredSorted.some((task) => task.id === current)
          ? null
          : current,
      )
    })
  } else if (visibleSelectedTaskId) {
    staleSelectionRef.current = null
  }

  const selectionPageSyncRef = useRef<{
    selectedTaskId: string | null
    filteredSorted: TaskListItem[]
  }>({ selectedTaskId: null, filteredSorted: [] })

  if (
    visibleSelectedTaskId !== selectionPageSyncRef.current.selectedTaskId ||
    filteredSorted !== selectionPageSyncRef.current.filteredSorted
  ) {
    selectionPageSyncRef.current = {
      selectedTaskId: visibleSelectedTaskId,
      filteredSorted,
    }
    if (visibleSelectedTaskId) {
      const idx = filteredSorted.findIndex(
        (task) => task.id === visibleSelectedTaskId,
      )
      if (idx >= 0) {
        const desiredPage = Math.floor(idx / PAGE_SIZE)
        if (page !== desiredPage) {
          queueMicrotask(() => setPage(desiredPage))
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
          category: task.category,
          location: taskPublicLocationLabel(task),
          locationLat: task.location?.lat ?? null,
          locationLng: task.location?.lng ?? null,
          priceLabel: main,
          detailLine: `${main} · ${sub}`,
          distanceLabel: taskDistanceLabelFromReference(
            task,
            referenceLocation,
          ),
        }
      }),
    [filtered, referenceLocation],
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
          locationLat: task.location?.lat ?? null,
          locationLng: task.location?.lng ?? null,
          priceLabel: main,
          detailLine: `${main} · ${sub}`,
          distanceLabel: taskDistanceLabelFromReference(
            task,
            referenceLocation,
          ),
        }
      }),
    [initialTasks, referenceLocation],
  )

  const confirmSearchThisAreaFromMap = useCallback(
    (lat: number, lng: number, zoom: number) => {
      const nextRadius = clampRadiusMiles(zoomToRadiusMiles(zoom))
      setRadiusMiles(nextRadius)
      setSubmittedRadiusMiles(nextRadius)
      const token = mapboxToken?.trim()
      if (token) {
        void mapboxReverseGeocode(lat, lng, token).then((name) => {
          applyReference({
            lat,
            lng,
            label: name?.trim() || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            source: 'manual',
          })
        })
        return
      }
      applyReference({
        lat,
        lng,
        label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        source: 'manual',
      })
    },
    [applyReference, mapboxToken],
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
          applyReference({
            lat: hit.lat,
            lng: hit.lng,
            label: hit.placeName,
            source: 'manual',
          })
          lastResolvedAreaSearchQueryRef.current = q
        }
      })
      .finally(() => {
        if (pendingAreaSearchQueryRef.current === q) {
          pendingAreaSearchQueryRef.current = null
        }
      })
  }, [applyReference, areaLocationInput, mapboxToken])

  const applyGeolocatedSearch = useCallback(
    async (lat: number, lng: number) => {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
      pendingAreaSearchQueryRef.current = null
      lastResolvedAreaSearchQueryRef.current = null
      applyReference({
        lat,
        lng,
        label: CURRENT_LOCATION_LABEL,
        source: 'geolocation',
      })
      setGeolocationStatus('granted')
    },
    [applyReference],
  )

  const requestUseMyLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeolocationStatus('unsupported')
      return
    }
    setGeolocationStatus('pending')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void applyGeolocatedSearch(
          position.coords.latitude,
          position.coords.longitude,
        )
      },
      () => {
        setGeolocationStatus('denied')
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    )
  }, [applyGeolocatedSearch])

  const initGeolocationOnLoad = useCallback(() => {
    if (geolocationInitStartedRef.current) return
    geolocationInitStartedRef.current = true
    requestUseMyLocation()
  }, [requestUseMyLocation])

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
    setAreaLocationInput(referenceLocation.label)
  }, [
    referenceLocation.label,
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
      requestUseMyLocation,
      initGeolocationOnLoad,
      referenceLocation,
      geolocationStatus,
      submitBrowseFilters,
      syncDraftFiltersFromSubmitted,
      searchCenterLat,
      searchCenterLng,
      confirmSearchThisAreaFromMap,
      selectedTaskId: visibleSelectedTaskId,
      selectedTaskSelectionToken,
      setSelectedTaskId,
      isNavRoutePresenting,
      onNavRoutePresentingChange,
      loading,
      error,
      dataLoaded: Boolean(data),
      browseSourceTaskCount: (data?.tasks ?? initialTasks).length,
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
      geolocationStatus,
      initGeolocationOnLoad,
      referenceLocation,
      requestUseMyLocation,
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
      visibleSelectedTaskId,
      selectedTaskSelectionToken,
      setSelectedTaskId,
      isNavRoutePresenting,
      onNavRoutePresentingChange,
      shouldWaitForMap,
      sort,
      totalPages,
      urgency,
      initialMapTasksForBox,
      initialTasks,
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
  | 'selectedTaskSelectionToken'
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
    tasksLoaded:
      !data.loading && (data.dataLoaded || data.browseSourceTaskCount > 0),
    onSearchThisAreaConfirm: data.confirmSearchThisAreaFromMap,
    onMapClick: () => layout.setIsFilterOpen(false),
    onReadyChange: data.markMapReadyForQuery,
    selectedTaskId: data.selectedTaskId,
    selectedTaskSelectionToken: data.selectedTaskSelectionToken,
    onSelectTask: data.setSelectedTaskId,
    onSearchThisAreaUiChange: layout.setSearchThisAreaUi,
  }
}
