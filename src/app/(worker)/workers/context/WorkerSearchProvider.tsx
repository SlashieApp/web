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

import { useTaskBrowseData } from '@/app/(task)/context/TaskBrowseProvider'

import WorkersSearch from '../graphql/WorkersSearch.gql'
import type { WorkerSearchItem } from '../helpers/workerSearchHelpers'

export type WorkerSearchInitialState = {
  searchText?: string | null
  verifiedOnly?: boolean | null
}

type WorkerSearchContextValue = {
  workerSearchInput: string
  setWorkerSearchInput: (v: string) => void
  verifiedOnly: boolean
  setVerifiedOnly: (v: boolean) => void
  submittedWorkerSearchText: string
  submittedVerifiedOnly: boolean
  submitWorkerFilters: () => void
  clearWorkerFilters: () => void
  syncWorkerDraftFromSubmitted: () => void
  isFilterOpen: boolean
  setIsFilterOpen: (open: boolean) => void
  workers: WorkerSearchItem[]
  loading: boolean
  dataLoaded: boolean
  canShowWorkersEmptyState: boolean
}

const WorkerSearchContext = createContext<WorkerSearchContextValue | null>(null)

/**
 * Worker directory data layer. Shares area (center + radius) with
 * `TaskBrowseProvider`; runs `WorkersSearch` for public-safe fields only.
 */
export function WorkerSearchProvider({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: WorkerSearchInitialState
}) {
  const initialStateRef = useRef(initialState)
  const seededSearch = initialStateRef.current?.searchText?.trim() ?? ''
  const seededVerified = initialStateRef.current?.verifiedOnly ?? false

  const { searchCenterLat, searchCenterLng, submittedRadiusMiles } =
    useTaskBrowseData()

  const [workerSearchInput, setWorkerSearchInput] = useState(seededSearch)
  const [verifiedOnly, setVerifiedOnly] = useState(seededVerified)
  const [submittedWorkerSearchText, setSubmittedWorkerSearchText] =
    useState(seededSearch)
  const [submittedVerifiedOnly, setSubmittedVerifiedOnly] =
    useState(seededVerified)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const submitWorkerFilters = useCallback(() => {
    setSubmittedWorkerSearchText(workerSearchInput.trim())
    setSubmittedVerifiedOnly(verifiedOnly)
  }, [workerSearchInput, verifiedOnly])

  const clearWorkerFilters = useCallback(() => {
    setWorkerSearchInput('')
    setVerifiedOnly(false)
    setSubmittedWorkerSearchText('')
    setSubmittedVerifiedOnly(false)
  }, [])

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
  })

  const workers = useMemo(() => data?.workers ?? [], [data])
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
      clearWorkerFilters,
      syncWorkerDraftFromSubmitted,
      isFilterOpen,
      setIsFilterOpen,
      workers,
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
      clearWorkerFilters,
      syncWorkerDraftFromSubmitted,
      isFilterOpen,
      workers,
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
