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
} from '@/utils/dashboardHelpers'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import type { TaskListVariables } from '@/utils/taskListQuery'

/** Customer inbox: `myRequests` (poster or assigned worker). */
export function useMyRequests(variables?: TaskListVariables) {
  const me = useUserStore((s) => s.me)
  const { data, loading, error, refetch } = useQuery<
    MyRequestsQueryData,
    TaskListVariables
  >(MyRequests, {
    variables,
    fetchPolicy: 'cache-and-network',
    skip: !me,
  })

  const tasks = data?.myRequests ?? []

  const postedTasks = useMemo(() => {
    if (!me) return [] as TaskItem[]
    // Server applies the chosen `sort`; preserve that order here.
    return tasks.filter((task) => task.poster?.id === me.id)
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
