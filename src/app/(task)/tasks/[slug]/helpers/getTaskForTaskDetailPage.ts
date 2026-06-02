import { cookies } from 'next/headers'
import { cache } from 'react'

import type { TaskQuery } from '@codegen/schema'

import Task from '@/app/(task)/tasks/[slug]/graphql/Task.gql'
import { fetch } from '@/utils/api'

import { taskQueryVariables } from './taskQueryVariables'

const AUTH_COOKIE = 'auth'

export type TaskPageData = {
  task: NonNullable<TaskQuery['task']> | null
  order: TaskQuery['order'] | null
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

    return {
      task: json?.data?.task ?? null,
      order: json?.data?.order ?? null,
    }
  },
)
