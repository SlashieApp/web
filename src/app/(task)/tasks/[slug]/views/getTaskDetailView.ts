import {
  OrderCloseKind,
  OrderRequestKind,
  OrderStatus,
  QuoteStatus,
} from '@codegen/schema'

import type { TaskDetailViewName } from './types'

export type TaskDetailViewTask = {
  status: string
  posterId: string | null
  /** `Task.quotes`: latest quote per worker (EXPIRED / WITHDRAWN omitted). */
  quotes: readonly { workerUserId: string; status: string }[]
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

function isDeclined(status: string | undefined): boolean {
  return status === QuoteStatus.Declined || status === QuoteStatus.Rejected
}

/**
 * The one place that decides what this viewer sees. `task` is null until
 * the viewer-scoped task (and its order) has loaded.
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
    if (status === 'AWARDED') return 'visitor.awarded'
    const live = task.quotes.filter((q) => q.status === QuoteStatus.Pending)
    return live.length > 0 ? 'owner.open.quotes' : 'owner.open.noQuotes'
  }

  const myQuote = viewer
    ? task.quotes.find((q) => q.workerUserId === viewer.userId)
    : undefined

  if (status === 'AWARDED') {
    if (myQuote?.status === QuoteStatus.NotSelected) return 'worker.notSelected'
    if (isDeclined(myQuote?.status)) return 'worker.awarded.declined'
    return 'visitor.awarded'
  }

  // OPEN (DRAFT reads as OPEN for its owner).
  if (!viewer) return 'guest.open'
  if (!viewer.hasWorkerProfile) return 'customer.open'
  if (myQuote?.status === QuoteStatus.Pending) return 'worker.open.quoted'
  if (isDeclined(myQuote?.status)) return 'worker.open.declined'
  return 'worker.open.notQuoted'
}

/** Live (PENDING) quotes: what headlines count. */
export function liveQuoteCount(quotes: readonly { status: string }[]): number {
  return quotes.filter((q) => q.status === QuoteStatus.Pending).length
}
