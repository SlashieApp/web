'use client'

import { useQuery } from '@apollo/client/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { useMe } from '@/app/(auth)/store/user'
import Tasks from '@/app/(task)/graphql/Tasks.gql'
import type { TaskListItem, TasksQueryData } from '@/graphql/tasks-query.types'
import { useLocale } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, capture } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import {
  mapboxForwardGeocode,
  mapboxReverseGeocode,
} from '@/utils/mapboxGeocode'
import {
  type TaskListVariables,
  buildTaskFilter,
  taskSortToInput,
} from '@/utils/taskListQuery'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import bag from '../components/i11n.json'
import type { SearchThisAreaButtonProps } from '../components/ui/SearchThisAreaButton'
import type { TaskMapProps } from '../components/ui/TaskMap'
import {
  type BrowseGeolocationStatus,
  type BrowseReferenceLocation,
  CURRENT_LOCATION_LABEL,
  DEFAULT_BROWSE_REFERENCE,
  URL_SEEDED_AREA_LABEL,
  browseGeolocationPermission,
} from '../helpers/browseReferenceLocation'
import {
  type BrowseBudgetFilter,
  type BrowseDateFilter,
  type BrowseFilterTag,
  DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES,
  browseCoverageMiles,
  buildActiveBrowseFilterTags,
  formatBudget,
  parseBrowseBudget,
  taskDistanceLabelFromReference,
} from '../helpers/taskBrowseHelpers'

type BrowseMapTask = {
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
}

