import { ThreadKind } from '@codegen/schema'

import type { ThreadViewInput, ThreadViewName } from './types'

/**
 * The one place that decides what the open conversation shows. Precedence:
 * nothing picked, the query, Slashie threads, then why you can or can't send.
 */
export function getThreadView({
  threadId,
  query,
  thread,
  notSelected,
}: ThreadViewInput): ThreadViewName {
  if (!threadId) return 'thread.none'
  if (query === 'loading') return 'thread.loading'
  if (query === 'error') return 'thread.loadError'
  if (query === 'notFound' || !thread) return 'thread.notFound'
  if (thread.kind === ThreadKind.System) return 'thread.system'
  if (thread.canSend) return 'thread.open'
  if (thread.blockedByMe) return 'thread.blocked'
  return notSelected ? 'thread.notSelected' : 'thread.locked'
}
