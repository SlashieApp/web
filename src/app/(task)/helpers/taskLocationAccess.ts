import { OrderStatus, QuoteStatus } from '@codegen/schema'

/**
 * What the viewer may see of a task's location (FE-472).
 * - `pending`: signed in and the viewer's role is not known yet. Draw nothing.
 * - `exact`: the exact pin and the address.
 * - `approximate`: the town, and a 400 m circle with no pin.
 */
export type TaskLocationAccess = 'pending' | 'exact' | 'approximate'

/**
 * Orders on which the API gives the worker the exact location
 * (apollo `LIVE_ORDER_STATUSES`). A CANCELLED or COMPLETED order does not:
 * that worker keeps it only while their quote is still ACCEPTED.
 */
const EXACT_LOCATION_ORDER_STATUSES: ReadonlySet<string> = new Set([
  OrderStatus.Active,
  OrderStatus.Rescheduling,
  OrderStatus.CancelRequested,
  OrderStatus.Conflict,
])

export type TaskLocationAccessInput = {
  /** Signed out, or the owner's "view as others see it" preview. */
  guestView: boolean
  /** The viewer's role is known (web `statusReady`; signed out: the task has loaded). */
  viewerReady: boolean
  meId?: string | null
  posterId?: string | null
  /** The viewer's own quote on this task. */
  myQuoteStatus?: string | null
  /** The viewer's own order on this task as its worker (see `workerOrderStatus`). */
  myOrderStatus?: string | null
}

/**
 * The one rule for exact versus approximate, mirroring the API
 * (`resolveTaskLocationAccess`): only the poster, a worker whose quote on the
 * task is ACCEPTED, or a worker with a live order. Never based on the task's
 * status. The map, the location row, the chip, the maps link and the poster
 * note all read this and nothing else.
 */
export function taskLocationAccess(
  input: TaskLocationAccessInput,
): TaskLocationAccess {
  if (input.guestView) return 'approximate'
  if (!input.viewerReady) return 'pending'
  if (!input.meId) return 'approximate'
  if (input.meId === input.posterId) return 'exact'
  if (input.myQuoteStatus === QuoteStatus.Accepted) return 'exact'
  if (
    input.myOrderStatus &&
    EXACT_LOCATION_ORDER_STATUSES.has(input.myOrderStatus)
  ) {
    return 'exact'
  }
  return 'approximate'
}

/**
 * The status of the viewer's order when they are its worker, else null. An
 * order on screen is not proof it is theirs, so a bare "an order exists" never
 * counts.
 */
export function workerOrderStatus(
  order: { workerUserId?: string | null; status: string } | null | undefined,
  meId: string | null | undefined,
): string | null {
  if (!order || !meId || order.workerUserId !== meId) return null
  return order.status
}