type TaskBrowseDataContextValue = {
  // --- Area + radius: /workers edits these through draft → submit.
  radiusMiles: number
  /** Last submitted radius: map camera zoom and the /workers query. Tasks search everywhere. */
  submittedRadiusMiles: number
  setRadiusMiles: (v: number) => void
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
  /** Copies the draft radius → submitted (/workers filters). */
  submitBrowseFilters: () => void
  /** Resets the draft radius and area field from the submitted values. */
  syncDraftFiltersFromSubmitted: () => void
  searchCenterLat: number
  searchCenterLng: number
  /**
   * How far the loaded results reach from the sort centre (miles): the
   * furthest loaded task, Infinity once every match is loaded, null before
   * the first page. The map offers "Search this area" only beyond it.
   */
  searchCoverageMiles: number | null
  confirmSearchThisAreaFromMap: (lat: number, lng: number, zoom: number) => void

  // --- Task search (FE-201): applied live, shared by map pins and list.
  searchInput: string
  setSearchInput: (v: string) => void
  /** Applies the typed text now (Enter), without waiting for the pause. */
  commitSearch: () => void
  /** Search text sent to the API. */
  searchText: string
  /** Typed text not applied yet, or results still loading. */
  isSearchPending: boolean
  dateFilter: BrowseDateFilter | null
  setDateFilter: (v: BrowseDateFilter | null) => void
  budgetMinInput: string
  budgetMaxInput: string
  setBudgetMinInput: (v: string) => void
  setBudgetMaxInput: (v: string) => void
  /** Minimum above maximum: the budget filter is not sent. */
  budgetRangeInvalid: boolean
  activeFilterTags: readonly BrowseFilterTag[]
  removeBrowseFilterTag: (tag: BrowseFilterTag) => void
  clearAllBrowseFilters: () => void

  selectedTaskId: string | null
  /** Bumps on every non-null selection (including re-selecting the same task). */
  selectedTaskSelectionToken: number
  /** Bumps when the user asks for their location: the map flies there even if the centre is unchanged. */
  recenterToken: number
  setSelectedTaskId: (
    v: string | null | ((prev: string | null) => string | null),
  ) => void
  /** True while the map nav route is fetching or animating. */
  isNavRoutePresenting: boolean
  onNavRoutePresentingChange: (presenting: boolean) => void

  loading: boolean
  /** New results loading while the previous ones stay on screen. */
  isRefreshing: boolean
  error: { message: string } | null | undefined
  retryTasks: () => void
  dataLoaded: boolean
  /** Map/list loader: waiting for map readiness and/or the first tasks query. */
  isInitialTasksLoad: boolean
  /** Empty-state card may render (the latest fetch settled). */
  canShowBrowseEmptyState: boolean
  /** Tasks loaded so far (all pages). */
  browseSourceTaskCount: number
  /** Results nearest first, every loaded page. */
  filteredSorted: TaskListItem[]
  hasMoreTasks: boolean
  loadingMoreTasks: boolean
  loadMoreTasks: () => void
  effectiveMapTasksForBox: BrowseMapTask[]
  shouldWaitForMap: boolean
  /** True once the map signalled readiness (or immediately when no Mapbox token). */
  isMapReadyForQuery: boolean
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

const MIN_RADIUS_MILES = 1
const MAX_RADIUS_MILES = 50
/** Edit this to tune map center offset for desktop split layout. */
const DESKTOP_MAP_CENTER_LEFT_INSET_PX = 420
/** Mobile (base < lg) should not offset map center. */
const MOBILE_MAP_CENTER_LEFT_INSET_PX = 0
/** Discovery `tasks` page size (server default and max). */
const TASKS_PAGE_SIZE = 100
/** Pause after typing before search text or budget is sent. */
const SEARCH_DEBOUNCE_MS = 300
const NO_BUDGET: BrowseBudgetFilter = { min: null, max: null }

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

function coordsLabel(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

/** Deep-link state hydrated from /search URL params (all optional). */
export type TaskBrowseInitialState = {
  reference?: BrowseReferenceLocation | null
  radiusMiles?: number | null
  searchText?: string | null
}

type TaskBrowseProviderProps = {
  children: React.ReactNode
  initialTasks: TaskListItem[]
  isDesktop: boolean
  /** Seeds filters + viewport once on mount (shareable /search URLs). */
  initialState?: TaskBrowseInitialState
  /** Location/radius only — used by /workers so the tasks query stays off. */
  skipTasksQuery?: boolean
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

function toBrowseMapTask(
  task: TaskListItem,
  reference: BrowseReferenceLocation,
): BrowseMapTask {
  const { main, sub } = formatBudget(task)
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.categories?.[0],
    location: taskPublicLocationLabel(task),
    locationLat: task.location?.lat ?? null,
    locationLng: task.location?.lng ?? null,
    priceLabel: main,
    detailLine: `${main} · ${sub}`,
    distanceLabel: taskDistanceLabelFromReference(task, reference),
  }
}

export function TaskBrowseProvider({
  children,
  initialTasks,
  isDesktop,
  initialState,
  skipTasksQuery = false,
}: TaskBrowseProviderProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const hasMapboxToken = Boolean(mapboxToken?.trim())
  const t = useI11n(bag)
  const dateLocale = useLocale() === 'zh-hk' ? 'zh-HK' : 'en-GB'
  const me = useMe()

  // Mount-only URL hydration snapshot — later prop changes are ignored.
  const initialStateRef = useRef(initialState)
  const seededReference =
    initialStateRef.current?.reference ?? DEFAULT_BROWSE_REFERENCE
  const seededRadius = clampRadiusMiles(
    initialStateRef.current?.radiusMiles ??
      DEFAULT_BROWSE_SUBMITTED_RADIUS_MILES,
  )
  const seededSearchText = initialStateRef.current?.searchText?.trim() ?? ''

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
  const [radiusMiles, setRadiusMiles] = useState(seededRadius)
  const [submittedRadiusMiles, setSubmittedRadiusMiles] = useState(seededRadius)

  // Task search: typed values apply after a short pause (or Enter); dates
  // and clearing apply at once.
  const [searchInput, setSearchInputRaw] = useState(seededSearchText)
  const [searchText, setSearchText] = useState(seededSearchText)
  const [dateFilter, setDateFilterState] = useState<BrowseDateFilter | null>(
    null,
  )
  const [budgetMinInput, setBudgetMinInput] = useState('')
  const [budgetMaxInput, setBudgetMaxInput] = useState('')
  const [budget, setBudget] = useState<BrowseBudgetFilter>(NO_BUDGET)

  const setSearchInput = useCallback((v: string) => {
    setSearchInputRaw(v)
  }, [])
  const commitSearch = useCallback(() => {
    setSearchText(searchInput.trim())
  }, [searchInput])

  useEffect(() => {
    const next = searchInput.trim()
    if (next === searchText) return
    const timer = setTimeout(() => setSearchText(next), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchInput, searchText])

  const parsedBudget = useMemo(
    () => parseBrowseBudget(budgetMinInput, budgetMaxInput),
    [budgetMinInput, budgetMaxInput],
  )
  useEffect(() => {
    const next = parsedBudget.invalid
      ? NO_BUDGET
      : { min: parsedBudget.min, max: parsedBudget.max }
    if (next.min === budget.min && next.max === budget.max) return
    const timer = setTimeout(() => setBudget(next), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [parsedBudget, budget])

  // Search / filter usage (no search text leaves the browser).
  const lastTrackedSearchRef = useRef(seededSearchText)
  useEffect(() => {
    if (skipTasksQuery || !searchText) return
    if (searchText === lastTrackedSearchRef.current) return
    lastTrackedSearchRef.current = searchText
    capture(EVENTS.browse_search, { query_length: searchText.length })
  }, [searchText, skipTasksQuery])
  useEffect(() => {
    if (skipTasksQuery || (budget.min == null && budget.max == null)) return
    capture(EVENTS.browse_filter_budget, {
      has_min: budget.min != null,
      has_max: budget.max != null,
    })
  }, [budget, skipTasksQuery])

  const setDateFilter = useCallback((next: BrowseDateFilter | null) => {
    setDateFilterState(next)
    if (next) capture(EVENTS.browse_filter_date, { preset: next.preset })
  }, [])

  const [referenceLocation, setReferenceLocation] =
    useState<BrowseReferenceLocation>(seededReference)
  const [geolocationStatus, setGeolocationStatus] =
    useState<BrowseGeolocationStatus>('idle')
  const [areaLocationInput, setAreaLocationInput] = useState(
    seededReference.label,
  )
  const pendingAreaSearchQueryRef = useRef<string | null>(null)
  const lastResolvedAreaSearchQueryRef = useRef<string | null>(null)
  const geolocationInitStartedRef = useRef(false)
  const [selectedTaskId, setSelectedTaskIdState] = useState<string | null>(null)
  const [selectedTaskSelectionToken, setSelectedTaskSelectionToken] =
    useState(0)
  const [recenterToken, setRecenterToken] = useState(0)
  const [isNavRoutePresenting, setIsNavRoutePresenting] = useState(false)
  const isNavRoutePresentingRef = useRef(false)
  const navRoutePresentingLockTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null)

  const onNavRoutePresentingChange = useCallback((presenting: boolean) => {
    if (!presenting) return
    if (isNavRoutePresentingRef.current) return

    isNavRoutePresentingRef.current = true
    setIsNavRoutePresenting(true)
    navRoutePresentingLockTimerRef.current = setTimeout(() => {
      navRoutePresentingLockTimerRef.current = null
      isNavRoutePresentingRef.current = false
      setIsNavRoutePresenting(false)
    }, 1000)
  }, [])

  const setSelectedTaskId = useCallback(
    (value: string | null | ((prev: string | null) => string | null)) => {
      setSelectedTaskIdState((prev) => {
        const next = typeof value === 'function' ? value(prev) : value
        // Route-draw lock ignores *new* selections (carousel/map fight).
        // Clearing must always apply so the pin returns to compact.
        if (next && isNavRoutePresentingRef.current) return prev
        if (next || next !== prev) {
          setSelectedTaskSelectionToken((t) => t + 1)
        }
        return next
      })
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

  // Sort centre fallback: a worker's saved area beats London. A shared
  // link, current location or "Search this area" all win over it.
  const preferred = me?.worker?.preferredLocation
  useEffect(() => {
    if (skipTasksQuery || referenceLocation.source !== 'default') return
    const lat = preferred?.lat
    const lng = preferred?.lng
    if (typeof lat !== 'number' || typeof lng !== 'number') return
    applyReference({
      lat,
      lng,
      label: preferred?.name?.trim() || coordsLabel(lat, lng),
      source: 'preferred',
    })
  }, [applyReference, preferred, referenceLocation.source, skipTasksQuery])

  const prevHasMapboxTokenRef = useRef(hasMapboxToken)
  if (hasMapboxToken !== prevHasMapboxTokenRef.current) {
    prevHasMapboxTokenRef.current = hasMapboxToken
    setIsMapReadyForQuery(!hasMapboxToken)
  }

  // Everywhere, nearest first from the sort centre (BE-68): no radius.
  const queryVariables = useMemo<TaskListVariables>(
    () => ({
      filter: buildTaskFilter({
        lat: searchCenterLat,
        lng: searchCenterLng,
        search: searchText,
        scheduledAfter: dateFilter?.from,
        scheduledBefore: dateFilter?.to,
        budgetMin: budget.min,
        budgetMax: budget.max,
      }),
      sort: taskSortToInput('nearest'),
      first: TASKS_PAGE_SIZE,
    }),
    [budget, dateFilter, searchCenterLat, searchCenterLng, searchText],
  )

  const shouldWaitForMap = hasMapboxToken
  const tasksQuerySkipped = shouldWaitForMap && !isMapReadyForQuery
  const { data, previousData, loading, error, fetchMore, refetch } = useQuery<
    TasksQueryData,
    TaskListVariables
  >(Tasks, {
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
    skip: skipTasksQuery || tasksQuerySkipped,
  })

  // The previous results stay on screen (list and pins) while new ones load.
  const shown = data ?? previousData
  const filteredSorted = shown?.tasks ?? initialTasks

  const [loadingMoreTasks, setLoadingMoreTasks] = useState(false)
  const [exhaustedKey, setExhaustedKey] = useState<string | null>(null)
  const variablesKey = JSON.stringify(queryVariables)
  const loadedCount = data?.tasks.length ?? 0
  const hasMoreTasks =
    loadedCount > 0 &&
    loadedCount % TASKS_PAGE_SIZE === 0 &&
    exhaustedKey !== variablesKey

  const searchCoverageMiles = useMemo(
    () =>
      browseCoverageMiles(
        data?.tasks,
        hasMoreTasks,
        searchCenterLat,
        searchCenterLng,
      ),
    [data, hasMoreTasks, searchCenterLat, searchCenterLng],
  )

  const loadMoreTasks = useCallback(() => {
    const last = data?.tasks.at(-1)
    if (!last || loadingMoreTasks) return
    setLoadingMoreTasks(true)
    void fetchMore({ variables: { after: last.id } })
      .then((result) => {
        if ((result.data?.tasks.length ?? 0) < TASKS_PAGE_SIZE) {
          setExhaustedKey(variablesKey)
        }
      })
      .catch(() => {
        showAppToast({ title: t.loadMoreFailed, type: 'error' })
      })
      .finally(() => setLoadingMoreTasks(false))
  }, [data, fetchMore, loadingMoreTasks, t.loadMoreFailed, variablesKey])

  const retryTasks = useCallback(() => {
    void refetch()
  }, [refetch])

  const activeFilterTags = useMemo(
    () =>
      buildActiveBrowseFilterTags(
        { searchText, dateFilter, budget },
        {
          today: t.filterToday,
          thisWeek: t.filterThisWeek,
          fromDate: t.filterFromDate,
          untilDate: t.filterUntilDate,
          budgetFrom: t.filterBudgetFrom,
          budgetUpTo: t.filterBudgetUpTo,
        },
        dateLocale,
      ),
    [budget, dateFilter, dateLocale, searchText, t],
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

  const effectiveMapTasksForBox = useMemo(
    () =>
      filteredSorted.map((task) => toBrowseMapTask(task, referenceLocation)),
    [filteredSorted, referenceLocation],
  )

  const confirmSearchThisAreaFromMap = useCallback(
    (lat: number, lng: number, zoom: number) => {
      const nextRadius = clampRadiusMiles(zoomToRadiusMiles(zoom))
      setRadiusMiles(nextRadius)
      setSubmittedRadiusMiles(nextRadius)
      const token = mapboxToken?.trim()
      const apply = (name?: string | null) =>
        applyReference({
          lat,
          lng,
          label: name?.trim() || coordsLabel(lat, lng),
          source: 'manual',
        })
      if (!token) {
        apply()
        return
      }
      // A failed place lookup still moves the centre (coordinates label).
      void mapboxReverseGeocode(lat, lng, token).then(apply, () => apply())
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
    void mapboxForwardGeocode(q, token, {
      proximity: { lat: referenceLocation.lat, lng: referenceLocation.lng },
    })
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
  }, [
    applyReference,
    areaLocationInput,
    mapboxToken,
    referenceLocation.lat,
    referenceLocation.lng,
  ])

  // Deep links carry lat/lng only — resolve a human label once on mount.
  useEffect(() => {
    const seeded = initialStateRef.current?.reference
    const token = mapboxToken?.trim()
    if (!seeded || !token || seeded.label !== URL_SEEDED_AREA_LABEL) return
    void mapboxReverseGeocode(seeded.lat, seeded.lng, token).then((name) => {
      const label = name?.trim()
      if (!label) return
      setReferenceLocation((current) =>
        current.lat === seeded.lat &&
        current.lng === seeded.lng &&
        current.label === URL_SEEDED_AREA_LABEL
          ? { ...current, label }
          : current,
      )
      setAreaLocationInput((current) =>
        current === URL_SEEDED_AREA_LABEL ? label : current,
      )
    })
  }, [mapboxToken])

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

  const locateUser = useCallback(
    (opts?: { highAccuracy?: boolean; recenter?: boolean }) => {
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
          if (opts?.recenter) setRecenterToken((token) => token + 1)
        },
        () => {
          setGeolocationStatus('denied')
        },
        {
          enableHighAccuracy: opts?.highAccuracy ?? true,
          timeout: 12_000,
          maximumAge: 60_000,
        },
      )
    },
    [applyGeolocatedSearch],
  )

  // FE-266: the location button drops any selected task and always flies
  // to the user, even when the search centre has not changed.
  const requestUseMyLocation = useCallback(() => {
    setSelectedTaskId(null)
    locateUser({ recenter: true })
  }, [locateUser, setSelectedTaskId])

  const initGeolocationOnLoad = useCallback(() => {
    if (geolocationInitStartedRef.current) return
    geolocationInitStartedRef.current = true
    void browseGeolocationPermission().then((permission) => {
      // Only silently center on the visitor when GPS is already allowed.
      // Otherwise keep the default/URL reference — no permission prompt or
      // "Geolocation information is not available" noise on first visit.
      if (permission !== 'granted') return
      locateUser({ highAccuracy: false })
    })
  }, [locateUser])

  const submitBrowseFilters = useCallback(() => {
    setSubmittedRadiusMiles(radiusMiles)
  }, [radiusMiles])

  const syncDraftFiltersFromSubmitted = useCallback(() => {
    setRadiusMiles(submittedRadiusMiles)
    setAreaLocationInput(referenceLocation.label)
  }, [referenceLocation.label, submittedRadiusMiles])

  const clearAllBrowseFilters = useCallback(() => {
    setSearchInputRaw('')
    setSearchText('')
    setDateFilterState(null)
    setBudgetMinInput('')
    setBudgetMaxInput('')
    setBudget(NO_BUDGET)
    capture(EVENTS.browse_filters_clear)
  }, [])

  const removeBrowseFilterTag = useCallback((tag: BrowseFilterTag) => {
    if (tag.kind === 'search') {
      setSearchInputRaw('')
      setSearchText('')
    } else if (tag.kind === 'date') {
      setDateFilterState(null)
    } else {
      setBudgetMinInput('')
      setBudgetMaxInput('')
      setBudget(NO_BUDGET)
    }
  }, [])

  const dataLoaded = Boolean(data)
  const isInitialTasksLoad = tasksQuerySkipped || (loading && !shown)
  const isRefreshing = loading && Boolean(shown) && !loadingMoreTasks
  const canShowBrowseEmptyState = !loading && dataLoaded
  const isSearchPending = searchInput.trim() !== searchText || isRefreshing

  const dataValue = useMemo<TaskBrowseDataContextValue>(
    () => ({
      radiusMiles,
      submittedRadiusMiles,
      setRadiusMiles,
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
      searchCoverageMiles,
      confirmSearchThisAreaFromMap,
      searchInput,
      setSearchInput,
      commitSearch,
      searchText,
      isSearchPending,
      dateFilter,
      setDateFilter,
      budgetMinInput,
      budgetMaxInput,
      setBudgetMinInput,
      setBudgetMaxInput,
      budgetRangeInvalid: parsedBudget.invalid,
      activeFilterTags,
      removeBrowseFilterTag,
      clearAllBrowseFilters,
      selectedTaskId: visibleSelectedTaskId,
      selectedTaskSelectionToken,
      recenterToken,
      setSelectedTaskId,
      isNavRoutePresenting,
      onNavRoutePresentingChange,
      loading,
      isRefreshing,
      error,
      retryTasks,
      dataLoaded,
      isInitialTasksLoad,
      canShowBrowseEmptyState,
      browseSourceTaskCount: filteredSorted.length,
      filteredSorted,
      hasMoreTasks,
      loadingMoreTasks,
      loadMoreTasks,
      effectiveMapTasksForBox,
      shouldWaitForMap,
      isMapReadyForQuery,
      markMapReadyForQuery: (ready) => {
        if (ready) setIsMapReadyForQuery(true)
      },
    }),
    [
      activeFilterTags,
      applyGeolocatedSearch,
      areaLocationInput,
      budgetMaxInput,
      budgetMinInput,
      canShowBrowseEmptyState,
      clearAllBrowseFilters,
      commitAreaLocationSearch,
      commitSearch,
      confirmSearchThisAreaFromMap,
      dataLoaded,
      dateFilter,
      effectiveMapTasksForBox,
      error,
      filteredSorted,
      geolocationStatus,
      hasMoreTasks,
      initGeolocationOnLoad,
      isInitialTasksLoad,
      isMapReadyForQuery,
      isNavRoutePresenting,
      isRefreshing,
      isSearchPending,
      loadMoreTasks,
      loading,
      loadingMoreTasks,
      onNavRoutePresentingChange,
      parsedBudget.invalid,
      radiusMiles,
      referenceLocation,
      removeBrowseFilterTag,
      requestUseMyLocation,
      retryTasks,
      searchCenterLat,
      searchCenterLng,
      searchCoverageMiles,
      searchInput,
      searchText,
      selectedTaskSelectionToken,
      recenterToken,
      setDateFilter,
      setSearchInput,
      setSelectedTaskId,
      shouldWaitForMap,
      submitBrowseFilters,
      submittedRadiusMiles,
      syncDraftFiltersFromSubmitted,
      visibleSelectedTaskId,
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
  | 'recenterToken'
  | 'onSelectTask'
  | 'onSearchThisAreaUiChange'
  | 'searchCoverageMiles'
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
    recenterToken: data.recenterToken,
    onSelectTask: data.setSelectedTaskId,
    onSearchThisAreaUiChange: layout.setSearchThisAreaUi,
    searchCoverageMiles: data.searchCoverageMiles,
  }
}
