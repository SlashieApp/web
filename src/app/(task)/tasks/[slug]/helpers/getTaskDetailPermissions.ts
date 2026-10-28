import { OrderStatus, QuoteStatus } from '@codegen/schema'
import type { MeQuery } from '@codegen/schema'

import { type OrderItem, isOrderLive } from '@/utils/orderHelpers'
import { isAcceptedQuoteStatus } from '@/utils/taskJobSchedule'

import { isWorkerSetupComplete } from '@/app/(stepflow)/worker/setup/helpers/workerSetupEligibility'

import {
  type MappedTaskStatus,
  isCancelledTaskStatus,
  mapTaskStatus,
} from './mapTaskStatus'
import { isTaskDetailJobCompleted } from './taskDetailCompleted'
import type { TaskDetailRecord } from './taskDetailUtils'

export type TaskDetailPermissionsInput = {
  task: TaskDetailRecord | null
  myOrder: OrderItem | null
  me: MeQuery['me'] | null
  myQuote: TaskDetailRecord['quotes'][number] | null
  isAuthenticated: boolean
  /** When true, accepted-worker cap is reached (optional override for tests). */
  atCap?: boolean
}

export type TaskDetailPermissions = {
  isOwner: boolean
  taskStatus: MappedTaskStatus
  isOpen: boolean
  isAwarded: boolean
  isClosed: boolean
  /** Raw status is a cancellation (mapTaskStatus collapses this into CLOSED). */
  isCancelled: boolean
  /**
   * Job reads as completed: order `COMPLETED` (and the hub's other done
   * order statuses) or a hub terminal task status other than cancelled.
   */
  isJobCompleted: boolean
  isOrderWorker: boolean
  /**
   * The viewer's order is booked and still on: ACTIVE, or waiting on a
   * reschedule or cancellation request. Not CONFLICT or terminal.
   */
  isOrderActive: boolean
  /** The viewer's order is CONFLICT (one Done, one Failed). */
  isOrderConflict: boolean
  hasWorkerProfile: boolean
  /** Accepted-worker cap reached for this task. */
  atCap: boolean
  /**
   * The task is suspended (`Task.suspension`, BE-108): by Slashie, or with
   * its poster's account. Nothing on it can change (`TASK_SUSPENDED`).
   */
  isSuspended: boolean
  /**
   * The viewer's task or booking is frozen: the task is suspended, or the
   * other party on the viewer's booking is (`COUNTERPARTY_SUSPENDED`).
   */
  isFrozen: boolean
  /**
   * The owner can reopen the task for quotes (`reopenTask`): the API's own
   * answer (`Task.canReopen`, BE-113). That is a cancelled task, a booking
   * that was cancelled (the task stays AWARDED), or a live booking whose
   * worker is suspended; never a suspended task or a completed booking.
   */
  canReopen: boolean
  /**
   * Worker (not the owner) can send a quote on this OPEN task, edit their
   * pending one, or send a new one after withdrawing. Blocked once any quote
   * is accepted, and while the task is suspended.
   */
  canSubmitQuote: boolean
  /**
   * Viewer's own quote on this OPEN task is sent and awaiting the owner: it
   * can be edited. Once someone else is booked it stays PENDING (BE-113) but
   * can't be edited, so this is false then.
   */
  hasPendingQuote: boolean
  /**
   * Viewer's own quote is still PENDING, whatever the task is doing (it
   * stays PENDING while someone else is booked, BE-113): it can be
   * withdrawn. Not on a suspended task.
   */
  canWithdrawQuote: boolean
  showOwnerQuoteList: boolean
  /**
   * Owner on an OPEN task that isn't suspended: accept a pending quote. The
   * other quotes stay PENDING once someone is booked (BE-113), but only an
   * open task can take one.
   */
  canAcceptQuote: boolean
  /**
   * Either party on a live or CONFLICT order that isn't frozen: booking
   * status and actions.
   */
  showOrderActions: boolean
  canCancelTask: boolean
  canEditTask: boolean
  /**
   * Owner on a finished job, cancelled booking, or cancelled task: post it
   * again (a new task, so a suspension doesn't stop it).
   */
  canRepostTask: boolean
}

