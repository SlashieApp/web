'use client'

import { useQuery } from '@apollo/client/react'
import type { MeQuery } from '@codegen/schema'
import { createContext, useCallback, useContext, useMemo } from 'react'

import { ME_QUERY } from '@/graphql/auth'
import { MY_TASKS_QUERY } from '@/graphql/tasks'
import type { MyTasksQueryData } from '@/graphql/tasks-query.types'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

import {
  type TaskItem,
  isTaskCompleted,
  timeFromUnknown,
} from '@/utils/dashboardHelpers'

export type IncomingQuoteRow = {
  task: TaskItem
  offer: TaskItem['offers'][number]
}

type CustomerAccountContextValue = {
  me: MeQuery['me'] | null
  meLoading: boolean
  meErrorMessage: string | null
  tasksLoading: boolean
  tasksErrorMessage: string | null
  refetchCustomerAccount: () => void
  myPostedTasks: TaskItem[]
  activePostedTasks: TaskItem[]
  incomingQuotes: IncomingQuoteRow[]
}

const CustomerAccountContext =
  createContext<CustomerAccountContextValue | null>(null)

export function CustomerAccountProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const {
    data: meData,
    loading: meLoading,
    error: meError,
    refetch: refetchMe,
  } = useQuery<MeQuery>(ME_QUERY, {
    fetchPolicy: 'network-only',
  })

  const me = meData?.me ?? null

  const {
    data: tasksData,
    loading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery<MyTasksQueryData>(MY_TASKS_QUERY, {
    fetchPolicy: 'network-only',
    skip: !me,
  })

  const tasks = tasksData?.myTasks ?? []

  const { myPostedTasks, incomingQuotes } = useMemo(() => {
    if (!me) {
      return { myPostedTasks: [] as TaskItem[], incomingQuotes: [] }
    }

    const posted = tasks
      .filter((task) => task.createdByUserId === me.id)
      .sort(
        (a, b) => timeFromUnknown(b.createdAt) - timeFromUnknown(a.createdAt),
      )

    const quotes: IncomingQuoteRow[] = posted.flatMap((task) =>
      task.offers.map((offer) => ({ task, offer })),
    )
    quotes.sort(
      (a, b) =>
        timeFromUnknown(b.offer.createdAt) - timeFromUnknown(a.offer.createdAt),
    )

    return { myPostedTasks: posted, incomingQuotes: quotes }
  }, [tasks, me])

  const activePostedTasks = useMemo(
    () => myPostedTasks.filter((task) => !isTaskCompleted(task.status)),
    [myPostedTasks],
  )

  const meErrorMessage = meError
    ? getFriendlyErrorMessage(meError, 'Could not load account details.')
    : null
  const tasksErrorMessage = tasksError
    ? getFriendlyErrorMessage(tasksError, 'Could not load tasks.')
    : null

  const refetchCustomerAccount = useCallback(() => {
    void refetchMe()
    if (me) void refetchTasks()
  }, [me, refetchMe, refetchTasks])

  const value = useMemo<CustomerAccountContextValue>(
    () => ({
      me,
      meLoading,
      meErrorMessage,
      tasksLoading,
      tasksErrorMessage,
      refetchCustomerAccount,
      myPostedTasks,
      activePostedTasks,
      incomingQuotes,
    }),
    [
      activePostedTasks,
      incomingQuotes,
      me,
      meErrorMessage,
      meLoading,
      myPostedTasks,
      refetchCustomerAccount,
      tasksErrorMessage,
      tasksLoading,
    ],
  )

  return (
    <CustomerAccountContext.Provider value={value}>
      {children}
    </CustomerAccountContext.Provider>
  )
}

export function useCustomerAccount() {
  const ctx = useContext(CustomerAccountContext)
  if (!ctx) {
    throw new Error(
      'useCustomerAccount must be used inside CustomerAccountProvider.',
    )
  }
  return ctx
}
