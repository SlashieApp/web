/**
 * The "Task posted" moment (Post a task motion; Ryan 22 Nov). Posting a task
 * lands on its page, whose own status block plays the moment once: a tick
 * draws, the block settles in, and the headline reads "Task posted" for that
 * first view. The page already says the task is live, so there is no second
 * banner.
 *
 * Posting leaves a note for the page it lands on; the page takes it, so a
 * refresh, a later visit or a shared link never replays it. The Expo app's
 * `postedMoment.ts` does the same in memory.
 */
type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const KEY = 'slashie:task-posted'
/** A note older than this is for a landing that never happened. */
export const POSTED_MOMENT_MAX_AGE_MS = 120_000

/** Called as Post a task succeeds, before it opens the task's page. */
export function markTaskPosted(
  storage: StorageLike | null,
  taskId: string,
  now = Date.now(),
): void {
  try {
    storage?.setItem(KEY, JSON.stringify({ id: taskId, at: now }))
  } catch {
    // Private mode or a full store: the page opens without the moment.
  }
}

/**
 * True once, on the page of the task that was just posted. The note is
 * removed whether or not it is for this task or still fresh.
 */
export function takeTaskPosted(
  storage: StorageLike | null,
  taskId: string,
  now = Date.now(),
): boolean {
  try {
    const raw = storage?.getItem(KEY)
    if (!raw) return false
    storage?.removeItem(KEY)
    const note = JSON.parse(raw) as { id?: unknown; at?: unknown }
    if (note.id !== taskId || typeof note.at !== 'number') return false
    return now - note.at >= 0 && now - note.at <= POSTED_MOMENT_MAX_AGE_MS
  } catch {
    return false
  }
}

/** The tab's own store, or null where there is none (the server, a blocked store). */
export function postedMomentStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}
