import { ThreadKind } from '@codegen/schema'
import { afterAll, describe, expect, it } from 'vitest'

import {
  THREAD_VIEWS,
  type ThreadViewInput,
  type ThreadViewName,
  getThreadView,
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
    notSelected: false,
    suspended: false,
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

  it('tells a worker who was not selected that the conversation is closed', () => {
    expect(view({ notSelected: true })).toBe('thread.notSelected')
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

  it('keeps the blocked and not-selected lines over a suspension, and the composer when the API allows it', () => {
    expect(
      view({ suspended: true, thread: taskThread({ blockedByMe: true }) }),
    ).toBe('thread.blocked')
    expect(view({ suspended: true, notSelected: true })).toBe(
      'thread.notSelected',
    )
    expect(
      view({ suspended: true, thread: taskThread({ canSend: true }) }),
    ).toBe('thread.open')
  })

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(THREAD_VIEWS).sort())
  })
})
