import type { InboxViewInput, InboxViewName } from './types'

/**
 * The one place that decides what the inbox list shows. Whether there are
 * conversations at all comes first, then what the search and filter leave.
 */
export function getInboxView({
  query,
  threadCount,
  matchCount,
}: InboxViewInput): InboxViewName {
  if (query === 'loading') return 'inbox.loading'
  if (query === 'error') return 'inbox.error'
  if (threadCount === 0) return 'inbox.empty'
  return matchCount === 0 ? 'inbox.noMatches' : 'inbox.list'
}
