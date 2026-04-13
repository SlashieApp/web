import type { Price, TaskBudget, TaskDateTime } from '@codegen/schema'

/**
 * Types for task list operations in `tasks.ts`. Prefer `@codegen/schema` once
 * codegen succeeds against the GraphQL endpoint.
 */
export type TaskQuoteListItem = {
  id: string
  taskId: string
  workerUserId: string
  price?: Price | null
  message?: string | null
  status: string
  createdAt: unknown
}

export type TaskMapLocationFields = {
  lat?: number | null
  lng?: number | null
  name?: string | null
  address?: string | null
}

export type TaskListItem = {
  id: string
  title: string
  description: string
  location?: TaskMapLocationFields | null
  status: string
  createdAt: unknown
  datetime?: TaskDateTime | null
  budget?: TaskBudget | null
  contactMethod?: string | null
  images?: string[]
  poster?: { id: string } | null
  /**
   * Only present when the operation selects `quotes` (e.g. `myTasks`).
   * Public `tasks` browse does not fetch quotes.
   */
  quotes?: TaskQuoteListItem[]
}

export type TasksQueryData = {
  tasks: TaskListItem[]
}

export type MyTasksQueryData = {
  myTasks: TaskListItem[]
}
