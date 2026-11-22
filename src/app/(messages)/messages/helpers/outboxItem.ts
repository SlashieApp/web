import { type ThreadItemFieldsFragment, ThreadItemType } from '@codegen/schema'

import type { OutboxMessage } from './outbox'

/**
 * A message from the outbox as a timeline item, so it takes its place in the
 * conversation like any other: your own message, written just now. It has no
 * author card or quote; `id` is its local id.
 */
export function outboxTimelineItem(
  message: OutboxMessage,
): ThreadItemFieldsFragment {
  return {
    id: message.id,
    threadId: message.threadId,
    type: ThreadItemType.Message,
    flashKind: null,
    title: null,
    body: message.body,
    imageUrl: null,
    isMine: true,
    taskId: null,
    quoteId: null,
    orderId: null,
    createdAt: message.createdAt,
    author: null,
    quote: null,
  }
}
