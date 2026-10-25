import {
  OrderCloseKind,
  OrderRequestKind,
  OrderStatus,
  QuoteStatus,
  TaskBookingStatus,
} from '@codegen/schema'

import type { TaskDetailViewName } from './types'

export type TaskDetailViewTask = {
  status: string
  /**
   * `Task.bookingStatus` (BE-113): where the booking stands, the same for
   * every viewer; it never says who is booked.
   */
  bookingStatus: string
  posterId: string | null
  /**
   * `Task.quotes`: latest quote per worker (EXPIRED / WITHDRAWN omitted).
   * `workerUserId` is null on other workers' quotes for non-owners (BE-105).
   */
  quotes: readonly { workerUserId?: string | null; status: string }[]
}

export type TaskDetailViewOrder = {
  status: string
  workerUserId: string
  bookedStart: unknown
  myCloseAction?: { kind: string } | null
  counterpartyCloseAction?: { kind: string } | null
  pendingRequest?: { kind: string; requestedByUserId: string } | null
}

/** Null for a signed-out guest. */
export type TaskDetailViewer = {
  userId: string
  hasWorkerProfile: boolean
} | null

type Party = 'owner' | 'worker'

function bookingView(
  party: Party,
  order: TaskDetailViewOrder,
  viewerId: string,
  now: Date,
): TaskDetailViewName {
  const mine = order.myCloseAction?.kind ?? null
  const theirs = order.counterpartyCloseAction?.kind ?? null
  const request = order.pendingRequest

  if (order.status === OrderStatus.Completed) return `${party}.completed`
  if (order.status === OrderStatus.Cancelled) {
    // Both marked Failed: the booking didn't go ahead (there's no FAILED status).
    return mine === OrderCloseKind.Failed && theirs === OrderCloseKind.Failed
      ? `${party}.bookingFailed`
      : `${party}.bookingCancelled`
  }

  // A request waits on one side (a cancel can also be asked in CONFLICT).
  if (request) {
    const byMe = request.requestedByUserId === viewerId
    if (request.kind === OrderRequestKind.Reschedule) {
      return byMe
        ? `${party}.booked.rescheduleByMe`
        : `${party}.booked.rescheduleByThem`
    }
    return byMe ? `${party}.booked.cancelByMe` : `${party}.booked.cancelByThem`
  }

  if (order.status === OrderStatus.Conflict) {
    return mine === OrderCloseKind.Done
      ? `${party}.conflict.iMarkedDone`
      : `${party}.conflict.iMarkedFailed`
  }

  if (mine === OrderCloseKind.Done) return `${party}.booked.iMarkedDone`
  if (mine === OrderCloseKind.Failed) return `${party}.booked.iMarkedFailed`
  if (theirs === OrderCloseKind.Done) return `${party}.booked.theyMarkedDone`
  if (theirs === OrderCloseKind.Failed)
    return `${party}.booked.theyMarkedFailed`

  const start = new Date(String(order.bookedStart)).getTime()
  return Number.isFinite(start) && start <= now.getTime()
    ? `${party}.booked.ready`
    : `${party}.booked.beforeStart`
}

/**
 * A booked task, for anyone who isn't on the booking. A worker whose quote
 * is still PENDING (it stays PENDING while someone else is booked, BE-113)
 * gets the status as "Booked by someone else", "Task completed" or, once the
 * booking ended and the owner hasn't reopened the task (`bookingStatus`
 * NONE on an AWARDED task, BE-116), "Booking cancelled"; everyone else gets
 * the plain one. All read `Task.bookingStatus`, never who.
 */
function bookedView(
  bookingStatus: string,
  hasPendingQuote: boolean,
): TaskDetailViewName {
  if (bookingStatus === TaskBookingStatus.Completed) {
    return hasPendingQuote ? 'worker.completedByOther' : 'visitor.completed'
  }
  if (!hasPendingQuote) return 'visitor.awarded'
  if (bookingStatus === TaskBookingStatus.Booked) return 'worker.bookedByOther'
  return bookingStatus === TaskBookingStatus.None
    ? 'worker.otherBookingEnded'
    : 'visitor.awarded'
}

/**
 * The one place that decides what this viewer sees. `task` is null until
 * the viewer-scoped task (and its order) has loaded.
 *
 * Only a worker's own quote can change their view, and only while it is
 * PENDING or (on an open task) CLOSED. A WITHDRAWN quote, or a status this
 * build doesn't know, reads like no quote: they can quote again while the
 * task is open and see the plain booked summary once it isn't.
 */
export function getTaskDetailView(
  task: TaskDetailViewTask | null,
  order: TaskDetailViewOrder | null,
  viewer: TaskDetailViewer,
  now: Date = new Date(),
): TaskDetailViewName {
  if (!task) return 'loading'

  const status = task.status.toUpperCase()
  const isOwner = Boolean(viewer && viewer.userId === task.posterId)

  if (status === 'CANCELLED') {
    return isOwner ? 'owner.cancelled' : 'visitor.cancelled'
  }

  if (viewer && order) {
    if (isOwner) return bookingView('owner', order, viewer.userId, now)
    if (order.workerUserId === viewer.userId) {
      return bookingView('worker', order, viewer.userId, now)
    }
  }

  if (isOwner) {
    if (status === 'AWARDED') return bookedView(task.bookingStatus, false)
    const live = task.quotes.filter((q) => q.status === QuoteStatus.Pending)
    return live.length > 0 ? 'owner.open.quotes' : 'owner.open.noQuotes'
  }

  // The API sends a non-owner their own quote only, once the task isn't open.
  const myQuote = viewer
    ? task.quotes.find((q) => q.workerUserId === viewer.userId)
    : undefined

  if (status === 'AWARDED') {
    return bookedView(
      task.bookingStatus,
      myQuote?.status === QuoteStatus.Pending,
    )
  }

  // OPEN (DRAFT reads as OPEN for its owner).
  if (!viewer) return 'guest.open'
  if (!viewer.hasWorkerProfile) return 'customer.open'
  if (myQuote?.status === QuoteStatus.Pending) return 'worker.open.quoted'
  if (myQuote?.status === QuoteStatus.Closed) return 'worker.open.closed'
  return 'worker.open.notQuoted'
}

/** Live (PENDING) quotes: what headlines count. */
export function liveQuoteCount(quotes: readonly { status: string }[]): number {
  return quotes.filter((q) => q.status === QuoteStatus.Pending).length
}
