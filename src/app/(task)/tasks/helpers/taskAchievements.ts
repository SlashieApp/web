import { taskCategoryDisplayLabel } from '@/app/(task)/helpers/taskCategories'

/**
 * Percentages are a mix, not a ranking. Hide them until there are enough
 * completed jobs that a share is not a tiny-sample vanity stat.
 */
export const CATEGORY_MIX_PERCENT_MIN = 3

export type CategoryMixInput = {
  category?: string | null
  count?: number | null
  percent?: number | null
}

export type AgreedTotalInput = {
  amount?: number | null
  currency?: string | null
} | null

/** `me.taskAchievements.worker` (BE-62). */
export type WorkerAchievementsInput = {
  hasActivity?: boolean | null
  completedJobsCount?: number | null
  categoryMix?: readonly CategoryMixInput[] | null
  mostWorkedLocation?: string | null
  quotesThisMonth?: number | null
  quotesFreeCap?: number | null
  quotesUnlimited?: boolean | null
  streakWeeks?: number | null
  agreedTotalsOnCompletedJobs?: AgreedTotalInput
}

/** `me.taskAchievements.customer` (BE-62). */
export type CustomerAchievementsInput = {
  hasActivity?: boolean | null
  hostedCompletedCount?: number | null
  categoryMix?: readonly CategoryMixInput[] | null
  mostUsedLocation?: string | null
  quotesReceived?: number | null
  agreedTotalsOnCompletedJobs?: AgreedTotalInput
}

export type QuoteAllowanceInput = {
  used: number | null
  cap: number | null
  unlimited: boolean
}

export type AchievementQuotes =
  | { kind: 'unlimited' }
  | { kind: 'ofCap'; used: number; cap: number }
  | { kind: 'received'; count: number }

export type AchievementCategoryMix = {
  category: string
  label: string
  count: number | null
  percent: number | null
}

export type AchievementPanel = {
  role: 'worker' | 'customer'
  completedCount: number | null
  categoryMix: AchievementCategoryMix[]
  location: string | null
  quotes: AchievementQuotes | null
  streakWeeks: number | null
  /** Formatted agreed total. Null when the API has not returned an amount. */
  agreedTotalLabel: string | null
  sparse: boolean
}

export function achievementRoleVisibility(input: {
  hasWorkerProfile: boolean
  sentQuoteCount: number
  postedTaskCount: number
  workerHasActivity?: boolean | null
  customerHasActivity?: boolean | null
}): { worker: boolean; customer: boolean } {
  return {
    worker:
      input.hasWorkerProfile ||
      input.sentQuoteCount > 0 ||
      input.workerHasActivity === true,
    customer: input.postedTaskCount > 0 || input.customerHasActivity === true,
  }
}

export function formatAgreedTotal(amount: number, currency: string): string {
  const code = currency.trim() || 'GBP'
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount)
  }
}

function agreedTotalLabel(total: AgreedTotalInput | undefined): string | null {
  const amount = total?.amount
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null
  return formatAgreedTotal(amount, total?.currency ?? 'GBP')
}

function categoryMix(
  items: readonly CategoryMixInput[] | null | undefined,
  completedCount: number | null,
): AchievementCategoryMix[] {
  const rows = (items ?? []).flatMap((item) => {
    const category = item.category?.trim()
    if (!category) return []
    const count =
      typeof item.count === 'number' && Number.isFinite(item.count)
        ? item.count
        : null
    const percent =
      typeof item.percent === 'number' && Number.isFinite(item.percent)
        ? item.percent
        : null
    if ((count == null || count <= 0) && percent == null) return []
    return [{ category, count, percent }]
  })
  const counted = rows.reduce((sum, row) => sum + (row.count ?? 0), 0)
  const basis = completedCount ?? counted
  const showPercent = basis >= CATEGORY_MIX_PERCENT_MIN && rows.length > 0
  return rows.map((row) => {
    const percent = !showPercent
      ? null
      : row.count != null && counted > 0
        ? Math.round((row.count / counted) * 100)
        : row.percent != null
          ? Math.round(row.percent)
          : null
    return {
      category: row.category,
      label: taskCategoryDisplayLabel(row.category) ?? row.category,
      count: row.count,
      percent,
    }
  })
}

function workerQuotes(
  worker: WorkerAchievementsInput | null,
  allowance: QuoteAllowanceInput,
): AchievementQuotes | null {
  const unlimited = worker?.quotesUnlimited === true || allowance.unlimited
  if (unlimited) return { kind: 'unlimited' }
  const used = worker?.quotesThisMonth ?? allowance.used
  const cap = worker?.quotesFreeCap ?? allowance.cap
  if (
    typeof used === 'number' &&
    typeof cap === 'number' &&
    Number.isFinite(used) &&
    Number.isFinite(cap) &&
    cap > 0
  ) {
    return { kind: 'ofCap', used, cap }
  }
  return null
}

function positiveStreak(weeks: number | null | undefined): number | null {
  if (typeof weeks !== 'number' || !Number.isFinite(weeks) || weeks < 1) {
    return null
  }
  return Math.round(weeks)
}

function finiteCount(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return value
}

export function buildAchievementPanels(input: {
  showWorker: boolean
  showCustomer: boolean
  worker: WorkerAchievementsInput | null
  customer: CustomerAchievementsInput | null
  quoteAllowance: QuoteAllowanceInput
  /** Quotes on hosted tasks, used until `customer.quotesReceived` is returned. */
  localQuotesReceived: number | null
}): AchievementPanel[] {
  const panels: AchievementPanel[] = []

  if (input.showWorker) {
    const completedCount = finiteCount(input.worker?.completedJobsCount)
    const mix = categoryMix(input.worker?.categoryMix, completedCount)
    const location = input.worker?.mostWorkedLocation?.trim() || null
    const agreed = agreedTotalLabel(input.worker?.agreedTotalsOnCompletedJobs)
    panels.push({
      role: 'worker',
      completedCount,
      categoryMix: mix,
      location,
      quotes: workerQuotes(input.worker, input.quoteAllowance),
      streakWeeks: positiveStreak(input.worker?.streakWeeks),
      agreedTotalLabel: agreed,
      sparse:
        completedCount == null && mix.length === 0 && !location && !agreed,
    })
  }

  if (input.showCustomer) {
    const completedCount = finiteCount(input.customer?.hostedCompletedCount)
    const mix = categoryMix(input.customer?.categoryMix, completedCount)
    const location = input.customer?.mostUsedLocation?.trim() || null
    const agreed = agreedTotalLabel(input.customer?.agreedTotalsOnCompletedJobs)
    const received =
      finiteCount(input.customer?.quotesReceived) ??
      finiteCount(input.localQuotesReceived)
    panels.push({
      role: 'customer',
      completedCount,
      categoryMix: mix,
      location,
      quotes: received == null ? null : { kind: 'received', count: received },
      streakWeeks: null,
      agreedTotalLabel: agreed,
      sparse:
        completedCount == null &&
        mix.length === 0 &&
        !location &&
        !agreed &&
        received == null,
    })
  }

  return panels
}
