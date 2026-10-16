import { ThreadItemType } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import { pinPerson, threadQueryState, timelineRows } from './messagesThread'

const forbidden = {
  errors: [
    { message: 'FORBIDDEN', extensions: { code: 'INTERNAL_SERVER_ERROR' } },
  ],
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

describe('pinPerson', () => {
  const party = {
    userId: 'u1',
    name: 'Jordan Lee',
    avatarUrl: 'https://img/jordan.png',
    deleted: false,
  }

  it('calls the other person the worker when you own the task', () => {
    expect(pinPerson(party, true)).toEqual({
      name: 'Jordan Lee',
      avatarUrl: 'https://img/jordan.png',
      role: 'worker',
      href: '/profile/u1',
    })
  })

  it('calls the other person the customer when you are the worker', () => {
    expect(pinPerson(party, false)?.role).toBe('customer')
  })

  it('has no profile link or photo for a deleted account', () => {
    expect(
      pinPerson({ ...party, name: 'Deleted user', deleted: true }, true),
    ).toMatchObject({ avatarUrl: null, href: null })
  })

  it('has no person before anyone is booked', () => {
    expect(pinPerson(null, true)).toBeNull()
  })
})
