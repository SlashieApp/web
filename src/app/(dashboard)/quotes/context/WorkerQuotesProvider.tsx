'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import { useAccountOrders } from '../../helpers/useAccountOrders'
import { useMyQuotes } from '../../helpers/useMyQuotes'
import { useTaskInboxFilters } from '../../helpers/useTaskInboxFilters'
import {
  type WorkerQuoteListFilter,
  type WorkerQuoteRow,
  buildWorkerQuoteRows,
  workerQuoteFilterLabel,
  workerQuoteMatchesFilter,
  workerQuoteStage,
} from '../../helpers/workerQuoteJobs'
import {
  type WorkerQuoteSummaryCounts,
  workerQuoteRowOnDate,
  workerQuoteSummaryCounts,
} from '../helpers/workerQuoteSchedule'

type WorkerQuotesContextValue = {
  me: ReturnType<typeof useMyQuotes>['me']
  loading: boolean
  errorMessage: string | null
  quoteRows: WorkerQuoteRow[]
  visibleQuotes: WorkerQuoteRow[]
  summaryCounts: WorkerQuoteSummaryCounts
  stageFilter: WorkerQuoteListFilter
  setStageFilter: (filter: WorkerQuoteListFilter) => void
  locationFilter: string
  setLocationFilter: (value: string) => void
  priceTypeFilter: string
  setPriceTypeFilter: (value: string) => void
  selectedCalendarDate: string | null
  selectCalendarDate: (dateKey: string) => void
  clearSelectedCalendarDate: () => void
  inboxFilters: ReturnType<typeof useTaskInboxFilters>
  hasActiveFilters: boolean
  clearAllFilters: () => void
  emptyHint: string
}

const WorkerQuotesContext = createContext<WorkerQuotesContextValue | null>(null)

export function WorkerQuotesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const inboxFilters = useTaskInboxFilters()
  const {
    me,
    loading: tasksLoading,
    errorMessage: tasksError,
    sentQuotes,
  } = useMyQuotes(inboxFilters.variables)
  const {
    orders,
    loading: ordersLoading,
    errorMessage: ordersError,
  } = useAccountOrders()

  const [stageFilter, setStageFilter] = useState<WorkerQuoteListFilter>('all')
  const [locationFilter, setLocationFilter] = useState('')
  const [priceTypeFilter, setPriceTypeFilter] = useState('')
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    string | null
  >(null)

  const meId = me?.id

  const quoteRows = useMemo(() => {
    if (!meId) return []
    return buildWorkerQuoteRows(sentQuotes, orders, meId)
  }, [sentQuotes, orders, meId])

  const visibleQuotes = useMemo(() => {
    const locationQuery = locationFilter.trim().toLowerCase()

    return quoteRows.filter((row) => {
      const stage = workerQuoteStage(row.task, row.quote, row.workerOrder)
      if (!workerQuoteMatchesFilter(stage, stageFilter)) return false

      if (selectedCalendarDate) {
        if (!workerQuoteRowOnDate(row, selectedCalendarDate)) return false
      }

      if (priceTypeFilter) {
        const budgetType = row.task.budget?.type?.toUpperCase() ?? ''
        if (budgetType !== priceTypeFilter) return false
      }

      if (locationQuery) {
        const location = taskPublicLocationLabel(row.task).toLowerCase()
        if (!location.includes(locationQuery)) return false
      }

      return true
    })
  }, [
    quoteRows,
    stageFilter,
    selectedCalendarDate,
    locationFilter,
    priceTypeFilter,
  ])

  const summaryCounts = useMemo(
    () => workerQuoteSummaryCounts(quoteRows),
    [quoteRows],
  )

  const selectCalendarDate = useCallback((dateKey: string) => {
    setSelectedCalendarDate((current) => (current === dateKey ? null : dateKey))
  }, [])

  const clearSelectedCalendarDate = useCallback(() => {
    setSelectedCalendarDate(null)
  }, [])

  const clearAllFilters = useCallback(() => {
    inboxFilters.reset()
    setStageFilter('all')
    setLocationFilter('')
    setPriceTypeFilter('')
    setSelectedCalendarDate(null)
  }, [inboxFilters])

  const hasActiveFilters =
    inboxFilters.isActive ||
    stageFilter !== 'all' ||
    locationFilter.trim().length > 0 ||
    priceTypeFilter.length > 0 ||
    selectedCalendarDate != null

  const emptyHint = useMemo(() => {
    if (selectedCalendarDate && visibleQuotes.length === 0) {
      return 'No quotes scheduled for this date.'
    }
    if (stageFilter === 'all') return 'No quotes match this view.'
    return `No ${workerQuoteFilterLabel(stageFilter).toLowerCase()} quotes right now.`
  }, [selectedCalendarDate, stageFilter, visibleQuotes.length])

  const loading = tasksLoading || ordersLoading
  const errorMessage = tasksError ?? ordersError

  const value = useMemo<WorkerQuotesContextValue>(
    () => ({
      me,
      loading,
      errorMessage,
      quoteRows,
      visibleQuotes,
      summaryCounts,
      stageFilter,
      setStageFilter,
      locationFilter,
      setLocationFilter,
      priceTypeFilter,
      setPriceTypeFilter,
      selectedCalendarDate,
      selectCalendarDate,
      clearSelectedCalendarDate,
      inboxFilters,
      hasActiveFilters,
      clearAllFilters,
      emptyHint,
    }),
    [
      me,
      loading,
      errorMessage,
      quoteRows,
      visibleQuotes,
      summaryCounts,
      stageFilter,
      locationFilter,
      priceTypeFilter,
      selectedCalendarDate,
      selectCalendarDate,
      clearSelectedCalendarDate,
      inboxFilters,
      hasActiveFilters,
      clearAllFilters,
      emptyHint,
    ],
  )

  return (
    <WorkerQuotesContext.Provider value={value}>
      {children}
    </WorkerQuotesContext.Provider>
  )
}

export function useWorkerQuotes() {
  const ctx = useContext(WorkerQuotesContext)
  if (!ctx) {
    throw new Error('useWorkerQuotes must be used within WorkerQuotesProvider')
  }
  return ctx
}
