import type { ThreadKind } from '@codegen/schema'

/** The inbox list (README.md). */
export type InboxViewName =
  | 'inbox.loading'
  | 'inbox.error'
  | 'inbox.empty'
  | 'inbox.list'

export type InboxViewInput = {
  /** The threads query, before anything is cached. */
  query: 'loading' | 'error' | 'ready'
  threadCount: number
}

export type InboxViewConfig = { body: 'skeleton' | 'error' | 'empty' | 'list' }

/** The open conversation (README.md). */
export type ThreadViewName =
  | 'thread.none'
  | 'thread.loading'
  | 'thread.loadError'
  | 'thread.notFound'
  | 'thread.system'
  | 'thread.open'
  | 'thread.locked'
  | 'thread.notSelected'
  | 'thread.blocked'

/** Where the thread query is (`threadQueryState`). */
export type ThreadQuery = 'loading' | 'notFound' | 'error' | 'ready'

export type ThreadViewInput = {
  threadId: string | null
  query: ThreadQuery
  thread: { kind: ThreadKind; canSend: boolean; blockedByMe: boolean } | null
  /** The viewer's quote lost to another worker's. */
  notSelected: boolean
}

/** Copy keys in ../i11n.json for the line shown instead of the composer. */
export type ThreadComposerNotice =
  | 'systemNotice'
  | 'lockedNotice'
  | 'notSelectedNotice'
  | 'blockedNotice'

export type ThreadViewConfig =
  | { layout: 'pick' }
  | { layout: 'skeleton' }
  | {
      layout: 'status'
      title: 'loadError' | 'notFoundTitle'
      body: 'notFoundBody' | null
      retry: boolean
    }
  | { layout: 'conversation'; composer: 'open' | ThreadComposerNotice }

/** The card pinned under a task thread's header (README.md). */
export type ThreadPinViewName =
  | 'pin.quotes'
  | 'pin.status'
  | 'pin.quoting'
  | 'pin.requote'
  | 'pin.booked'
  | 'pin.waiting'
  | 'pin.answer'
  | 'pin.close'
  | 'pin.confirm'
  | 'pin.conflict'
  | 'pin.done'
  | 'pin.notSelected'
  | 'pin.closed'

export type ThreadPinViewConfig = {
  /** Task detail's status pill, "Not selected" in its place, or none. */
  pill: 'task' | 'notSelected' | null
  /** Task detail's headline and sub-line for the view. */
  headline: boolean
  subline: boolean
  /** Booked time and agreed price, the agreed price, or the viewer's quote. */
  facts: 'booking' | 'price' | 'quote' | null
  /**
   * `mainCta`: task detail's main action as a button (Edit quote, Send quote,
   * Review, Get receipt). `close`: its slide to mark Done. `request`: the
   * answer buttons for a reschedule or cancellation.
   */
  controls:
    | 'compareQuotes'
    | 'mainCta'
    | 'close'
    | 'request'
    | 'openTask'
    | null
}
