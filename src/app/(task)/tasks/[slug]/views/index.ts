import { customerOpen } from './customer.open'
import { guestOpen } from './guest.open'
import { loading } from './loading'
import { noticeOwnerTaskSuspended } from './notice.owner.taskSuspended'
import { noticeOwnerWorkerSuspended } from './notice.owner.workerSuspended'
import { noticeOwnerWorkerSuspendedOnHold } from './notice.owner.workerSuspendedOnHold'
import { noticeWorkerCustomerSuspended } from './notice.worker.customerSuspended'
import { noticeWorkerPosterSuspended } from './notice.worker.posterSuspended'
import { noticeWorkerTaskSuspended } from './notice.worker.taskSuspended'
import { ownerBookedBeforeStart } from './owner.booked.beforeStart'
import { ownerBookedCancelByMe } from './owner.booked.cancelByMe'
import { ownerBookedCancelByThem } from './owner.booked.cancelByThem'
import { ownerBookedIMarkedDone } from './owner.booked.iMarkedDone'
import { ownerBookedIMarkedFailed } from './owner.booked.iMarkedFailed'
import { ownerBookedReady } from './owner.booked.ready'
import { ownerBookedRescheduleByMe } from './owner.booked.rescheduleByMe'
import { ownerBookedRescheduleByThem } from './owner.booked.rescheduleByThem'
import { ownerBookedTheyMarkedDone } from './owner.booked.theyMarkedDone'
import { ownerBookedTheyMarkedFailed } from './owner.booked.theyMarkedFailed'
import { ownerBookingCancelled } from './owner.bookingCancelled'
import { ownerBookingFailed } from './owner.bookingFailed'
import { ownerCancelled } from './owner.cancelled'
import { ownerCompleted } from './owner.completed'
import { ownerConflictIMarkedDone } from './owner.conflict.iMarkedDone'
import { ownerConflictIMarkedFailed } from './owner.conflict.iMarkedFailed'
import { ownerOpenNoQuotes } from './owner.open.noQuotes'
import { ownerOpenQuotes } from './owner.open.quotes'
import type {
  TaskDetailViewConfig,
  TaskDetailViewName,
  TaskNoticeConfig,
  TaskNoticeViewName,
} from './types'
import { visitorAwarded } from './visitor.awarded'
import { visitorCancelled } from './visitor.cancelled'
import { visitorCompleted } from './visitor.completed'
import { workerBookedBeforeStart } from './worker.booked.beforeStart'
import { workerBookedCancelByMe } from './worker.booked.cancelByMe'
import { workerBookedCancelByThem } from './worker.booked.cancelByThem'
import { workerBookedIMarkedDone } from './worker.booked.iMarkedDone'
import { workerBookedIMarkedFailed } from './worker.booked.iMarkedFailed'
import { workerBookedReady } from './worker.booked.ready'
import { workerBookedRescheduleByMe } from './worker.booked.rescheduleByMe'
import { workerBookedRescheduleByThem } from './worker.booked.rescheduleByThem'
import { workerBookedTheyMarkedDone } from './worker.booked.theyMarkedDone'
import { workerBookedTheyMarkedFailed } from './worker.booked.theyMarkedFailed'
import { workerBookedByOther } from './worker.bookedByOther'
import { workerBookingCancelled } from './worker.bookingCancelled'
import { workerBookingFailed } from './worker.bookingFailed'
import { workerCompleted } from './worker.completed'
import { workerCompletedByOther } from './worker.completedByOther'
import { workerConflictIMarkedDone } from './worker.conflict.iMarkedDone'
import { workerConflictIMarkedFailed } from './worker.conflict.iMarkedFailed'
import { workerOpenClosed } from './worker.open.closed'
import { workerOpenNotQuoted } from './worker.open.notQuoted'
import { workerOpenQuoted } from './worker.open.quoted'
import { workerOtherBookingEnded } from './worker.otherBookingEnded'

/** Every view's config, by name. `getTaskDetailView` picks the name. */
export const TASK_DETAIL_VIEWS: Record<
  TaskDetailViewName,
  TaskDetailViewConfig
