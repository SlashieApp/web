import { type ThreadAttentionKind, ThreadKind } from '@codegen/schema'

/** The inbox's filter drawer offers one of these at a time (FE-362). */
export type InboxFilter =
  | 'all'
  | 'unread'
  | 'needsYou'
  | 'posted'
  | 'working'
  | 'slashie'

/** In the order the drawer lists them. */
export const INBOX_FILTERS: readonly InboxFilter[] = [
  'all',
  'unread',
  'needsYou',
  'posted',
  'working',
  'slashie',
]

type InboxThread = {
  kind: ThreadKind
  /** The task's title, or "Slashie" for the Slashie thread. */
  title: string
  unreadCount: number
  attention?: { kind: ThreadAttentionKind } | null
  task?: { poster?: { id: string } | null } | null
  otherParty?: { name: string } | null
  lastItem?: { title?: string | null; body: string } | null
}

/**
 * Both sides of a search go through this: NFKD, the combining marks off,
 * lower case, spaces collapsed. So "CHLOE" finds "Chloé", and full-width
 * letters (a Chinese keyboard types them) find plain ones.
 */
function fold(text: string): string {
  return (
    text
      .normalize('NFKD')
      // biome-ignore lint/suspicious/noMisleadingCharacterClass: the combining marks block (U+0300 to U+036F) is what goes
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
  )
}

/**
 * Every word typed is found, in any order, in the other person's name, the
 * thread's title (the task's, or "Slashie") or the latest item's title or
 * text.
 */
function matchesSearch(thread: InboxThread, words: readonly string[]) {
  const text = fold(
    [
      thread.otherParty?.name,
      thread.title,
      thread.lastItem?.title,
      thread.lastItem?.body,
    ].join(' '),
  )
  return words.every((word) => text.includes(word))
}

/**
 * Which side of the task the viewer is on. Neither for the Slashie thread (no
 * task) or when the API sent no poster.
 */
function taskSide(
  thread: InboxThread,
  meId: string | null,
): 'posted' | 'working' | null {
  const posterId = thread.task?.poster?.id
  if (!posterId || !meId) return null
  return posterId === meId ? 'posted' : 'working'
}

function matchesFilter(
  thread: InboxThread,
  filter: InboxFilter,
  meId: string | null,
) {
  switch (filter) {
    case 'all':
      return true
    case 'unread':
      return thread.unreadCount > 0
    case 'needsYou':
      return Boolean(thread.attention)
    case 'posted':
    case 'working':
      return taskSide(thread, meId) === filter
    case 'slashie':
      return thread.kind === ThreadKind.System
  }
}

/**
 * The threads the search text and the filter leave, in the same order. Both
 * must match. No text keeps everything. `meId` is the signed-in user, to tell
 * the tasks they posted from the ones they work on.
 */
export function filterThreads<T extends InboxThread>(
  threads: readonly T[],
  {
    searchText,
    filter,
    meId,
  }: { searchText: string; filter: InboxFilter; meId: string | null },
): T[] {
  const words = fold(searchText).split(' ').filter(Boolean)
  return threads.filter(
    (thread) =>
      matchesFilter(thread, filter, meId) && matchesSearch(thread, words),
  )
}
