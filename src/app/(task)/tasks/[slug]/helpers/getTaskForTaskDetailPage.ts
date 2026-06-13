import { cookies } from 'next/headers'
import { cache } from 'react'

import type { TaskQuery } from '@codegen/schema'

import Task from '@/app/(task)/tasks/[slug]/graphql/Task.gql'
import { fetch } from '@/utils/api'
import { isGraphqlTaskNotFound } from '@/utils/graphqlResponse'

import { taskQueryVariables } from './taskQueryVariables'

const AUTH_COOKIE = 'auth'

export type TaskPageData = {
  task: NonNullable<TaskQuery['task']> | null
  order: NonNullable<TaskQuery['task']>['viewerOrder'] | null
}

export const getTaskForTaskDetailPage = cache(
  async (taskId: string): Promise<TaskPageData> => {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE)?.value ?? ''

    const json = await fetch<TaskQuery>({
      query: Task,
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