> = {
  loading: loading,
  'owner.open.noQuotes': ownerOpenNoQuotes,
  'owner.open.quotes': ownerOpenQuotes,
  'owner.booked.beforeStart': ownerBookedBeforeStart,
  'owner.booked.ready': ownerBookedReady,
  'owner.booked.iMarkedDone': ownerBookedIMarkedDone,
  'owner.booked.theyMarkedDone': ownerBookedTheyMarkedDone,
  'owner.booked.iMarkedFailed': ownerBookedIMarkedFailed,
  'owner.booked.theyMarkedFailed': ownerBookedTheyMarkedFailed,
  'owner.booked.rescheduleByMe': ownerBookedRescheduleByMe,
  'owner.booked.rescheduleByThem': ownerBookedRescheduleByThem,
  'owner.booked.cancelByMe': ownerBookedCancelByMe,
  'owner.booked.cancelByThem': ownerBookedCancelByThem,
  'owner.conflict.iMarkedDone': ownerConflictIMarkedDone,
  'owner.conflict.iMarkedFailed': ownerConflictIMarkedFailed,
  'owner.completed': ownerCompleted,
  'owner.bookingCancelled': ownerBookingCancelled,
  'owner.bookingFailed': ownerBookingFailed,
  'owner.cancelled': ownerCancelled,
  'worker.booked.beforeStart': workerBookedBeforeStart,
  'worker.booked.ready': workerBookedReady,
  'worker.booked.iMarkedDone': workerBookedIMarkedDone,
  'worker.booked.theyMarkedDone': workerBookedTheyMarkedDone,
  'worker.booked.iMarkedFailed': workerBookedIMarkedFailed,
  'worker.booked.theyMarkedFailed': workerBookedTheyMarkedFailed,
  'worker.booked.rescheduleByMe': workerBookedRescheduleByMe,
  'worker.booked.rescheduleByThem': workerBookedRescheduleByThem,
  'worker.booked.cancelByMe': workerBookedCancelByMe,
  'worker.booked.cancelByThem': workerBookedCancelByThem,
  'worker.conflict.iMarkedDone': workerConflictIMarkedDone,
  'worker.conflict.iMarkedFailed': workerConflictIMarkedFailed,
  'worker.completed': workerCompleted,
  'worker.bookingCancelled': workerBookingCancelled,
  'worker.bookingFailed': workerBookingFailed,
  'worker.open.notQuoted': workerOpenNotQuoted,
  'worker.open.quoted': workerOpenQuoted,
  'worker.open.closed': workerOpenClosed,
  'worker.bookedByOther': workerBookedByOther,
  'worker.completedByOther': workerCompletedByOther,
  'worker.otherBookingEnded': workerOtherBookingEnded,
  'customer.open': customerOpen,
  'guest.open': guestOpen,
  'visitor.awarded': visitorAwarded,
  'visitor.completed': visitorCompleted,
  'visitor.cancelled': visitorCancelled,
}

/** Every suspension notice's config, by name. `getTaskNoticeView` picks the name. */
export const TASK_NOTICE_VIEWS: Record<TaskNoticeViewName, TaskNoticeConfig> = {
  'notice.owner.taskSuspended': noticeOwnerTaskSuspended,
  'notice.owner.workerSuspended': noticeOwnerWorkerSuspended,
  'notice.owner.workerSuspendedOnHold': noticeOwnerWorkerSuspendedOnHold,
  'notice.worker.customerSuspended': noticeWorkerCustomerSuspended,
  'notice.worker.taskSuspended': noticeWorkerTaskSuspended,
  'notice.worker.posterSuspended': noticeWorkerPosterSuspended,
}

export { getTaskDetailView, liveQuoteCount } from './getTaskDetailView'
export { getTaskNoticeView, taskNoticePersonName } from './getTaskNoticeView'
export type {
  TaskNoticeCounterparty,
  TaskNoticeInput,
  TaskNoticeSuspension,
} from './getTaskNoticeView'
export type {
  TaskDetailViewOrder,
  TaskDetailViewTask,
  TaskDetailViewer,
} from './getTaskDetailView'
export type {
  TaskDetailAction,
  TaskDetailPrimaryAction,
  TaskDetailViewConfig,
  TaskDetailViewName,
  TaskNoticeConfig,
  TaskNoticeCopyKey,
  TaskNoticeViewName,
  TaskSummaryCopy,
  TaskSummaryCopyKey,
  TaskSummaryFact,
} from './types'
