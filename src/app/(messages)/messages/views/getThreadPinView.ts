import type { TaskDetailViewName } from '@/app/(task)/tasks/[slug]/views/types'

import type { ThreadPinViewName } from './types'

/**
 * Task detail's view → the top pin under a task thread's header. Null while
 * the task loads, and for viewers who can't be in a task thread.
 */
const PIN_BY_TASK_VIEW: Record<TaskDetailViewName, ThreadPinViewName | null> = {
  loading: null,
  'owner.open.noQuotes': 'pin.status',
  'owner.open.quotes': 'pin.quotes',
  'owner.booked.beforeStart': 'pin.booking',
  'owner.booked.ready': 'pin.booking',
  'owner.booked.iMarkedDone': 'pin.booking',
  'owner.booked.theyMarkedDone': 'pin.booking',
  'owner.booked.iMarkedFailed': 'pin.booking',
  'owner.booked.theyMarkedFailed': 'pin.booking',
  'owner.booked.rescheduleByMe': 'pin.booking',
  'owner.booked.rescheduleByThem': 'pin.booking',
  'owner.booked.cancelByMe': 'pin.booking',
  'owner.booked.cancelByThem': 'pin.booking',
  'owner.conflict.iMarkedDone': 'pin.booking',
  'owner.conflict.iMarkedFailed': 'pin.booking',
  'owner.completed': 'pin.closed',
  'owner.bookingCancelled': 'pin.closed',
  'owner.bookingFailed': 'pin.closed',
  'owner.cancelled': 'pin.closed',
  'worker.booked.beforeStart': 'pin.booking',
  'worker.booked.ready': 'pin.booking',
  'worker.booked.iMarkedDone': 'pin.booking',
  'worker.booked.theyMarkedDone': 'pin.booking',
  'worker.booked.iMarkedFailed': 'pin.booking',
  'worker.booked.theyMarkedFailed': 'pin.booking',
  'worker.booked.rescheduleByMe': 'pin.booking',
  'worker.booked.rescheduleByThem': 'pin.booking',
  'worker.booked.cancelByMe': 'pin.booking',
  'worker.booked.cancelByThem': 'pin.booking',
  'worker.conflict.iMarkedDone': 'pin.booking',
  'worker.conflict.iMarkedFailed': 'pin.booking',
  'worker.completed': 'pin.closed',
  'worker.bookingCancelled': 'pin.closed',
  'worker.bookingFailed': 'pin.closed',
  'worker.open.notQuoted': 'pin.status',
  'worker.open.quoted': 'pin.myQuote',
  'worker.open.declined': 'pin.myQuote',
  'worker.awarded.declined': 'pin.myQuote',
  'worker.notSelected': 'pin.myQuote',
  'customer.open': null,
  'guest.open': null,
  'visitor.awarded': 'pin.closed',
  'visitor.cancelled': 'pin.closed',
}

export function getThreadPinView(
  view: TaskDetailViewName,
): ThreadPinViewName | null {
  return PIN_BY_TASK_VIEW[view]
}
