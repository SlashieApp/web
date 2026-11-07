/**
 * Which copy a failed `askWorkerToQuote` shows (FE-507, spec E). The API's
 * refusal never says which rule hid a worker, so "not available" is one line.
 */
export type QuoteInviteErrorKey =
  | 'alreadySent'
  | 'taskLimit'
  | 'dailyLimit'
  | 'notAvailable'
  | 'taskClosed'

const KEY_BY_CODE: Record<string, QuoteInviteErrorKey> = {
  QUOTE_INVITE_ALREADY_SENT: 'alreadySent',
  QUOTE_INVITE_TASK_LIMIT: 'taskLimit',
  QUOTE_INVITE_DAILY_LIMIT: 'dailyLimit',
  QUOTE_INVITE_NOT_AVAILABLE: 'notAvailable',
  TASK_NOT_OPEN: 'taskClosed',
  TASK_SUSPENDED: 'taskClosed',
  TASK_NOT_FOUND: 'taskClosed',
}

/** Null for any other code: the app's usual generic error shows. */
export function quoteInviteErrorKey(
  code: string | undefined,
): QuoteInviteErrorKey | null {
  return (code && KEY_BY_CODE[code]) || null
}
