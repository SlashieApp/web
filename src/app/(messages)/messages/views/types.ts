import type { ThreadAttentionKind, ThreadKind } from '@codegen/schema'

import type { TaskDetailViewName } from '@/app/(task)/tasks/[slug]/views/types'

/** The inbox list (README.md). */
export type InboxViewName =
  | 'inbox.loading'
  | 'inbox.error'
  | 'inbox.empty'
  | 'inbox.noMatches'
  | 'inbox.list'

export type InboxViewInput = {
  /** The threads query, before anything is cached. */
  query: 'loading' | 'error' | 'ready'
  threadCount: number
  /** Conversations left once the search text and the filter are applied. */
  matchCount: number
}

export type InboxViewConfig = {
  /** The search box and filter button: shown once there is something to search. */
  search: boolean
  body: 'skeleton' | 'error' | 'empty' | 'noMatches' | 'list'
}

/** The open conversation (README.md). */
export type ThreadViewName =
  | 'thread.none'
  | 'thread.loading'
  | 'thread.loadError'
  | 'thread.notFound'
  | 'thread.system'
  | 'thread.open'
  | 'thread.locked'
  | 'thread.bookedByOther'
  | 'thread.completedByOther'
  | 'thread.otherBookingEnded'
  | 'thread.blocked'
  | 'thread.suspended'

/** Where the thread query is (`threadQueryState`). */
export type ThreadQuery = 'loading' | 'notFound' | 'error' | 'ready'

export type ThreadViewInput = {
  threadId: string | null
  query: ThreadQuery
  thread: { kind: ThreadKind; canSend: boolean; blockedByMe: boolean } | null
  /**
   * The task or the booking is frozen by a suspension (task detail's
   * `permissions.isFrozen`, BE-108): the API's `canSend` is false until it
   * is lifted.
   */
  suspended: boolean
  /**
   * The task is booked or done and the viewer's quote isn't the one (BE-113),
   * or its booking ended and the owner hasn't reopened it (BE-116): their
   * quote stays PENDING and nothing tells them, so the thread says so
   * quietly. Task detail's `worker.bookedByOther` / `worker.completedByOther`
   * / `worker.otherBookingEnded` (`threadOtherBooking`: `booked`,
   * `completed`, `ended`); null for everyone else.
   */
  otherBooking: 'booked' | 'completed' | 'ended' | null
}

/** Copy keys in ../i11n.json for the line shown instead of the composer. */
export type ThreadComposerNotice =
  | 'systemNotice'
  | 'lockedNotice'
  | 'bookedByOtherNotice'
  | 'completedNotice'
  | 'otherBookingEndedNotice'
  | 'blockedNotice'
  | 'suspendedNotice'

export type ThreadViewConfig =
  | { layout: 'pick' }
  | { layout: 'skeleton' }
  | {
      layout: 'status'
      title: 'loadError' | 'notFoundTitle'
      body: 'notFoundBody' | null
      retry: boolean
    }
  | {
      layout: 'conversation'
      composer: 'open' | ThreadComposerNotice
      /** The top and bottom pins (task threads only). */
      pins: boolean
    }

/** The top pin under a task thread's header: information only (README.md). */
export type ThreadPinViewName =
  | 'pin.quotes'
  | 'pin.myQuote'
  | 'pin.booking'
  | 'pin.status'
  | 'pin.closed'

export type ThreadPinViewConfig = {
  /** Task detail's status pill. */
  pill: boolean
  /**
   * Task detail's headline, where the task or booking stands. Left out while
   * the bottom pin shows, since that pin says it with its buttons.
   */
  headline: boolean
  /**
   * `quotes`: the live quotes (worker, price, status; three rows, then
   * "+N more"). `myQuote`: the viewer's own quote (price, times, status).
   * `booking`: booked time, agreed price and payment method.
   */
  facts: 'quotes' | 'myQuote' | 'booking' | null
}

/** The bottom pin above the composer: what needs the viewer now (README.md). */
export type BottomPinViewName =
  | 'bottomPin.reschedule'
  | 'bottomPin.cancel'
  | 'bottomPin.markDone'
  | 'bottomPin.confirmDone'
  | 'bottomPin.answerFailed'
  | 'bottomPin.conflict'

export type BottomPinViewInput = {
  /** `thread.attention`: what the API says waits on the viewer. */
  attention: { kind: ThreadAttentionKind } | null | undefined
  /** Task detail's view, which supplies the copy and the controls. */
  view: TaskDetailViewName
}

export type BottomPinViewConfig = {
  /** Task detail's sub-line under the headline (who asked, the auto-Done date). */
  subline: boolean
  /**
   * `request`: task detail's answer buttons for a reschedule or cancellation.
   * `close`: its slide to mark Done and Something went wrong. `openTask`: a
   * link to sort a conflict out on task detail.
   */
  controls: 'request' | 'close' | 'openTask'
}
