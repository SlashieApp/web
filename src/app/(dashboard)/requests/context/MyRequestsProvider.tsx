'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'

import {
  type PostedTaskListFilter,
  type PostedTaskRow,
  type RequestsTab,
  customerOrderForTask,
  isPostedTaskArchived,
  postedTaskFilterLabel,
  postedTaskMatchesFilter,
  postedTaskStage,
} from '../../helpers/postedTaskCustomer'
import { useAccountOrders } from '../../helpers/useAccountOrders'
import { useMyRequests } from '../../helpers/useMyRequests'
import { useTaskInboxFilters } from '../../helpers/useTaskInboxFilters'
import {
  type PostedTaskSummaryCounts,
  postedTaskRowOnDate,
  postedTaskSummaryCounts,
} from '../helpers/postedTaskSchedule'

type MyRequestsContextValue = {
  me: ReturnType<typeof useMyRequests>['me']
  loading: boolean
  errorMessage: string | null
  taskRows: PostedTaskRow[]
  activeRows: PostedTaskRow[]
  completedRows: PostedTaskRow[]
  visibleTasks: PostedTaskRow[]
  summaryCounts: PostedTaskSummaryCounts
  tab: RequestsTab
  setTab: (tab: RequestsTab) => void
  stageFilter: PostedTaskListFilter
  setStageFilter: (filter: PostedTaskListFilter) => void
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

const MyRequestsContext = createContext<MyRequestsContextValue | null>(null)

export function MyRequestsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const inboxFilters = useTaskInboxFilters()
  const {
    me,
    loading: tasksLoading,
    errorMessage: tasksError,
    postedTasks,
  } = useMyRequests(inboxFilters.variables)
  const {
    orders,
    loading: ordersLoading,
    errorMessage: ordersError,
  } = useAccountOrders()

  const [tab, setTab] = useState<RequestsTab>('active')
  const [stageFilter, setStageFilter] = useState<PostedTaskListFilter>('all')
  const [locationFilter, setLocationFilter] = useState('')
  const [priceTypeFilter, setPriceTypeFilter] = useState('')
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    string | null
  >(null)

  const meId = me?.id

  const taskRows = useMemo(() => {
    if (!meId) return []
    return postedTasks.map((task) => ({
      task,
      customerOrder: customerOrderForTask(orders, task.id, meId),
    }))
  }, [postedTasks, orders, meId])

  const { activeRows, completedRows } = useMemo(() => {
    const active: PostedTaskRow[] = []
    const completed: PostedTaskRow[] = []
    for (const row of taskRows) {
      if (isPostedTaskArchived(row.task, row.customerOrder)) {
        completed.push(row)
      } else {
        active.push(row)
      }
    }
    return { activeRows: active, completedRows: completed }
  }, [taskRows])

  const visibleTasks = useMemo(() => {
    const baseRows = tab === 'completed' ? completedRows : activeRows
    const locationQuery = locationFilter.trim().toLowerCase()

    return baseRows.filter((row) => {
      if (tab === 'active') {
        const stage = postedTaskStage(row.task, row.customerOrder)
        if (!postedTaskMatchesFilter(stage, stageFilter)) return false
      }

      if (selectedCalendarDate) {
        if (!postedTaskRowOnDate(row, selectedCalendarDate)) return false
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
    tab,
    activeRows,
    completedRows,
    stageFilter,
    selectedCalendarDate,
    locationFilter,
    priceTypeFilter,
  ])

  const summaryCounts = useMemo(
    () => postedTaskSummaryCounts(activeRows),
    [activeRows],
  )

  const selectCalendarDate = useCallback((dateKey: string) => {
    setSelectedCalendarDate((current) => (current === dateKey ? null : dateKey))
  }, [])

  const clearSelectedCalendarDate = useCallback(() => {
    setSelectedCalendarDate(null)
  }, [])

  const clearAllFilters = useCallback(() => {
    inboxFilters.reset()
    setTab('active')
    setStageFilter('all')
    setLocationFilter('')
    setPriceTypeFilter('')
    setSelectedCalendarDate(null)
  }, [inboxFilters])

  const hasActiveFilters =
    inboxFilters.isActive ||
    tab !== 'active' ||
    stageFilter !== 'all' ||
    locationFilter.trim().length > 0 ||
    priceTypeFilter.length > 0 ||
    selectedCalendarDate != null

  const emptyHint = useMemo(() => {
    if (selectedCalendarDate && visibleTasks.length === 0) {
      return 'No requests scheduled for this date.'
    }
    if (tab === 'completed') {
      return 'No completed requests match this view.'
    }
    if (stageFilter === 'all') return 'No requests match this view.'
    return `No ${postedTaskFilterLabel(stageFilter).toLowerCase()} requests right now.`
  }, [selectedCalendarDate, tab, stageFilter, visibleTasks.length])

  const loading = tasksLoading || ordersLoading
  const errorMessage = tasksError ?? ordersError

  const value = useMemo<MyRequestsContextValue>(
    () => ({
      me,
      loading,
      errorMessage,
      taskRows,
      activeRows,
      completedRows,
      visibleTasks,
      summaryCounts,
      tab,
      setTab,
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
      taskRows,
      activeRows,
      completedRows,
      visibleTasks,
      summaryCounts,
      tab,
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
    <MyRequestsContext.Provider value={value}>
      {children}
    </MyRequestsContext.Provider>
  )
}

export function useMyRequestsPage() {
  const ctx = useContext(MyRequestsContext)
  if (!ctx) {
    throw new Error('useMyRequestsPage must be used within MyRequestsProvider')
  }
  return ctx
}
