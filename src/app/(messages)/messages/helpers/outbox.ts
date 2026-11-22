/**
 * Messages you have sent that the server has not confirmed yet (motion group
 * B, Ryan 22 Nov). A message appears in the conversation the moment it is
 * sent; the server confirms after. If sending fails it stays where it is,
 * marked "Not sent. Tap to try again." (Ryan's choice), and a tap sends it
 * again.
 *
 * Held in memory only: never stored, and emptied when the signed-in person
 * changes, so unsent text never reaches another account on the same device.
 */

export type OutboxStatus = 'sending' | 'failed' | 'sent'

export type OutboxMessage = {
  /** Local only (`local:3`): never a server id. */
  id: string
  threadId: string
  body: string
  /** When it was written (ISO), which is where it sits in the conversation. */
  createdAt: string
  status: OutboxStatus
  /**
   * Why it can't be sent, when trying again won't help (a suspension). Null
   * for anything a second try might fix.
   */
  reason: string | null
  /** The server's id for it, once sent: it steps aside when that item shows. */
  sentAs: string | null
}

const LOCAL_PREFIX = 'local:'

export function isLocalMessageId(id: string): boolean {
  return id.startsWith(LOCAL_PREFIX)
}

export function localMessageId(n: number): string {
  return `${LOCAL_PREFIX}${n}`
}

type List = readonly OutboxMessage[]

export function outboxAdd(list: List, message: OutboxMessage): List {
  return [...list, message]
}

const patch = (list: List, id: string, change: Partial<OutboxMessage>): List =>
  list.map((row) => (row.id === id ? { ...row, ...change } : row))

/** It did not go: it stays, marked, with the reason when a retry can't help. */
export function outboxFail(
  list: List,
  id: string,
  reason: string | null,
): List {
  return patch(list, id, { status: 'failed', reason })
}

/** A tap on a failed message: it is on its way again. */
export function outboxRetry(list: List, id: string): List {
  return patch(list, id, { status: 'sending', reason: null })
}

/** The server has it. It keeps showing until the server's own item does. */
export function outboxSent(list: List, id: string, sentAs: string): List {
  return patch(list, id, { status: 'sent', sentAs })
}

export function outboxRemove(list: List, ids: readonly string[]): List {
  return ids.length ? list.filter((row) => !ids.includes(row.id)) : list
}

/**
 * What a conversation still shows from the outbox, oldest first: everything
 * of this thread whose server item has not arrived. A sent message whose
 * server item is already in the timeline steps aside, so it is never shown
 * twice, and never missing for a frame in between.
 */
export function outboxShown(
  list: List,
  threadId: string,
  serverIds: ReadonlySet<string>,
): OutboxMessage[] {
  return list.filter(
    (row) =>
      row.threadId === threadId &&
      !(row.sentAs !== null && serverIds.has(row.sentAs)),
  )
}

/** The sent messages whose server item has arrived: done with, to be dropped. */
export function outboxDelivered(
  list: List,
  serverIds: ReadonlySet<string>,
): string[] {
  return list
    .filter((row) => row.sentAs !== null && serverIds.has(row.sentAs))
    .map((row) => row.id)
}

// The store: one list for the tab, read with `useSyncExternalStore`.

let state: List = []
let counter = 0
const listeners = new Set<() => void>()

function set(next: List) {
  if (next === state) return
  state = next
  for (const listener of listeners) listener()
}

export const outboxStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  get: (): List => state,
  /** Server render: nothing is ever waiting to send. */
  getServer: (): List => EMPTY,
  /** A new message, on its way. Returns it, with its local id. */
  add(threadId: string, body: string, now = new Date()): OutboxMessage {
    counter += 1
    const message: OutboxMessage = {
      id: localMessageId(counter),
      threadId,
      body,
      createdAt: now.toISOString(),
      status: 'sending',
      reason: null,
      sentAs: null,
    }
    set(outboxAdd(state, message))
    return message
  },
  fail: (id: string, reason: string | null) =>
    set(outboxFail(state, id, reason)),
  retry: (id: string) => set(outboxRetry(state, id)),
  sent: (id: string, sentAs: string) => set(outboxSent(state, id, sentAs)),
  remove: (ids: readonly string[]) => set(outboxRemove(state, ids)),
  /** Someone else signed in, or nobody is: their unsent text goes with them. */
  clear: () => {
    queues.clear()
    set(EMPTY)
  },
}

const EMPTY: List = []

// One at a time per conversation, so two quick messages arrive in the order
// they were written. But never for ever: a request that does not answer must
// not hold everything written after it.
const queues = new Map<string, Promise<void>>()

/** How long a message waits for the one before it to be answered. */
export const SEND_ORDER_WAIT_MS = 10_000

export function inThreadOrder(
  threadId: string,
  task: () => Promise<void>,
  maxWaitMs = SEND_ORDER_WAIT_MS,
): Promise<void> {
  const before = queues.get(threadId) ?? Promise.resolve()
  const turn = new Promise<void>((go) => {
    const timer = setTimeout(go, maxWaitMs)
    const settled = () => {
      clearTimeout(timer)
      go()
    }
    before.then(settled, settled)
  })
  const next = turn.then(task)
  // What the next message waits on: whether this one went or not.
  queues.set(
    threadId,
    next.catch(() => undefined),
  )
  return next
}
