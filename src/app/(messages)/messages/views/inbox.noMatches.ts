import type { InboxViewConfig } from './types'

/** The search or filter leaves no conversations: say so, with Clear search and filter. */
export const inboxNoMatches: InboxViewConfig = {
  search: true,
  body: 'noMatches',
}
