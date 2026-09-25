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
}

/** `TaskAchievementLocationStat` — most-worked or most-used place. */
export type AchievementLocationInput = {
  label?: string | null
  count?: number | null
} | null

/** `me.taskAchievements.worker` (BE-62). */
export type WorkerAchievementsInput = {
  hasActivity?: boolean | null
  completedJobsCount?: number | null
  categoryMix?: readonly CategoryMixInput[] | null
  mostWorkedLocation?: AchievementLocationInput
  quotesThisMonth?: number | null
  freeQuotesPerMonth?: number | null
  hasUnlimitedQuotes?: boolean | null
  streakWeeks?: number | null
  agreedTotalsOnCompletedJobs?: readonly AgreedTotalInput[] | null
}

/** `me.taskAchievements.customer` (BE-62). */
export type CustomerAchievementsInput = {
  hasActivity?: boolean | null
  hostedCompletedCount?: number | null
  categoryMix?: readonly CategoryMixInput[] | null
  mostUsedLocation?: AchievementLocationInput
  quotesReceived?: number | null
  agreedTotalsOnCompletedJobs?: readonly AgreedTotalInput[] | null
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

function locationLabel(
  stat: AchievementLocationInput | undefined,
): string | null {
  return stat?.label?.trim() || null
}

/**
 * Agreed totals are a list grouped by currency. An empty list is £0 (the API
 * answered). A missing list means the payload has not arrived.
 */
function agreedTotalLabel(
  totals: readonly AgreedTotalInput[] | null | undefined,
): string | null {
  if (totals == null) return null
  const rows = totals.flatMap((total) => {
    const amount = total?.amount
    if (typeof amount !== 'number' || !Number.isFinite(amount)) return []
    return [formatAgreedTotal(amount, total.currency ?? 'GBP')]
  })
  if (rows.length === 0) return formatAgreedTotal(0, 'GBP')
  return rows.join(' · ')
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

export type CategoryMixShare = {
  category: string
  label: string
  count: number
  percent: number
}

/**
 * Integer shares of the mix that sum to 100. Used by the in-hub pie.
 * Compact cards still read `AchievementCategoryMix.percent`, which stays null
 * until `CATEGORY_MIX_PERCENT_MIN` completed jobs.
 */
export function categoryMixShares(
  mix: readonly AchievementCategoryMix[],
): CategoryMixShare[] {
  const counted = mix.flatMap((item) => {
    const count = item.count
    if (typeof count !== 'number' || count <= 0) return []
    return [{ item, count }]
  })
  const total = counted.reduce((sum, row) => sum + row.count, 0)
  if (total <= 0) {
    return mix.flatMap((item) => {
      const percent = item.percent
      if (typeof percent !== 'number' || percent <= 0) return []
      return [
        {
          category: item.category,
          label: item.label,
          count: item.count ?? 0,
          percent: Math.round(percent),
        },
      ]
    })
  }

  const exact = counted.map(({ item, count }) => ({
    category: item.category,
    label: item.label,
    count,
    exact: (count / total) * 100,
  }))
  const floors = exact.map((row) => Math.floor(row.exact))
  let leftover = 100 - floors.reduce((sum, value) => sum + value, 0)
  const order = exact
    .map((row, index) => ({
      index,
      frac: row.exact - (floors[index] ?? 0),
    }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index)
  for (const entry of order) {
    if (leftover <= 0) break
    floors[entry.index] = (floors[entry.index] ?? 0) + 1
    leftover -= 1
  }
  return exact.map((row, index) => ({
    category: row.category,
    label: row.label,
    count: row.count,
    percent: floors[index] ?? 0,
  }))
}

function workerQuotes(
  worker: WorkerAchievementsInput | null,
  allowance: QuoteAllowanceInput,
): AchievementQuotes | null {
  const unlimited = worker?.hasUnlimitedQuotes ?? allowance.unlimited
  if (unlimited) return { kind: 'unlimited' }
  const used = worker?.quotesThisMonth ?? allowance.used
  const cap = worker?.freeQuotesPerMonth ?? allowance.cap
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
}): AchievementPanel[] {
  const panels: AchievementPanel[] = []

  if (input.showWorker) {
    const completedCount = finiteCount(input.worker?.completedJobsCount)
    const mix = categoryMix(input.worker?.categoryMix, completedCount)
    const location = locationLabel(input.worker?.mostWorkedLocation)
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
    const location = locationLabel(input.customer?.mostUsedLocation)
    const agreed = agreedTotalLabel(input.customer?.agreedTotalsOnCompletedJobs)
    const received = finiteCount(input.customer?.quotesReceived)
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
