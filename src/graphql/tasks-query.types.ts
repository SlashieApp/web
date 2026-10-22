import type { Price, TaskBudget, TaskDateTime } from '@codegen/schema'

/**
 * Types for task list operations. Prefer `@codegen/schema` once codegen runs.
 */
export type TaskQuoteListItem = {
  id: string
  taskId: string
  workerUserId: string
  price?: Price | null
  message?: string | null
  status: string
  createdAt: unknown
  worker?: {
    id: string
    profile?: { name?: string | null; avatarUrl?: string | null } | null
  } | null
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
  /** BE-79: open strings, 1 to 10 per task. */
  categories: string[]
  location?: TaskMapLocationFields | null
  status: string
  /** Public view count; null during cold-start. Browse `tasks` only. */
  views?: number | null
  createdAt: unknown
  completedAt?: unknown
  confirmedAt?: unknown
  datetime?: TaskDateTime | null
  budget?: TaskBudget | null
  contactMethod?: string | null
  images?: string[]
  poster?: {
    id: string
    profile?: { name?: string | null; avatarUrl?: string | null } | null
  } | null
  /**
   * Hub lists (`tasksPosted`, `quotedTasks`) select full quotes; browse `tasks`
   * selects `workerUserId` only (to mark the tasks you quoted on). Guests get [].
   */
  quotes?: TaskQuoteListItem[]
}

export type TasksQueryData = {
  tasks: TaskListItem[]
}

export type MyRequestsQueryData = {
  me: {
    tasksPosted: TaskListItem[]
  } | null
}

export type MyQuotesQueryData = {
  me: {
    worker: {
      quotedTasks: TaskListItem[]
    } | null
  } | null
}
