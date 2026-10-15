import { normHubStatus } from '@/app/(task)/tasks/helpers/myTasksHub'

/** The only successful terminal order status (mutual Done or 7-day auto-Done). */
export const ORDER_STATUS_COMPLETED = 'COMPLETED'

export function isOrderCompletedStatus(
  status: string | null | undefined,
): boolean {
  if (!status) return false
  return normHubStatus(status) === ORDER_STATUS_COMPLETED
}

/**
 * Completed chrome on task detail: the viewer's order is COMPLETED. A
 * finished job keeps its task AWARDED, so only the order decides. A
 * cancelled task stays on the cancelled chrome.
 */
export function isTaskDetailJobCompleted(input: {
  taskStatus: string | null | undefined
  orderStatus: string | null | undefined
}): boolean {
  if (normHubStatus(input.taskStatus ?? '') === 'CANCELLED') return false
  return isOrderCompletedStatus(input.orderStatus)
}
