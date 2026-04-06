/**
 * Types for task list operations in `tasks.ts`. Prefer `@codegen/schema` once
 * `bun run codegen` succeeds against the GraphQL endpoint.
 */
export type TaskOfferListItem = {
  id: string
  taskId: string
  workerUserId: string
  pricePence: number
  message?: string | null
  status: string
  createdAt: unknown
}

export type TaskListItem = {
  id: string
  title: string
  description: string
  location?: string | null
  locationLat?: number | null
  locationLng?: number | null
  status: string
  createdByUserId: string
  createdAt: unknown
  dateTime?: unknown
  category?: string | null
  priceOfferPence?: number | null
  paymentMethod?: string | null
  contactMethod?: string | null
  offers: TaskOfferListItem[]
}

export type TasksQueryData = {
  tasks: TaskListItem[]
}

export type MyTasksQueryData = {
  myTasks: TaskListItem[]
}
