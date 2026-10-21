import {
  ThreadAttentionKind,
  ThreadItemType,
  ThreadKind,
} from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import { threadQueryState, threadTitle, timelineRows } from './messagesThread'

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
  }
  const thread = {
    kind: ThreadKind.Task,
    title: 'Mount a bookshelf',
    otherParty: null,
    attention: null,
  }
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

  it('keeps the Slashie thread title', () => {
    expect(
      threadTitle(
        { ...thread, kind: ThreadKind.System, title: 'Slashie' },
        copy,
      ),
    ).toBe('Slashie')
  })
})
