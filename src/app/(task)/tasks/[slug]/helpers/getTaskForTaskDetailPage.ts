import { cookies } from 'next/headers'
import { cache } from 'react'

import type { TaskCoreQuery } from '@codegen/schema'

import TaskCore from '@/app/(task)/tasks/[slug]/graphql/TaskCore.gql'
import { fetch } from '@/utils/api'
import { isGraphqlTaskNotFound } from '@/utils/graphqlResponse'

import { taskQueryVariables } from './taskQueryVariables'

const AUTH_COOKIE = 'auth'

/** Server-rendered task fields (everything except the client-fetched quotes list). */
export type TaskCoreRecord = NonNullable<TaskCoreQuery['task']>

export type TaskPageData = {
  task: TaskCoreRecord | null
  order: TaskCoreRecord['viewerOrder'] | null
}

export const getTaskForTaskDetailPage = cache(
  async (taskId: string): Promise<TaskPageData> => {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE)?.value ?? ''

    const json = await fetch<TaskCoreQuery>({
      query: TaskCore,
      variables: taskQueryVariables(taskId),
      authToken: token,
    })

    const notFound = isGraphqlTaskNotFound(json?.errors)
    const task = notFound ? null : (json?.data?.task ?? null)

    return {
      task,
      order: task?.viewerOrder ?? null,
    }
  },
)
