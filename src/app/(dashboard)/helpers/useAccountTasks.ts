'use client'

import { useQuery } from '@apollo/client/react'
import { useMemo } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { MY_TASKS_QUERY } from '@/graphql/tasks'
import type { MyTasksQueryData } from '@/graphql/tasks-query.types'
import {
  type MyQuoteItem,
  type TaskItem,
  isQuoteAwarded,
  isTaskCompleted,
  timeFromUnknown,
} from '@/utils/dashboardHelpers'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

/**
 * Shared data hook for the merged dashboard. Reads `me` from Zustand and
 * fetches `myTasks` (no filter == all statuses, parity with the old shape).
 *
 * Authorization is API-driven by JWT — this hook never assumes a customer
 * vs worker mode; it just splits results client-side for display.
 */
export function useAccountTasks() {
  const me = useUserStore((s) => s.me)
  const { data, loading, error, refetch } = useQuery<MyTasksQueryData>(
    MY_TASKS_QUERY,
    {
      fetchPolicy: 'cache-and-network',
      skip: !me,
    },
  )

  const tasks = data?.myTasks ?? []

  const { postedTasks, sentQuotes } = useMemo(() => {
    if (!me) {
      return {
        postedTasks: [] as TaskItem[],
        sentQuotes: [] as MyQuoteItem[],
      }
    }

    const posted = tasks
      .filter((task) => task.poster?.id === me.id)
      .sort(
        (a, b) => timeFromUnknown(b.createdAt) - timeFromUnknown(a.createdAt),
      )

    const submitted: MyQuoteItem[] = tasks
      .flatMap((task) =>
        (task.quotes ?? [])
          .filter((quote) => quote.workerUserId === me.id)
          .map((quote) => ({ task, quote })),
      )
      .sort(
        (a, b) =>
          timeFromUnknown(b.quote.createdAt) -
          timeFromUnknown(a.quote.createdAt),
      )

    return { postedTasks: posted, sentQuotes: submitted }
  }, [tasks, me])

  const activePostedTasks = useMemo(
    () => postedTasks.filter((t) => !isTaskCompleted(t.status)),
    [postedTasks],
  )
  const completedPostedTasks = useMemo(
    () => postedTasks.filter((t) => isTaskCompleted(t.status)),
    [postedTasks],
  )

  const awardedSentQuotes = useMemo(
    () => sentQuotes.filter(({ quote }) => isQuoteAwarded(quote.status)),
    [sentQuotes],
  )

  /** Tasks I posted with at least one accepted quote (customer-side jobs). */
  const customerJobs = useMemo(
    () =>
      activePostedTasks.filter((task) =>
        (task.quotes ?? []).some((q) => isQuoteAwarded(q.status)),
      ),
    [activePostedTasks],
  )

  /** Tasks where my own quote was accepted (worker-side jobs). */
  const workerJobs = useMemo(
    () => awardedSentQuotes.filter(({ task }) => !isTaskCompleted(task.status)),
    [awardedSentQuotes],
  )

  return {
    me,
    loading,
    errorMessage: error
      ? getFriendlyErrorMessage(error, 'Could not load tasks.')
      : null,
    refetch,
    tasks,
    postedTasks,
    activePostedTasks,
    completedPostedTasks,
    sentQuotes,
    awardedSentQuotes,
    customerJobs,
    workerJobs,
  }
}
