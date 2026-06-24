import type { TaskStatusValue } from '@ui'

import { QuoteStatus } from '@codegen/schema'
import type { TaskDetailContextValue } from '../../context/TaskDetailContext'

export type StatusHeaderCopy = {
  /** StatusPill family for the current task phase. */
  pill: TaskStatusValue
  headline: string
  subtext: string
}

/**
 * Presentation-only selector: maps the EXISTING permission flags + context to the
 * Uber-style status headline for the current viewer/state (see the state matrix).
 * No data or permission logic here - pure copy selection over flags.
 */
export function selectStatusHeaderCopy(
  ctx: Pick<
    TaskDetailContextValue,
    'permissions' | 'myQuote' | 'isAuthenticated' | 'task'
  >,
): StatusHeaderCopy {
  const { permissions: p, myQuote, isAuthenticated, task } = ctx
  const quoteCount = task?.quotes.length ?? 0

  if (p.isCancelled) {
    return {
      pill: 'CANCELLED',
      headline: 'Task cancelled',
      subtext: 'This task is no longer active.',
    }
  }

  if (p.isClosed) {
    return {
      pill: 'CLOSED',
      headline: 'Job complete',
      subtext: 'This job has been completed and closed.',
    }
  }

  if (p.isAwarded) {
    if (p.showCustomerCompletionCode) {
      return {
        pill: 'AWARDED',
        headline: 'Worker booked - share your code when done',
        subtext:
          'Coordinate on site, pay them directly, then share your completion code.',
      }
    }
    if (p.showWorkerJobBanner) {
      return {
        pill: 'AWARDED',
        headline: 'Job confirmed',
        subtext: 'You are booked. Complete the work, then enter the code.',
      }
    }
    return {
      pill: 'AWARDED',
      headline: 'Worker booked',
      subtext: 'This task has been awarded to a worker.',
    }
  }

  // OPEN
  if (p.isOwner) {
    return quoteCount >= 1
      ? {
          pill: 'OPEN',
          headline: `${quoteCount} ${quoteCount === 1 ? 'quote' : 'quotes'} - compare and accept`,
          subtext: 'Review each quote and accept the worker you want.',
        }
      : {
          pill: 'OPEN',
          headline: 'Your task is live - reaching workers',
          subtext:
            'Nearby workers can see your task. Share it to get quotes faster.',
        }
  }

  if (myQuote?.status === QuoteStatus.Pending) {
    return {
      pill: 'OPEN',
      headline: 'Quote sent',
      subtext:
        'The customer has your quote. We will notify you of any response.',
    }
  }

  if (p.showQuoteForm) {
    return {
      pill: 'OPEN',
      headline:
        quoteCount >= 1
          ? `Open for quotes - ${quoteCount} so far`
          : 'Open for quotes',
      subtext: 'Send your price and availability to win this job.',
    }
  }

  if (p.showQuoteUnavailableNotice) {
    return {
      pill: 'OPEN',
      headline: 'This task is full',
      subtext: 'This task is no longer accepting new quotes.',
    }
  }

  // Visitor (not authenticated) or any other OPEN viewer.
  return {
    pill: 'OPEN',
    headline: 'Open for quotes',
    subtext: isAuthenticated
      ? 'This task is open for quotes.'
      : 'Sign in as a worker to send a quote.',
  }
}
