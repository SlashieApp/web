import type bag from '../i11n.json'

/**
 * Find worker (FE-603, BE-149; Ryan 22 Nov): on an open task, a poster with
 * Slashie Pro gets the workers who fit it, best first, and asks any of them
 * to quote. The list, its order and who is in it are the API's
 * (`taskWorkerMatches`); this only words it. The Expo app's `findWorker.ts`
 * reads the same.
 */
export type FindWorkerCopy = (typeof bag)['en']

/** One row of `taskWorkerMatches`, as the query reads it. */
export type FindWorkerMatch = {
  matchedCategories: readonly string[]
  distanceMiles: number
  alreadyAsked: boolean
  worker: {
    id: string
    userId: string
    hasPro?: boolean | null
    ratingSummary?: { average?: number | null; count?: number | null } | null
    user?: {
      profile?: { name?: string | null; avatarUrl?: string | null } | null
    } | null
    profile?: { avatarUrl?: string | null } | null
  }
}

export type FindWorkerRow = {
  workerUserId: string
  name: string
  /** As the Ask button and the toast say it. */
  firstName: string
  avatarUrl: string | null
  pro: boolean
  /** "Fits: Plumbing, Tiling". */
  matchesLabel: string
  /** "1.2 miles away", or "Nearby". */
  distanceLabel: string
  /** "4.8 (12)"; null with no reviews. */
  ratingLabel: string | null
  alreadyAsked: boolean
}

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in values ? String(values[key]) : `{${key}}`,
  )

/** "Nearby" under a tenth of a mile; else the miles to one decimal place. */
export function findWorkerDistanceLabel(
  miles: number,
  copy: FindWorkerCopy,
): string {
  if (!Number.isFinite(miles) || miles < 0.1) return copy.nearby
  const rounded = Math.round(miles * 10) / 10
  if (rounded === 1) return copy.distanceOne
  return fill(copy.distance, {
    miles: Number.isInteger(rounded) ? rounded : rounded.toFixed(1),
  })
}

/** The rows in the API's order: it sorts by fit, then distance, then name. */
export function findWorkerRows(
  matches: readonly FindWorkerMatch[] | null | undefined,
  copy: FindWorkerCopy,
): FindWorkerRow[] {
  return (matches ?? []).map((match) => {
    const name = match.worker.user?.profile?.name?.trim() || copy.fallbackWorker
    const rating = match.worker.ratingSummary
    const count = rating?.count ?? 0
    return {
      workerUserId: match.worker.userId,
      name,
      firstName: name.split(/\s+/)[0] ?? name,
      avatarUrl:
        match.worker.profile?.avatarUrl ??
        match.worker.user?.profile?.avatarUrl ??
        null,
      pro: match.worker.hasPro === true,
      matchesLabel: fill(copy.matches, {
        categories: match.matchedCategories.join(', '),
      }),
      distanceLabel: findWorkerDistanceLabel(match.distanceMiles, copy),
      ratingLabel:
        count > 0 && typeof rating?.average === 'number'
          ? fill(copy.rating, { average: rating.average.toFixed(1), count })
          : null,
      alreadyAsked: match.alreadyAsked,
    }
  })
}

/** How many more workers the owner may ask about the task, in words. */
export function findWorkerLeftLabel(
  usage: { limit: number; left: number } | null,
  copy: FindWorkerCopy,
): string | null {
  if (!usage) return null
  if (usage.left <= 0) return fill(copy.leftNone, { limit: usage.limit })
  if (usage.left === 1) return copy.leftOne
  return fill(copy.left, { left: usage.left })
}

/** What the page shows in place of the list when the API refuses it. */
export type FindWorkerState = 'proRequired' | 'closed' | 'unavailable' | 'error'

const STATE_BY_CODE: Record<string, FindWorkerState> = {
  PRO_REQUIRED: 'proRequired',
  TASK_NOT_OPEN: 'closed',
  TASK_SUSPENDED: 'closed',
  TASK_NOT_FOUND: 'unavailable',
  FORBIDDEN: 'unavailable',
  UNAUTHENTICATED: 'unavailable',
}

export function findWorkerState(code: string | undefined): FindWorkerState {
  return (code && STATE_BY_CODE[code]) || 'error'
}

/**
 * The task's main button: Find worker in place of Preview, for a poster whose
 * account has Slashie Pro, on an open task that is not suspended (the API
 * refuses a suspended one). Everyone else keeps what they had.
 */
export function withFindWorker<Action extends string>(
  action: Action | null,
  state: { hasPro: boolean; isSuspended: boolean },
): Action | 'findWorker' | null {
  return action === 'preview' && state.hasPro && !state.isSuspended
    ? 'findWorker'
    : action
}
