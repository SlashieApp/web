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

  it('shows Slashie announcements read-only', () => {
    expect(view({ thread: taskThread({ kind: ThreadKind.System }) })).toBe(
      'thread.system',
    )
  })

  it('opens the composer when you can send', () => {
    expect(view({ thread: taskThread({ canSend: true }) })).toBe('thread.open')
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

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(THREAD_VIEWS).sort())
  })
})
