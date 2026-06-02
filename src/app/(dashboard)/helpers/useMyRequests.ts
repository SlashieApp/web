'use client'

import { useQuery } from '@apollo/client/react'
import { useMemo } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import MyRequests from '@/app/(dashboard)/requests/graphql/MyRequests.gql'
import type { MyRequestsQueryData } from '@/graphql/tasks-query.types'
import {
  type TaskItem,
  isQuoteAwarded,
  isTaskCompleted,
  timeFromUnknown,
} from '@/utils/dashboardHelpers'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

/** Customer inbox: `myRequests` (poster or assigned worker). */
export function useMyRequests() {
  const me = useUserStore((s) => s.me)
  const { data, loading, error, refetch } = useQuery<MyRequestsQueryData>(
    MyRequests,
    {
      fetchPolicy: 'cache-and-network',
      skip: !me,
    },
  )

  const tasks = data?.myRequests ?? []

  const postedTasks = useMemo(() => {
    if (!me) return [] as TaskItem[]
    return tasks
      .filter((task) => task.poster?.id === me.id)
      .sort(
        (a, b) => timeFromUnknown(b.createdAt) - timeFromUnknown(a.createdAt),
      )
  }, [tasks, me])

  const activePostedTasks = useMemo(
    () => postedTasks.filter((t) => !isTaskCompleted(t.status)),
    [postedTasks],
  )

  const completedPostedTasks = useMemo(
    () => postedTasks.filter((t) => isTaskCompleted(t.status)),
    [postedTasks],
  )

  const customerJobs = useMemo(
    () =>
      activePostedTasks.filter((task) =>
        (task.quotes ?? []).some((q) => isQuoteAwarded(q.status)),
      ),
    [activePostedTasks],
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
    customerJobs,
  }
}
