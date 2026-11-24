/**
 * A task's success moments (Post a task motion and motion group C; Ryan
 * 22 Nov). Posting a task, sending a quote, accepting one or leaving a review
 * ends on the task's page, whose own status block plays the moment once: a
 * tick draws and the block settles in. A just-posted task keeps "Your task
 * is live - reaching workers"; a review says what just happened ("Review
 * sent"). The block is the
 * confirmation, so there is no pop-up as well.
 *
 * What was done leaves a note for the page it ends on; the page takes it, so
 * a refresh, a later visit or a shared link never replays it. The Expo app's
 * `postedMoment.ts` does the same in memory.
 */

/** What was just done on a task. */
export type TaskMoment =
  | 'posted'
  | 'quoteSent'
  | 'quoteAccepted'
  /** A new review. */
  | 'reviewSent'
  /** An edited review. */
  | 'reviewSaved'

const MOMENTS: readonly TaskMoment[] = [
  'posted',
  'quoteSent',
  'quoteAccepted',
  'reviewSent',
  'reviewSaved',
]

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const KEY = 'slashie:task-posted'
/** A note older than this is for a landing that never happened. */
export const POSTED_MOMENT_MAX_AGE_MS = 120_000

/** Called as the action succeeds, before its page shows the result. */
export function markTaskMoment(
  storage: StorageLike | null,
  taskId: string,
  moment: TaskMoment,
  now = Date.now(),
): void {
  try {
    storage?.setItem(KEY, JSON.stringify({ id: taskId, at: now, moment }))
  } catch {
    // Private mode or a full store: the page opens without the moment.
  }
}

/**
 * What was just done, once, on the page of that task; null otherwise. The
 * note is removed whether or not it is for this task or still fresh.
 */
export function takeTaskMoment(
  storage: StorageLike | null,
  taskId: string,
  now = Date.now(),
): TaskMoment | null {
  try {
    const raw = storage?.getItem(KEY)
    if (!raw) return null
    storage?.removeItem(KEY)
    const note = JSON.parse(raw) as {
      id?: unknown
      at?: unknown
      moment?: unknown
    }
    if (note.id !== taskId || typeof note.at !== 'number') return null
    if (now - note.at < 0 || now - note.at > POSTED_MOMENT_MAX_AGE_MS) {
      return null
    }
    const moment = MOMENTS.find((known) => known === note.moment)
    return moment ?? null
  } catch {
    return null
  }
}

/** Called as Post a task succeeds, before it opens the task's page. */
export function markTaskPosted(
  storage: StorageLike | null,
  taskId: string,
  now = Date.now(),
): void {
  markTaskMoment(storage, taskId, 'posted', now)
}

/** True once, on the page of the task that was just posted. */
export function takeTaskPosted(
  storage: StorageLike | null,
  taskId: string,
  now = Date.now(),
): boolean {
  return takeTaskMoment(storage, taskId, now) === 'posted'
}

/**
 * The views a moment may play on. Posting lands on the owner's open task
 * with no quotes; a sent quote on the worker's quoted view; an accepted one
 * on the booking. A review plays wherever its task now stands. Null: any.
 */
export const TASK_MOMENT_VIEWS: Record<TaskMoment, readonly string[] | null> = {
  posted: ['owner.open.noQuotes'],
  quoteSent: ['worker.open.quoted'],
  quoteAccepted: ['owner.booked.beforeStart', 'owner.booked.ready'],
  reviewSent: null,
  reviewSaved: null,
}

/** Whether `moment` plays on `view` (never while the page is loading). */
export function taskMomentPlaysOn(moment: TaskMoment, view: string): boolean {
  if (view === 'loading') return false
  const views = TASK_MOMENT_VIEWS[moment]
  return views === null || views.includes(view)
}

/** The tab's own store, or null where there is none (the server, a blocked store). */
export function postedMomentStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}
