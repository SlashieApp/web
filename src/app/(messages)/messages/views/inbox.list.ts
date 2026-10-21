import type { InboxViewConfig } from './types'

/**
 * Task threads and the Slashie thread, most recently active first. A row is
 * titled with the other person (or "{n} workers quoted" / Waiting for quotes
 * for the poster before booking) over the task name (`threadTitle`).
 */
export const inboxList: InboxViewConfig = { body: 'list' }
