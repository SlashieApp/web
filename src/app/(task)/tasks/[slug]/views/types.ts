import type { TaskStatusValue } from '../components/ui/TaskStatusPill'
import type bag from '../i11n.json'

/**
 * Every situation task detail can be in, from the viewer's side. Worked out
 * in one place (`getTaskDetailView`); each name has one config file here.
 */
export type TaskDetailViewName =
  | 'loading'
  // Owner
  | 'owner.open.noQuotes'
  | 'owner.open.quotes'
  | 'owner.booked.beforeStart'
  | 'owner.booked.ready'
  | 'owner.booked.iMarkedDone'
  | 'owner.booked.theyMarkedDone'
  | 'owner.booked.iMarkedFailed'
  | 'owner.booked.theyMarkedFailed'
  | 'owner.booked.rescheduleByMe'
  | 'owner.booked.rescheduleByThem'
  | 'owner.booked.cancelByMe'
  | 'owner.booked.cancelByThem'
  | 'owner.conflict.iMarkedDone'
  | 'owner.conflict.iMarkedFailed'
  | 'owner.completed'
  | 'owner.bookingCancelled'
  | 'owner.bookingFailed'
  | 'owner.cancelled'
  // Booked worker
  | 'worker.booked.beforeStart'
  | 'worker.booked.ready'
  | 'worker.booked.iMarkedDone'
  | 'worker.booked.theyMarkedDone'
  | 'worker.booked.iMarkedFailed'
  | 'worker.booked.theyMarkedFailed'
  | 'worker.booked.rescheduleByMe'
  | 'worker.booked.rescheduleByThem'
  | 'worker.booked.cancelByMe'
  | 'worker.booked.cancelByThem'
  | 'worker.conflict.iMarkedDone'
  | 'worker.conflict.iMarkedFailed'
  | 'worker.completed'
  | 'worker.bookingCancelled'
  | 'worker.bookingFailed'
  // Worker not on the booking
  | 'worker.open.notQuoted'
  | 'worker.open.quoted'
  | 'worker.open.declined'
  | 'worker.awarded.declined'
  | 'worker.notSelected'
  // Everyone else
  | 'customer.open'
  | 'guest.open'
  | 'visitor.awarded'
  | 'visitor.cancelled'

/** Facts the summary can show, in the order a view lists them. */
export type TaskSummaryFact =
  /** Budget amount, type and payment method. */
  | 'budget'
  /** Payment method only (the amount is already in the headline). */
  | 'payment'
  /** The viewer's pending quote against the budget, with their times. */
  | 'myQuote'
  /** The task's preferred time, with a countdown when close. */
  | 'preferredTime'
  /** The booked slot, with a countdown before it starts. */
  | 'bookedTime'
  /** "Near {town}" with the info icon, or the exact address for the parties. */
  | 'location'
  | 'categories'
  | 'postedBy'
  /** Your worker / Your customer: name, phone, email. */
  | 'otherParty'
  /** Agreed total and payment method. */
  | 'agreedPrice'
  | 'description'
  /** Task photos as thumbnails, under the description. */
  | 'photos'
  /** A pending reschedule or cancellation; the other side's answer buttons. */
  | 'request'
  /** The booking record: timeline and closed date. */
  | 'record'
  | 'reviews'

/** Booking actions the view adds to the Help & actions card. */
export type TaskDetailAction =
  | 'reschedule'
  | 'cancelBooking'
  /** Withdraw the viewer's own pending reschedule or cancellation. */
  | 'withdrawRequest'
  /** Conflict: ask the other side to cancel. */
  | 'askToCancel'
  /** Conflict: report the other person. */
  | 'reportOtherParty'
  /** After marking Done: "Something went wrong?" (mark it Failed). */
  | 'switchToFailed'
  /** After marking Failed: "Changed your mind? Mark it Done". */
  | 'switchToDone'

/** The one main button for the view (the page CTA). */
export type TaskDetailPrimaryAction =
  | 'preview'
  | 'sendQuote'
  | 'editQuote'
  | 'becomeWorker'
  | 'signInToQuote'
  | 'message'
  | 'markDone'
  /** Review, then Get receipt once the viewer has reviewed. */
  | 'review'
  | 'repost'
  /** Reopen a cancelled task for quotes, after a confirm (BE-108). */
  | 'reopen'
  | 'browseTasks'

export type TaskSummaryCopyKey = keyof (typeof bag)['en']['summary']

/**
 * A headline or sub-line: one copy key, or a plain choice resolved by
 * `resolveSummaryCopy` (live quote count, or the budget type).
 */
export type TaskSummaryCopy =
  | TaskSummaryCopyKey
  | {
      byCount: {
        zero: TaskSummaryCopyKey
        one: TaskSummaryCopyKey
        other: TaskSummaryCopyKey
      }
    }
  | {
      byBudget: {
        fixed: TaskSummaryCopyKey
        hourly: TaskSummaryCopyKey
        daily: TaskSummaryCopyKey
        none: TaskSummaryCopyKey
      }
    }

/** What one viewer sees in one situation. */
export type TaskDetailViewConfig = {
  /** Null while loading (a skeleton). */
  pill: TaskStatusValue | null
  headline: TaskSummaryCopy | null
  subline: TaskSummaryCopy | null
  facts: readonly TaskSummaryFact[]
  primaryAction: TaskDetailPrimaryAction | null
  /** Booking actions in Help & actions, before the task-level ones. */
  actions?: readonly TaskDetailAction[]
}

/**
 * The notice card above the summary while a suspension freezes the task or
 * the booking (BE-108). Worked out in one place (`getTaskNoticeView`); the
 * same names as the Expo app.
 */
export type TaskNoticeViewName =
  /** Owner of a task Slashie suspended: contact support, no reopen. */
  | 'notice.owner.taskSuspended'
  /** Customer whose booked worker is suspended, and the API lets them reopen. */
  | 'notice.owner.workerSuspended'
  /** Customer whose booked worker is suspended, and reopening isn't open to them. */
  | 'notice.owner.workerSuspendedOnHold'
  /** Booked worker whose customer is suspended: a notice only. */
  | 'notice.worker.customerSuspended'
  /** Booked or quoting worker on a task Slashie suspended. */
  | 'notice.worker.taskSuspended'
  /** Quoting worker (no booking) whose poster is suspended. */
  | 'notice.worker.posterSuspended'

export type TaskNoticeCopyKey = keyof (typeof bag)['en']['notice']

export type TaskNoticeConfig = {
  title: TaskNoticeCopyKey
  body: TaskNoticeCopyKey
  /** The one action under the body: mail support, or reopen the task (after a confirm). */
  action: 'contactSupport' | 'reopen' | null
}
