import { formatMessage } from '@/i18n/loadPageI11n'
import { QuoteStatus } from '@codegen/schema'

import type { TaskDetailContextValue } from '../../context/TaskDetailContext'
import type bag from '../../i11n.json'
import type { TaskStatusValue } from './TaskStatusPill'

type TaskDetailI11n = (typeof bag)['en']

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
  copy: TaskDetailI11n['statusHeader'],
): StatusHeaderCopy {
  const { permissions: p, myQuote, isAuthenticated, task } = ctx
  const quoteCount = task?.quotes.length ?? 0

  if (p.isCancelled) {
    return {
      pill: 'CANCELLED',
      headline: copy.cancelledHeadline,
      subtext: copy.cancelledSubtext,
    }
  }

  if (p.isClosed) {
    return {
      pill: 'CLOSED',
      headline: copy.closedHeadline,
      subtext: copy.closedSubtext,
    }
  }

  if (p.isAwarded) {
    if (p.showCustomerCompletionCode) {
      return {
        pill: 'AWARDED',
        headline: copy.awardedCustomerHeadline,
        subtext: copy.awardedCustomerSubtext,
      }
    }
    if (p.showWorkerJobBanner) {
      return {
        pill: 'AWARDED',
        headline: copy.awardedWorkerHeadline,
        subtext: copy.awardedWorkerSubtext,
      }
    }
    return {
      pill: 'AWARDED',
      headline: copy.awardedDefaultHeadline,
      subtext: copy.awardedDefaultSubtext,
    }
  }

  // OPEN
  if (p.isOwner) {
    return quoteCount >= 1
      ? {
          pill: 'OPEN',
          headline: formatMessage(
            quoteCount === 1
              ? copy.ownerQuotesHeadline
              : copy.ownerQuotesHeadlinePlural,
            { count: quoteCount },
          ),
          subtext: copy.ownerQuotesSubtext,
        }
      : {
          pill: 'OPEN',
          headline: copy.ownerLiveHeadline,
          subtext: copy.ownerLiveSubtext,
        }
  }

  if (myQuote?.status === QuoteStatus.Pending) {
    return {
      pill: 'OPEN',
      headline: copy.quoteSentHeadline,
      subtext: copy.quoteSentSubtext,
    }
  }

  if (p.showQuoteForm) {
    return {
      pill: 'OPEN',
      headline:
        quoteCount >= 1
          ? formatMessage(copy.openQuotesWithCountHeadline, {
              count: quoteCount,
            })
          : copy.openQuotesHeadline,
      subtext: copy.openQuotesSubtext,
    }
  }

  if (p.showQuoteUnavailableNotice) {
    return {
      pill: 'OPEN',
      headline: copy.fullHeadline,
      subtext: copy.fullSubtext,
    }
  }

  // Visitor (not authenticated) or any other OPEN viewer.
  return {
    pill: 'OPEN',
    headline: copy.openQuotesHeadline,
    subtext: isAuthenticated
      ? copy.visitorAuthedSubtext
      : copy.visitorGuestSubtext,
  }
}
