import {
  TaskStatus,
  ThreadAttentionKind,
  ThreadItemType,
  ThreadKind,
} from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  shouldRefetchThreads,
  threadQueryState,
  threadTitle,
  timelineRows,
} from './messagesThread'

const forbidden = {
  errors: [{ message: 'FORBIDDEN', extensions: { code: 'FORBIDDEN' } }],
}

describe('threadQueryState', () => {
  it('is loading before the first answer', () => {
    expect(threadQueryState({ loading: true, thread: null, error: null })).toBe(
      'loading',
    )
  })

  it('is ready once the thread is there', () => {
    expect(threadQueryState({ loading: true, thread: {}, error: null })).toBe(
      'ready',
    )
  })

  it("treats the API's FORBIDDEN as a conversation you can't open", () => {
    expect(
      threadQueryState({ loading: false, thread: null, error: forbidden }),
    ).toBe('notFound')
  })

  it("treats an empty answer as a conversation you can't open", () => {
    expect(
      threadQueryState({ loading: false, thread: null, error: null }),
    ).toBe('notFound')
  })

  it('treats a network failure as an error', () => {
    expect(
      threadQueryState({
        loading: false,
        thread: null,
        error: new Error('Failed to fetch'),
      }),
    ).toBe('error')
  })
})

describe('shouldRefetchThreads', () => {
  it('refetches when task detail moves to another view', () => {
    expect(
      shouldRefetchThreads('owner.booked.beforeStart', 'owner.booked.ready'),
    ).toBe(true)
    expect(
      shouldRefetchThreads('worker.booked.ready', 'worker.booked.iMarkedDone'),
    ).toBe(true)
  })

  it('does not refetch for the first view, which the thread fetch covers', () => {
    expect(shouldRefetchThreads(null, 'owner.booked.ready')).toBe(false)
  })

  it('does not refetch while loading, or when the view stays the same', () => {
    expect(shouldRefetchThreads('owner.booked.ready', 'loading')).toBe(false)
    expect(shouldRefetchThreads(null, 'loading')).toBe(false)
    expect(
      shouldRefetchThreads('owner.booked.ready', 'owner.booked.ready'),
    ).toBe(false)
  })
})

const now = new Date(2026, 9, 16, 12, 0)
const at = (day: number, hour: number, minute = 0) =>
  new Date(2026, 9, day, hour, minute).toISOString()
const message = (id: string, createdAt: string, isMine: boolean) => ({
  id,
  type: ThreadItemType.Message,
  createdAt,
  isMine,
})
const copy = { today: 'Today', yesterday: 'Yesterday' }

describe('timelineRows', () => {
  it('starts each day with a divider', () => {
    const rows = timelineRows(
      [message('a', at(15, 9), false), message('b', at(16, 9), true)],
      'en-GB',
      copy,
      now,
    )
    expect(
      rows.filter((row) => row.kind === 'day').map((row) => row.label),
    ).toEqual(['Yesterday', 'Today'])
  })

  it('labels older days with the date', () => {
    const rows = timelineRows(
      [message('a', at(2, 9), false)],
      'en-GB',
      copy,
      now,
    )
    expect(rows[0]).toMatchObject({ kind: 'day', label: '2 Oct' })
  })

  it('shows the time once under a run of messages from the same person', () => {
    const rows = timelineRows(
      [message('a', at(16, 9, 0), true), message('b', at(16, 9, 2), true)],
      'en-GB',
      copy,
      now,
    )
    const items = rows.filter((row) => row.kind === 'item')
    expect(items.map((row) => row.showTime)).toEqual([false, true])
  })

  it('shows the time again when the other person replies', () => {
    const rows = timelineRows(
      [message('a', at(16, 9, 0), true), message('b', at(16, 9, 1), false)],
      'en-GB',
      copy,
      now,
    )
    const items = rows.filter((row) => row.kind === 'item')
    expect(items.map((row) => row.showTime)).toEqual([true, true])
  })
})

describe('threadTitle', () => {
  const copy = {
    workerQuoted: '1 worker quoted',
    workersQuoted: '{count} workers quoted',
    waitingForQuotes: 'Waiting for quotes',
    taskCancelled: 'Task cancelled',
  }
  const thread = {
    kind: ThreadKind.Task,
    title: 'Mount a bookshelf',
    otherParty: null,
    attention: null,
    task: { status: TaskStatus.Open },
  }
  const cancelled = { status: TaskStatus.Cancelled }
  const quotes = (count: number | null) => ({
    kind: ThreadAttentionKind.CompareQuotes,
    count,
  })

  it('names the other person once there is one', () => {
    expect(
      threadTitle({ ...thread, otherParty: { name: 'Jordan Lee' } }, copy),
    ).toBe('Jordan Lee')
  })

  it('counts the live quotes for the poster before anyone is booked', () => {
    expect(threadTitle({ ...thread, attention: quotes(3) }, copy)).toBe(
      '3 workers quoted',
    )
    expect(threadTitle({ ...thread, attention: quotes(1) }, copy)).toBe(
      '1 worker quoted',
    )
  })

  it('waits for quotes when none are live', () => {
    expect(threadTitle(thread, copy)).toBe('Waiting for quotes')
    expect(threadTitle({ ...thread, attention: quotes(null) }, copy)).toBe(
      'Waiting for quotes',
    )
  })

  it('says the task is cancelled for the poster when it was cancelled before booking', () => {
    expect(threadTitle({ ...thread, task: cancelled }, copy)).toBe(
      'Task cancelled',
    )
    expect(
      threadTitle({ ...thread, task: cancelled, attention: quotes(2) }, copy),
    ).toBe('Task cancelled')
  })

  it('keeps naming the other person when the task is cancelled after booking', () => {
    expect(
      threadTitle(
        { ...thread, task: cancelled, otherParty: { name: 'Jordan Lee' } },
        copy,
      ),
    ).toBe('Jordan Lee')
  })

  it('keeps the Slashie thread title', () => {
    expect(
      threadTitle(
        { ...thread, kind: ThreadKind.System, title: 'Slashie' },
        copy,
      ),
    ).toBe('Slashie')
  })
})
