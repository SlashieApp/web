import { isAcceptedQuoteStatus } from '@/utils/taskJobSchedule'

import {
  type OwnerInterestLevel,
  type TaskDetailRecord,
  averageHoursToQuotes,
  ownerInterestLevel,
} from './taskDetailUtils'

export type TaskOwnerAnalytics = {
  views: number | null
  quoteCount: number
  acceptedCount: number
  interest: OwnerInterestLevel
  averageHoursToQuote: number | null
}

export function taskOwnerAnalytics(task: TaskDetailRecord): TaskOwnerAnalytics {
  const quoteCount = task.quotes.length
  return {
    views: task.views ?? null,
    quoteCount,
    acceptedCount: task.quotes.filter((quote) =>
      isAcceptedQuoteStatus(quote.status),
    ).length,
    interest: ownerInterestLevel(quoteCount),
    averageHoursToQuote: averageHoursToQuotes(task),
  }
}
