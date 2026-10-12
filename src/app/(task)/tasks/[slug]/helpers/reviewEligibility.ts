import { isOrderCompletedStatus } from './taskDetailCompleted'

/**
 * Who may open `/tasks/[id]/review`.
 *
 * The API allows either party on an order whose status is `COMPLETED`
 * (`customerUserId` or `workerUserId`). The task poster is the customer
 * when those ids match; a missing poster still counts when the order
 * names them as the customer.
 *
 * Only `COMPLETED` (mutual Done or 7-day auto-Done) unlocks reviews; a
 * one-sided Done, CONFLICT, or CANCELLED stays locked.
 */
export function canReviewCompletedOrder(input: {
  userId: string | null | undefined
  posterId?: string | null
  order: {
    status: string
    customerUserId?: string | null
    workerUserId?: string | null
  } | null
  taskCancelled: boolean
}): boolean {
  const userId = input.userId
  const order = input.order
  if (!userId || input.taskCancelled || !order) return false
  if (!isOrderCompletedStatus(order.status)) return false
  return (
    order.customerUserId === userId ||
    order.workerUserId === userId ||
    input.posterId === userId
  )
}
