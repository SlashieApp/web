import { cookies } from 'next/headers'
import { cache } from 'react'

import type { TaskQuery } from '@codegen/schema'

import Task from '@/app/(task)/graphql/Task.gql'
import { fetch } from '@/utils/api'

const AUTH_COOKIE = 'auth'

export const getTaskForTaskDetailPage = cache(async (taskId: string) => {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value ?? ''
  const json = await fetch<TaskQuery>({
    query: Task,
    variables: { id: taskId },
    authToken: token,
  })
  return json?.data?.task ?? null
})
