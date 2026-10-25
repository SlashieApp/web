import { ThreadKind } from '@codegen/schema'
import { afterAll, describe, expect, it } from 'vitest'

import type { TaskDetailViewName } from '@/app/(task)/tasks/[slug]/views/types'

import {
  THREAD_VIEWS,
  type ThreadViewInput,
  type ThreadViewName,
  getThreadView,
  threadOtherBooking,
} from '.'

type Thread = NonNullable<ThreadViewInput['thread']>

const seen = new Set<ThreadViewName>()
const taskThread = (over: Partial<Thread> = {}): Thread => ({
  kind: ThreadKind.Task,
  canSend: false,
  blockedByMe: false,
  ...over,
})
const view = (input: Partial<ThreadViewInput> = {}) => {
  const result = getThreadView({
    threadId: 'thread-1',
    query: 'ready',
    thread: taskThread(),
    suspended: false,
    otherBooking: null,
    ...input,
  })
  seen.add(result)
  return result
}

describe('getThreadView', () => {
  it('asks you to choose a conversation when none is open', () => {
    expect(view({ threadId: null })).toBe('thread.none')
  })

  it('shows skeleton bubbles while the conversation loads', () => {
    expect(view({ query: 'loading', thread: null })).toBe('thread.loading')
  })

  it('says the conversation is not available when the API has none for you', () => {
    expect(view({ query: 'notFound', thread: null })).toBe('thread.notFound')
  })

  it('offers Try again when the conversation could not load', () => {
    expect(view({ query: 'error', thread: null })).toBe('thread.loadError')
  })

  it('shows Slashie announcements read-only, without pins', () => {
    const name = view({ thread: taskThread({ kind: ThreadKind.System }) })
    expect(name).toBe('thread.system')
    expect(THREAD_VIEWS[name]).toMatchObject({ pins: false })
  })

  it('opens the composer when you can send, between the pins', () => {
    const name = view({ thread: taskThread({ canSend: true }) })
    expect(name).toBe('thread.open')
    expect(THREAD_VIEWS[name]).toMatchObject({ composer: 'open', pins: true })
  })

  it('explains that you blocked the other person', () => {
    expect(view({ thread: taskThread({ blockedByMe: true }) })).toBe(
      'thread.blocked',
    )
  })

  it('waits for a quote to be accepted before messages open', () => {
    expect(view()).toBe('thread.locked')
  })

  it('says messaging is paused while the task or booking is suspended, not "once a quote is accepted"', () => {
    const name = view({ suspended: true })
    expect(name).toBe('thread.suspended')
    expect(THREAD_VIEWS[name]).toMatchObject({
      composer: 'suspendedNotice',
      pins: true,
    })
  })

  it('keeps the blocked line over a suspension, and the composer when the API allows it', () => {
    expect(
      view({ suspended: true, thread: taskThread({ blockedByMe: true }) }),
    ).toBe('thread.blocked')
    expect(
      view({ suspended: true, thread: taskThread({ canSend: true }) }),
    ).toBe('thread.open')
  })

  // BE-113: the viewer's quote stays PENDING while someone else is booked, and
  // nothing tells them, so the thread says so quietly instead of "once a quote
  // is accepted".
  it('says the task is booked by someone else, not "once a quote is accepted"', () => {
    const name = view({ otherBooking: 'booked' })
    expect(name).toBe('thread.bookedByOther')
    expect(THREAD_VIEWS[name]).toMatchObject({
      layout: 'conversation',
      composer: 'bookedByOtherNotice',
      pins: true,
    })
  })

  it('says the task is completed once the booking someone else won is done', () => {
    const name = view({ otherBooking: 'completed' })
    expect(name).toBe('thread.completedByOther')
    expect(THREAD_VIEWS[name]).toMatchObject({
      composer: 'completedNotice',
      pins: true,
    })
  })

  it('keeps blocked and suspended over the booked line, and the composer when the API allows it', () => {
    const booked = { otherBooking: 'booked' } as const
    expect(view({ ...booked, thread: taskThread({ blockedByMe: true }) })).toBe(
      'thread.blocked',
    )
    expect(view({ ...booked, suspended: true })).toBe('thread.suspended')
    expect(view({ ...booked, thread: taskThread({ canSend: true }) })).toBe(
      'thread.open',
    )
  })

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(THREAD_VIEWS).sort())
  })
})

describe('threadOtherBooking', () => {
  it("reads task detail's booked-by-someone-else views, and nothing else", () => {
    expect(threadOtherBooking('worker.bookedByOther')).toBe('booked')
    expect(threadOtherBooking('worker.completedByOther')).toBe('completed')
    const others: TaskDetailViewName[] = [
      'loading',
      'worker.open.quoted',
      'worker.open.closed',
      'worker.booked.beforeStart',
      'worker.completed',
      'owner.open.quotes',
      'owner.booked.beforeStart',
      'visitor.awarded',
      'visitor.completed',
    ]
    for (const other of others) {
      expect(threadOtherBooking(other)).toBeNull()
    }
  })
})
