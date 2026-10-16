import type { TaskDetailViewName } from '@/app/(task)/tasks/[slug]/views/types'

import type { ThreadPinViewName } from './types'

/**
 * Task detail's view → the card pinned under a task thread's header. Null
 * while the task loads, and for viewers who can't be in a task thread.
 */
const PIN_BY_TASK_VIEW: Record<TaskDetailViewName, ThreadPinViewName | null> = {
  loading: null,
  'owner.open.noQuotes': 'pin.status',
  'owner.open.quotes': 'pin.quotes',
  'owner.booked.beforeStart': 'pin.booked',
  'owner.booked.ready': 'pin.close',
  'owner.booked.iMarkedDone': 'pin.waiting',
  'owner.booked.theyMarkedDone': 'pin.confirm',
  'owner.booked.iMarkedFailed': 'pin.waiting',
  'owner.booked.theyMarkedFailed': 'pin.confirm',
  'owner.booked.rescheduleByMe': 'pin.waiting',
  'owner.booked.rescheduleByThem': 'pin.answer',
  'owner.booked.cancelByMe': 'pin.waiting',
  'owner.booked.cancelByThem': 'pin.answer',
  'owner.conflict.iMarkedDone': 'pin.conflict',
  'owner.conflict.iMarkedFailed': 'pin.conflict',
  'owner.completed': 'pin.done',
  'owner.bookingCancelled': 'pin.closed',
  'owner.bookingFailed': 'pin.closed',
  'owner.cancelled': 'pin.closed',
  'worker.booked.beforeStart': 'pin.booked',
  'worker.booked.ready': 'pin.close',
  'worker.booked.iMarkedDone': 'pin.waiting',
  'worker.booked.theyMarkedDone': 'pin.confirm',
  'worker.booked.iMarkedFailed': 'pin.waiting',
  'worker.booked.theyMarkedFailed': 'pin.confirm',
  'worker.booked.rescheduleByMe': 'pin.waiting',
  'worker.booked.rescheduleByThem': 'pin.answer',
  'worker.booked.cancelByMe': 'pin.waiting',
  'worker.booked.cancelByThem': 'pin.answer',
  'worker.conflict.iMarkedDone': 'pin.conflict',
  'worker.conflict.iMarkedFailed': 'pin.conflict',
  'worker.completed': 'pin.done',
  'worker.bookingCancelled': 'pin.closed',
  'worker.bookingFailed': 'pin.closed',
  'worker.open.notQuoted': 'pin.requote',
  'worker.open.quoted': 'pin.quoting',
  'worker.open.declined': 'pin.requote',
  'worker.awarded.declined': 'pin.closed',
  'worker.notSelected': 'pin.notSelected',
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
