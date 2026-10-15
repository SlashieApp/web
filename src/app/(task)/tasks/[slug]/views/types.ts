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
  /** A pending reschedule or cancellation, with its answer buttons. */
  | 'request'
  /** Reschedule and Cancel booking, before the booked start. */
  | 'bookingActions'
  /** Conflict: Safety and help, Report, Ask to cancel. */
  | 'conflictActions'
  /** After marking Done or Failed: switch to the other choice. */
  | 'closeSwitch'
  /** The booking record: status, timeline, closed date. */
  | 'record'
  | 'reviews'
  /** Owner: post the task again (secondary). */
  | 'repost'

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
}
