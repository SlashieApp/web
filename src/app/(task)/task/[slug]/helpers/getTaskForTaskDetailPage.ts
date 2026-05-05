import { cookies } from 'next/headers'
import { cache } from 'react'

import type { TaskQuery } from '@codegen/schema'

import { TASK_QUERY } from '@/graphql/tasks'
import { fetch } from '@/utils/api'

const AUTH_COOKIE = 'auth'

export const getTaskForTaskDetailPage = cache(async (taskId: string) => {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value ?? ''
  const json = await fetch<TaskQuery>({
    query: TASK_QUERY,
    variables: { id: taskId },
    authToken: token,
  })
  return json?.data?.task ?? null
})
