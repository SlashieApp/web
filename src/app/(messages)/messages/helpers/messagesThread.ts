import {
  ThreadAttentionKind,
  ThreadItemType,
  ThreadKind,
} from '@codegen/schema'

import { formatMessage } from '@/i18n/loadPageI11n'
import { getGraphQLErrorCode } from '@/utils/graphqlErrors'

import type { ThreadQuery } from '../views'

/**
 * Where the thread query is. The API answers FORBIDDEN (or nothing) for a
 * conversation you're not in, which isn't the same as a failed request.
 */
export function threadQueryState({
  loading,
  thread,
  error,
}: {
  loading: boolean
  thread: unknown
  error: unknown
}): ThreadQuery {
  if (thread) return 'ready'
  if (loading) return 'loading'
  if (!error) return 'notFound'
  return getGraphQLErrorCode(error) === 'FORBIDDEN' ? 'notFound' : 'error'
}

type TimelineItem = {
  type: ThreadItemType | string
  createdAt: string
  isMine?: boolean | null
}

export type TimelineRow<T> =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'item'; item: T; showTime: boolean }

/** A run of messages from one side shows one time, under its last bubble. */
const RUN_GAP_MS = 5 * 60_000

const dayKey = (at: Date) =>
  `${at.getFullYear()}-${at.getMonth()}-${at.getDate()}`

function dayLabel(
  at: Date,
  locale: string,
  copy: { today: string; yesterday: string },
  now: Date,
): string {
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (dayKey(at) === dayKey(now)) return copy.today
  if (dayKey(at) === dayKey(yesterday)) return copy.yesterday
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: at.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  }).format(at)
}

/**
 * The timeline, oldest first, with a divider at the start of each day.
 * Flash cards keep their own time; a message hides its time when the next
 * one is from the same side within a few minutes.
 */
export function timelineRows<T extends TimelineItem>(
  items: readonly T[],
  locale: string,
  copy: { today: string; yesterday: string },
  now = new Date(),
): TimelineRow<T>[] {
  const rows: TimelineRow<T>[] = []
  let lastDay = ''
  items.forEach((item, index) => {
    const at = new Date(item.createdAt)
    const day = dayKey(at)
    if (day !== lastDay) {
      rows.push({
        kind: 'day',
        key: day,
        label: dayLabel(at, locale, copy, now),
      })
      lastDay = day
    }
    const next = items[index + 1]
    const runContinues =
      item.type === ThreadItemType.Message &&
      next?.type === ThreadItemType.Message &&
      Boolean(next.isMine) === Boolean(item.isMine) &&
      dayKey(new Date(next.createdAt)) === day &&
      new Date(next.createdAt).getTime() - at.getTime() <= RUN_GAP_MS
    rows.push({ kind: 'item', item, showTime: !runContinues })
  })
  return rows
}

type TitleThread = {
  kind: ThreadKind
  title: string
  otherParty?: { name: string } | null
  attention?: { kind: ThreadAttentionKind; count?: number | null } | null
}

/**
 * What a thread is called in the inbox and its header (Thread screen v2):
 * the other person ("Deleted user" comes from the API). Only the poster has
 * nobody there before a quote is accepted; their title counts the workers
 * whose quotes are live (`attention` COMPARE_QUOTES carries the count) or
 * says Waiting for quotes. The Slashie thread keeps its own title.
 */
export function threadTitle(
  thread: TitleThread,
  copy: {
    workerQuoted: string
    workersQuoted: string
    waitingForQuotes: string
  },
): string {
  if (thread.kind === ThreadKind.System) return thread.title
  if (thread.otherParty) return thread.otherParty.name
  const attention = thread.attention
  const count =
    attention?.kind === ThreadAttentionKind.CompareQuotes
      ? (attention.count ?? 0)
      : 0
  if (count === 0) return copy.waitingForQuotes
  return count === 1
    ? copy.workerQuoted
    : formatMessage(copy.workersQuoted, { count })
}
