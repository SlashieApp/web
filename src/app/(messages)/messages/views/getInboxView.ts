import type { InboxViewInput, InboxViewName } from './types'

/** The one place that decides what the inbox list shows. */
export function getInboxView({
  query,
  threadCount,
}: InboxViewInput): InboxViewName {
  if (query === 'loading') return 'inbox.loading'
  if (query === 'error') return 'inbox.error'
  return threadCount === 0 ? 'inbox.empty' : 'inbox.list'
}
