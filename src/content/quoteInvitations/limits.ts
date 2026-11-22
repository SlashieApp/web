/**
 * How many workers a customer may ask to quote (BE-149; Ryan 22 Nov). Anyone
 * can ask: one worker per task without Slashie Pro, 30 with it. The day's
 * limit (10, or 60 with Pro) is the API's safeguard across tasks. The API
 * enforces both; these only word the screen.
 */
export const QUOTE_INVITE_LIMITS = {
  free: { perTask: 1, perDay: 10 },
  pro: { perTask: 30, perDay: 60 },
} as const

export type QuoteInviteLimits = { perTask: number; perDay: number }

export function quoteInviteLimits(hasPro: boolean): QuoteInviteLimits {
  return hasPro ? QUOTE_INVITE_LIMITS.pro : QUOTE_INVITE_LIMITS.free
}

/**
 * What a task's invitation count reads as, from the API's
 * `Task.quoteInvitationLimit` and `quoteInvitationsLeft` (the owner's only).
 * Every invitation sent counts, also one the worker answered with a quote.
 * Null when the API said nothing (someone else's task, an older reply).
 */
export function quoteInviteUsage(task: {
  quoteInvitationLimit?: number | null
  quoteInvitationsLeft?: number | null
}): { limit: number; used: number; left: number } | null {
  const limit = task.quoteInvitationLimit
  const left = task.quoteInvitationsLeft
  if (typeof limit !== 'number' || typeof left !== 'number') return null
  const remaining = Math.max(0, Math.min(left, limit))
  return { limit, left: remaining, used: Math.max(0, limit - remaining) }
}
