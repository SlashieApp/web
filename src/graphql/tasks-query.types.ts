import type { TaskCategory } from '@codegen/schema'

/**
 * Types for task list operations in `tasks.ts`. Prefer `@codegen/schema` once
 * `bun run codegen` succeeds against the GraphQL endpoint.
 */
export type TaskQuoteListItem = {
  id: string
  taskId: string
  workerUserId: string
  pricePence: number
  message?: string | null
  status: string
  createdAt: unknown
}

export type TaskMapLocationFields = {
  lat?: number | null
  lng?: number | null
  name?: string | null
}

export type TaskListItem = {
  id: string
  title: string
  description: string
  address?: string | null
  locationName?: string | null
  location?: TaskMapLocationFields | null
  locationLat?: number | null
  locationLng?: number | null
  status: string
  /** Present for poster-owned rows; omitted/redacted on public `tasks` list hits. */
  createdByUserId?: string | null
  createdAt: unknown
  dateTime?: unknown
  category?: TaskCategory | null
  priceQuotePence?: number | null
  paymentMethod?: string | null
  contactMethod?: string | null
  images?: string[] | null
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
