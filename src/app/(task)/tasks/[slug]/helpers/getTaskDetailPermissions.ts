import { OrderStatus, QuoteStatus } from '@codegen/schema'
import type { MeQuery } from '@codegen/schema'

import type { OrderItem } from '@/utils/orderHelpers'
import { isAcceptedQuoteStatus } from '@/utils/taskJobSchedule'

import { isWorkerSetupComplete } from '@/app/(worker)/worker/setup/helpers/workerSetupEligibility'

import {
  type MappedTaskStatus,
  isCancelledTaskStatus,
  mapTaskStatus,
} from './mapTaskStatus'
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
  isOrderWorker: boolean
  isOrderActive: boolean
  hasWorkerProfile: boolean
  /** Accepted-worker cap reached for this task. */
  atCap: boolean
  canSubmitQuote: boolean
  showQuoteForm: boolean
  /**
   * Worker viewing an OPEN task who cannot quote and has no pending quote of
   * their own (at cap, or otherwise ineligible). Drives the "task is full" hero.
   * Presentation derivation only — no new data.
   */
  showQuoteUnavailableNotice: boolean
  showOwnerQuoteList: boolean
  showAcceptDecline: boolean
  showWorkerJobBanner: boolean
  showCompleteWithCode: boolean
  showCustomerCompletionCode: boolean
  showFullAddress: boolean
  canCancelTask: boolean
  canEditTask: boolean
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

  const isOrderWorker = Boolean(me && myOrder && myOrder.workerUserId === me.id)
  const isOrderActive = myOrder?.status === OrderStatus.Active

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

  const showQuoteForm = Boolean(
    canSubmitQuote && (!myQuote || myQuote.status === QuoteStatus.Pending),
  )

  const showQuoteUnavailableNotice = Boolean(
    isOpen &&
      isAuthenticated &&
      !isOwner &&
      !showQuoteForm &&
      myQuote?.status !== QuoteStatus.Pending,
  )

  const showOwnerQuoteList = Boolean(isOwner && (isOpen || isAwarded))

  const showAcceptDecline = Boolean(isOwner && isOpen)

  const showWorkerJobBanner = Boolean(isOrderWorker && isOrderActive)

  const showCompleteWithCode = Boolean(isOrderWorker && isOrderActive)

  const showCustomerCompletionCode = Boolean(isOwner && isOrderActive)

  const showFullAddress = Boolean(isOwner || isOrderWorker)

  const canCancelTask = Boolean(isOwner && isOpen)

  const canEditTask = Boolean(isOwner && isOpen)

  return {
    isOwner,
    taskStatus,
    isOpen,
    isAwarded,
    isClosed,
    isCancelled,
    isOrderWorker,
    isOrderActive,
    hasWorkerProfile,
    atCap,
    canSubmitQuote,
    showQuoteForm,
    showQuoteUnavailableNotice,
    showOwnerQuoteList,
    showAcceptDecline,
    showWorkerJobBanner,
    showCompleteWithCode,
    showCustomerCompletionCode,
    showFullAddress,
    canCancelTask,
    canEditTask,
  }
}
