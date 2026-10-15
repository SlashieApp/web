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
   * Worker (not the owner) can send a quote on this OPEN task, edit their
   * pending one, or send a new one after a decline. Blocked once any quote
   * is accepted.
   */
  canSubmitQuote: boolean
  /** Viewer's own quote on this OPEN task is sent and awaiting the owner. */
  hasPendingQuote: boolean
  showOwnerQuoteList: boolean
  showAcceptDecline: boolean
  /** Either party on a live or CONFLICT order: booking status and actions. */
  showOrderActions: boolean
  showFullAddress: boolean
  canCancelTask: boolean
  canEditTask: boolean
  /** Owner on a finished job, cancelled booking, or cancelled task: post it again. */
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

  const canSubmitQuote = Boolean(
    task &&
      me &&
      isAuthenticated &&
      !isOwner &&
      isOpen &&
      hasWorkerProfile &&
      !atCap &&
      workerCanSubmitOnOpenTask(task, me),
  )

  const hasPendingQuote = Boolean(
    isOpen && !isOwner && myQuote?.status === QuoteStatus.Pending,
  )

  const showOwnerQuoteList = Boolean(isOwner && (isOpen || isAwarded))

  const showAcceptDecline = Boolean(isOwner && isOpen)

  const showOrderActions = Boolean(
    myOrder && (isOwner || isOrderWorker) && (isOrderActive || isOrderConflict),
  )

  const showFullAddress = Boolean(isOwner || isOrderWorker)

  const canCancelTask = Boolean(isOwner && isOpen)

  const canEditTask = Boolean(isOwner && isOpen)

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
    canSubmitQuote,
    hasPendingQuote,
    showOwnerQuoteList,
    showAcceptDecline,
    showOrderActions,
    showFullAddress,
    canCancelTask,
    canEditTask,
    canRepostTask,
  }
}
