import { formatMessage } from '@/i18n/loadPageI11n'

import type bag from './i11n.json'
import { QUOTE_INVITE_LIMITS, quoteInviteLimits } from './limits'

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

type QuoteInviteErrorCopy = (typeof bag)['en']['errors']

/**
 * The line a refused invitation shows, with its numbers from the limits
 * (FE-603). At the task's limit without Slashie Pro it says what the limit
 * is and what Pro gives; with Pro it says the most was reached.
 */
export function quoteInviteErrorText(
  key: QuoteInviteErrorKey,
  errors: QuoteInviteErrorCopy,
  input: { name: string; hasPro: boolean },
): string {
  if (key === 'taskLimit' && !input.hasPro) {
    return formatMessage(errors.taskLimitFree, {
      proLimit: QUOTE_INVITE_LIMITS.pro.perTask,
    })
  }
  const limits = quoteInviteLimits(input.hasPro)
  return formatMessage(errors[key], {
    name: input.name,
    limit: key === 'dailyLimit' ? limits.perDay : limits.perTask,
  })
}
