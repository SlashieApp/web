import { ThreadKind } from '@codegen/schema'

import type { ThreadViewInput, ThreadViewName } from './types'

/**
 * The one place that decides what the open conversation shows. Precedence:
 * nothing picked, the query, Slashie threads, then why you can or can't send
 * (a suspension says messaging is paused, never "once a quote is accepted").
 */
export function getThreadView({
  threadId,
  query,
  thread,
  notSelected,
  suspended,
}: ThreadViewInput): ThreadViewName {
  if (!threadId) return 'thread.none'
  if (query === 'loading') return 'thread.loading'
  if (query === 'error') return 'thread.loadError'
  if (query === 'notFound' || !thread) return 'thread.notFound'
  if (thread.kind === ThreadKind.System) return 'thread.system'
  if (thread.canSend) return 'thread.open'
  if (thread.blockedByMe) return 'thread.blocked'
  if (notSelected) return 'thread.notSelected'
  return suspended ? 'thread.suspended' : 'thread.locked'
}
