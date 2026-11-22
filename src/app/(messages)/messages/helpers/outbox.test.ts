import { beforeEach, describe, expect, it } from 'vitest'

import {
  type OutboxMessage,
  inThreadOrder,
  isLocalMessageId,
  outboxAdd,
  outboxDelivered,
  outboxFail,
  outboxRemove,
  outboxRetry,
  outboxSent,
  outboxShown,
  outboxStore,
  sendRefusalReason,
} from './outbox'

const message = (over: Partial<OutboxMessage> = {}): OutboxMessage => ({
  id: 'local:1',
  threadId: 't1',
  body: 'I can come at 3pm',
  createdAt: '2026-11-22T15:00:00.000Z',
  status: 'sending',
  reason: null,
  sentAs: null,
  ...over,
})

/**
 * Motion group B (Ryan 22 Nov): a sent message shows at once, then confirms.
 * If it fails it stays, marked Not sent, and a tap sends it again.
 */
describe('the outbox', () => {
  it('a new message is on its way, after the ones before it', () => {
    const list = outboxAdd([message()], message({ id: 'local:2' }))
    expect(list.map((row) => row.id)).toEqual(['local:1', 'local:2'])
    expect(list.every((row) => row.status === 'sending')).toBe(true)
  })

  it('a failure keeps the message, marked, with a reason only when a retry cannot help', () => {
    const failed = outboxFail([message()], 'local:1', null)
    expect(failed[0]).toMatchObject({ status: 'failed', reason: null })
    expect(failed[0]?.body).toBe('I can come at 3pm')
    const refused = outboxFail(
      [message()],
      'local:1',
      'This task is suspended.',
    )
    expect(refused[0]?.reason).toBe('This task is suspended.')
  })

  it('a tap on a failed message sends it again, with the old reason gone', () => {
    const failed = outboxFail([message()], 'local:1', 'Suspended')
    expect(outboxRetry(failed, 'local:1')[0]).toMatchObject({
      status: 'sending',
      reason: null,
    })
  })

  it('a sent message keeps showing until the server’s own item is in the timeline', () => {
    const sent = outboxSent([message()], 'local:1', 'm9')
    // Sent, but the timeline has not caught up: still shown (no gap).
    expect(outboxShown(sent, 't1', new Set(['m1'])).map((r) => r.id)).toEqual([
      'local:1',
    ])
    expect(outboxDelivered(sent, new Set(['m1']))).toEqual([])
    // The server item is there: it steps aside (never shown twice).
    expect(outboxShown(sent, 't1', new Set(['m1', 'm9']))).toEqual([])
    expect(outboxDelivered(sent, new Set(['m1', 'm9']))).toEqual(['local:1'])
    expect(outboxRemove(sent, ['local:1'])).toEqual([])
  })

  it('a conversation shows only its own unsent messages', () => {
    const list = [message(), message({ id: 'local:2', threadId: 't2' })]
    expect(outboxShown(list, 't2', new Set()).map((r) => r.id)).toEqual([
      'local:2',
    ])
  })

  it('a local id can never be mistaken for a server one', () => {
    expect(isLocalMessageId('local:4')).toBe(true)
    expect(isLocalMessageId('665f1c2e9b1e')).toBe(false)
  })
})

describe('why a message was refused', () => {
  const reasons = {
    MESSAGE_BLOCKED: 'Messages are blocked between you and this person.',
    TASK_SUSPENDED: 'This task is suspended.',
    MESSAGE_RATE_LIMITED: 'You are sending messages too quickly.',
  }

  it('says why when trying again will not help', () => {
    expect(sendRefusalReason('MESSAGE_BLOCKED', reasons)).toBe(
      'Messages are blocked between you and this person.',
    )
    expect(sendRefusalReason('TASK_SUSPENDED', reasons)).toBe(
      'This task is suspended.',
    )
  })

  it('offers the retry for anything a second try can get past', () => {
    // No signal, an unknown error, or sending too fast.
    expect(sendRefusalReason(undefined, reasons)).toBeNull()
    expect(sendRefusalReason('INTERNAL_SERVER_ERROR', reasons)).toBeNull()
    expect(sendRefusalReason('MESSAGE_RATE_LIMITED', reasons)).toBeNull()
  })
})

describe('the outbox store', () => {
  beforeEach(() => outboxStore.clear())

  it('adds, fails, retries and forgets, telling whoever is watching', () => {
    let calls = 0
    const stop = outboxStore.subscribe(() => {
      calls += 1
    })
    const first = outboxStore.add('t1', 'Hello')
    expect(isLocalMessageId(first.id)).toBe(true)
    expect(outboxStore.get()).toHaveLength(1)
    outboxStore.fail(first.id, null)
    expect(outboxStore.get()[0]?.status).toBe('failed')
    outboxStore.retry(first.id)
    expect(outboxStore.get()[0]?.status).toBe('sending')
    outboxStore.remove([first.id])
    expect(outboxStore.get()).toEqual([])
    expect(calls).toBe(4)
    stop()
  })

  it('each message gets its own id', () => {
    const a = outboxStore.add('t1', 'One')
    const b = outboxStore.add('t1', 'Two')
    expect(a.id).not.toBe(b.id)
  })

  it('is emptied when the signed-in person changes: unsent text stays with them', () => {
    outboxStore.add('t1', 'Private')
    outboxStore.clear()
    expect(outboxStore.get()).toEqual([])
    expect(outboxStore.getServer()).toEqual([])
  })
})

describe('two quick messages arrive in the order they were written', () => {
  it('the second waits for the first, even when the first fails', async () => {
    const order: string[] = []
    const slow = inThreadOrder('t1', async () => {
      await new Promise((done) => setTimeout(done, 20))
      order.push('first')
      throw new Error('offline')
    }).catch(() => undefined)
    const quick = inThreadOrder('t1', async () => {
      order.push('second')
    })
    const other = inThreadOrder('t2', async () => {
      order.push('other thread')
    })
    await Promise.all([slow, quick, other])
    expect(order).toEqual(['other thread', 'first', 'second'])
  })

  it('a request that never answers does not hold the next message for ever', async () => {
    outboxStore.clear()
    const order: string[] = []
    // The first never settles (no signal, and nothing times it out).
    void inThreadOrder('t1', () => new Promise<void>(() => {}), 30)
    await inThreadOrder(
      't1',
      async () => {
        order.push('second went anyway')
      },
      30,
    )
    expect(order).toEqual(['second went anyway'])
  })
})