function countAcceptedQuotes(task: TaskDetailRecord): number {
  return task.quotes.filter((q) => isAcceptedQuoteStatus(q.status)).length
}

function isAtAcceptedWorkerCap(task: TaskDetailRecord): boolean {
  // The per-task accepted-worker cap was removed from the API; default to the
  // single-worker model - a task is "full" once any quote is accepted.
  return countAcceptedQuotes(task) >= 1
}

function workerCanSubmitOnOpenTask(
  task: TaskDetailRecord,
  me: NonNullable<MeQuery['me']>,
): boolean {
  const mine = task.quotes.find((q) => q.workerUserId === me.id)
  if (mine && isAcceptedQuoteStatus(mine.status)) return false
  if (task.quotes.some((q) => isAcceptedQuoteStatus(q.status))) return false
  return true
}

export function getTaskDetailPermissions(
  input: TaskDetailPermissionsInput,
): TaskDetailPermissions {
  const { task, myOrder, me, myQuote, isAuthenticated } = input

  const isOwner = Boolean(me && task?.poster?.id && me.id === task.poster.id)

  const taskStatus = task ? mapTaskStatus(task.status) : 'OPEN'
  const isOpen = taskStatus === 'OPEN'
  const isAwarded = taskStatus === 'AWARDED'
  const isClosed = taskStatus === 'CLOSED'
  const isCancelled = isCancelledTaskStatus(task?.status)
  const isJobCompleted = Boolean(
    task &&
      isTaskDetailJobCompleted({
        taskStatus: task.status,
        orderStatus: myOrder?.status ?? null,
      }),
  )

  const isOrderWorker = Boolean(me && myOrder && myOrder.workerUserId === me.id)
  const isOrderActive = Boolean(myOrder && isOrderLive(myOrder.status))
  const isOrderConflict = myOrder?.status === OrderStatus.Conflict

  const hasWorkerProfile = isWorkerSetupComplete(me)

  const atCap = input.atCap ?? (task ? isAtAcceptedWorkerCap(task) : false)

  const isSuspended = Boolean(task?.suspension)
  const isFrozen = isSuspended || Boolean(myOrder?.counterpartySuspension)

  // The API says when `reopenTask` would work. `isOwner` only guards against
  // an owner's answer cached for someone else.
  const canReopen = Boolean(isOwner && task?.canReopen)

  const canSubmitQuote = Boolean(
    task &&
      me &&
      isAuthenticated &&
      !isOwner &&
      isOpen &&
      !isSuspended &&
      hasWorkerProfile &&
      !atCap &&
      workerCanSubmitOnOpenTask(task, me),
  )

  const hasPendingQuote = Boolean(
    isOpen && !isOwner && myQuote?.status === QuoteStatus.Pending,
  )

  const canWithdrawQuote = Boolean(
    !isOwner && !isSuspended && myQuote?.status === QuoteStatus.Pending,
  )

  const showOwnerQuoteList = Boolean(isOwner && (isOpen || isAwarded))

  const canAcceptQuote = Boolean(isOwner && isOpen && !isSuspended)

  const showOrderActions = Boolean(
    myOrder &&
      (isOwner || isOrderWorker) &&
      (isOrderActive || isOrderConflict) &&
      !isFrozen,
  )

  const canCancelTask = Boolean(isOwner && isOpen && !isSuspended)

  const canEditTask = Boolean(isOwner && isOpen && !isSuspended)

  const canRepostTask = Boolean(
    isOwner &&
      (isCancelled ||
        isJobCompleted ||
        myOrder?.status === OrderStatus.Cancelled),
  )

  return {
    isOwner,
    taskStatus,
    isOpen,
    isAwarded,
    isClosed,
    isCancelled,
    isJobCompleted,
    isOrderWorker,
    isOrderActive,
    isOrderConflict,
    hasWorkerProfile,
    atCap,
    isSuspended,
    isFrozen,
    canReopen,
    canSubmitQuote,
    hasPendingQuote,
    canWithdrawQuote,
    showOwnerQuoteList,
    canAcceptQuote,
    showOrderActions,
    canCancelTask,
    canEditTask,
    canRepostTask,
  }
}
