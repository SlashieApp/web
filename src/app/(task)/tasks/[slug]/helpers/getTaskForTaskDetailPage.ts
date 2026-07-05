import { cache } from 'react'

import type { TaskCoreQuery } from '@codegen/schema'

import TaskCore from '@/app/(task)/tasks/[slug]/graphql/TaskCore.gql'
import { fetch } from '@/utils/api'
import { isGraphqlTaskNotFound } from '@/utils/graphqlResponse'

import { taskQueryVariables } from './taskQueryVariables'

/** Server-rendered PUBLIC task meta (see TaskCore.gql). */
export type TaskCoreRecord = NonNullable<TaskCoreQuery['task']>

export type TaskPageData = {
  task: TaskCoreRecord | null
}

/**
 * Public task meta for SSR. Deliberately auth-free: no cookies() and a
 * minimal field selection, so the API responds fast and the same payload
 * serves every viewer. Viewer-scoped data (orders, timeline, contact) is
 * fetched client-side by TaskDetailProvider where the response also confirms
 * the viewer's state.
 */
export const getTaskForTaskDetailPage = cache(
  async (taskId: string): Promise<TaskPageData> => {
    const json = await fetch<TaskCoreQuery>({
      query: TaskCore,
      variables: taskQueryVariables(taskId),
    })

    const notFound = isGraphqlTaskNotFound(json?.errors)
    return { task: notFound ? null : (json?.data?.task ?? null) }
  },
)
