import { formatMessage } from '@/i18n/loadPageI11n'
import { formatBudgetAmount } from '@/utils/price'
import { QuoteStatus } from '@codegen/schema'

import type { TaskDetailContextValue } from '../../context/TaskDetailContext'
import type bag from '../../i11n.json'
import type { TaskStatusValue } from '../ui/TaskStatusPill'

type TaskDetailI11n = (typeof bag)['en']

export type StatusHeaderCopy = {
  /** StatusPill family for the current task phase. */
  pill: TaskStatusValue
  headline: string
  subtext: string
}

/** "You can earn £120" (an hour / a day for those budgets); no budget falls back. */
function earnHeadline(
  task: TaskDetailContextValue['task'],
  copy: TaskDetailI11n['statusHeader'],
): string {
  const budget = task?.budget
  const amount = budget ? formatBudgetAmount(budget, '') : ''
  if (!amount) return copy.openQuotesHeadline
  const type = budget?.type?.trim().toUpperCase().replaceAll(' ', '_')
  const template =
    type === 'PER_HOUR'
      ? copy.earnHourlyHeadline
      : type === 'PER_DAY'
        ? copy.earnDailyHeadline
        : copy.earnHeadline
  return formatMessage(template, { amount })
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

  if (p.isJobCompleted) {
    return {
      pill: 'COMPLETED',
      headline: copy.completedHeadline,
      subtext: copy.completedSubtext,
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
    if (p.isOrderConflict) {
      return {
        pill: 'AWARDED',
        headline: copy.conflictHeadline,
        subtext: copy.conflictSubtext,
      }
    }
    if (p.isOwner && p.showOrderActions) {
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

  if (p.showBecomeWorkerCta) {
    return {
      pill: 'OPEN',
      headline: earnHeadline(task, copy),
      subtext: copy.earnSubtext,
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
