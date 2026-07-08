'use client'

import { useQuery } from '@apollo/client/react'
import type {
  WorkerFilter,
  WorkerSort,
  WorkersSearchQuery,
} from '@codegen/schema'
import { SortDirection, WorkerSortField } from '@codegen/schema'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
import type { TaskMapTask } from '../../helpers/taskMap'
import WorkersSearch from '../graphql/WorkersSearch.gql'
import {
  type WorkerSearchItem,
  workerToMapPoint,
} from '../helpers/workerSearchHelpers'

export type WorkerSearchInitialState = {
  searchText?: string | null
  verifiedOnly?: boolean | null
}

type WorkerSearchContextValue = {
  /** Draft filter fields (edited in the worker filter panel). */
  workerSearchInput: string
  setWorkerSearchInput: (v: string) => void
  verifiedOnly: boolean
  setVerifiedOnly: (v: boolean) => void
  /** Submitted snapshot (drives the query + chips + URL). */
  submittedWorkerSearchText: string
  submittedVerifiedOnly: boolean
  submitWorkerFilters: () => void
  syncWorkerDraftFromSubmitted: () => void
  workers: WorkerSearchItem[]
  /** Approximate service-area pins (workers without coords are excluded). */
  workerMapPoints: TaskMapTask[]
  selectedWorkerId: string | null
  selectedWorkerSelectionToken: number
  setSelectedWorkerId: (v: string | null) => void
  loading: boolean
  dataLoaded: boolean
  canShowWorkersEmptyState: boolean
}

const WorkerSearchContext = createContext<WorkerSearchContextValue | null>(null)

/**
 * Worker-mode data layer for /search. Shares the map viewport (center +
 * radius) and map-readiness gate with `TaskBrowseProvider`; runs the
 * `WorkersSearch` query only while worker mode is active. Public-safe fields
 * only — see WorkersSearch.gql.
 */
export function WorkerSearchProvider({
  children,
  enabled,
  initialState,
}: {
  children: React.ReactNode
  enabled: boolean
  initialState?: WorkerSearchInitialState
}) {
  const initialStateRef = useRef(initialState)
  const seededSearch = initialStateRef.current?.searchText?.trim() ?? ''
  const seededVerified = initialStateRef.current?.verifiedOnly ?? false

  const {
    searchCenterLat,
    searchCenterLng,
    submittedRadiusMiles,
    shouldWaitForMap,
    isMapReadyForQuery,
  } = useTaskBrowseData()

  const [workerSearchInput, setWorkerSearchInput] = useState(seededSearch)
  const [verifiedOnly, setVerifiedOnly] = useState(seededVerified)
  const [submittedWorkerSearchText, setSubmittedWorkerSearchText] =
    useState(seededSearch)
  const [submittedVerifiedOnly, setSubmittedVerifiedOnly] =
    useState(seededVerified)
  const [selectedWorkerId, setSelectedWorkerIdState] = useState<string | null>(
    null,
  )
  const [selectedWorkerSelectionToken, setSelectedWorkerSelectionToken] =
    useState(0)

  const setSelectedWorkerId = useCallback((value: string | null) => {
    if (value) setSelectedWorkerSelectionToken((t) => t + 1)
    setSelectedWorkerIdState(value)
  }, [])

  const submitWorkerFilters = useCallback(() => {
    setSubmittedWorkerSearchText(workerSearchInput.trim())
    setSubmittedVerifiedOnly(verifiedOnly)
  }, [workerSearchInput, verifiedOnly])

  const syncWorkerDraftFromSubmitted = useCallback(() => {
    setWorkerSearchInput(submittedWorkerSearchText)
    setVerifiedOnly(submittedVerifiedOnly)
  }, [submittedWorkerSearchText, submittedVerifiedOnly])

  const variables = useMemo(() => {
    const filter: WorkerFilter = {
      lat: searchCenterLat,
      lng: searchCenterLng,
      radiusMiles: submittedRadiusMiles,
    }
    if (submittedWorkerSearchText) filter.search = submittedWorkerSearchText
    if (submittedVerifiedOnly) filter.verifiedOnly = true
    const sort: WorkerSort = {
      field: WorkerSortField.Distance,
      direction: SortDirection.Asc,
    }
    return { filter, sort }
  }, [
    searchCenterLat,
    searchCenterLng,
    submittedRadiusMiles,
    submittedWorkerSearchText,
    submittedVerifiedOnly,
  ])

  const { data, loading } = useQuery<WorkersSearchQuery>(WorkersSearch, {
    variables,
    notifyOnNetworkStatusChange: true,
    // Same first-fetch gate as tasks: wait for the map before querying.
    skip: !enabled || (shouldWaitForMap && !isMapReadyForQuery),
  })

  const workers = useMemo(() => data?.workers ?? [], [data])

  const workerMapPoints = useMemo(
    () =>
      workers
        .map(workerToMapPoint)
        .filter((point): point is TaskMapTask => point !== null),
    [workers],
  )

  // Selection auto-clears when the selected worker leaves the result set.
  const visibleSelectedWorkerId =
    selectedWorkerId && workers.some((w) => w.id === selectedWorkerId)
      ? selectedWorkerId
      : null

  const dataLoaded = Boolean(data)

  const value = useMemo<WorkerSearchContextValue>(
    () => ({
      workerSearchInput,
      setWorkerSearchInput,
      verifiedOnly,
      setVerifiedOnly,
      submittedWorkerSearchText,
      submittedVerifiedOnly,
      submitWorkerFilters,
      syncWorkerDraftFromSubmitted,
      workers,
      workerMapPoints,
      selectedWorkerId: visibleSelectedWorkerId,
      selectedWorkerSelectionToken,
      setSelectedWorkerId,
      loading,
      dataLoaded,
      canShowWorkersEmptyState: dataLoaded && !loading,
    }),
    [
      workerSearchInput,
      verifiedOnly,
      submittedWorkerSearchText,
      submittedVerifiedOnly,
      submitWorkerFilters,
      syncWorkerDraftFromSubmitted,
      workers,
      workerMapPoints,
      visibleSelectedWorkerId,
      selectedWorkerSelectionToken,
      setSelectedWorkerId,
      loading,
      dataLoaded,
    ],
  )

  return (
    <WorkerSearchContext.Provider value={value}>
      {children}
    </WorkerSearchContext.Provider>
  )
}

export function useWorkerSearch(): WorkerSearchContextValue {
  const ctx = useContext(WorkerSearchContext)
  if (!ctx) {
    throw new Error('useWorkerSearch must be used within WorkerSearchProvider')
  }
  return ctx
}
