import { publicProfilePath } from '@/app/helpers/publicProfilePath'

import type { PublicProfileContactAction } from '../views'

export type ReviewableOrder = {
  id: string
  taskId: string
  workerUserId: string
  closedAt?: string | null
  createdAt?: string | null
}

function timestamp(value: string | null | undefined): number {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

/**
 * Most recent COMPLETED order where this profile user did the work.
 * `closedAt` wins; `createdAt` breaks ties.
 */
export function pickReviewTarget(
  profileUserId: string,
  orders: readonly ReviewableOrder[],
): { taskId: string; orderId: string } | null {
  const matches = orders.filter(
    (order) =>
      order.workerUserId === profileUserId && order.taskId.trim() && order.id,
  )
  matches.sort((a, b) => {
    const closed = timestamp(b.closedAt) - timestamp(a.closedAt)
    if (closed !== 0) return closed
    return timestamp(b.createdAt) - timestamp(a.createdAt)
  })
  const picked = matches[0]
  if (!picked) return null
  return { taskId: picked.taskId, orderId: picked.id }
}

export function reviewFormPath(
  taskId: string,
  orderId?: string | null,
): string {
  const base = `/tasks/${taskId}/review`
  const id = orderId?.trim()
  if (!id) return base
  return `${base}?orderId=${encodeURIComponent(id)}`
}

/** Review form for the newest finished order; null until one is loaded. */
export function resolveReviewHref(input: {
  canLeaveReview: boolean
  profileUserId: string
  orders: readonly ReviewableOrder[]
}): string | null {
  if (!input.canLeaveReview) return null
  const picked = pickReviewTarget(input.profileUserId, input.orders)
  return picked ? reviewFormPath(picked.taskId, picked.orderId) : null
}

/**
 * Where the main button goes. Bare paths: the `@ui` Link adds the locale.
 * A quote or job without a task never reaches here (the view falls back to
 * `worker.visitor`), so those cases share Post a task's path.
 */
export function contactHref(
  action: PublicProfileContactAction,
  target: {
    profileUserId: string
    excludeTaskId: string | null
    relatedTaskId: string | null
  },
): string {
  const taskId = target.relatedTaskId
  switch (action) {
    case 'signIn': {
      const back = publicProfilePath(target.profileUserId, {
        excludeTaskId: target.excludeTaskId,
      })
      return `/login?next=${encodeURIComponent(back)}`
    }
    case 'viewQuote':
      return taskId ? `/tasks/${taskId}#task-quotes` : '/tasks/create'
    case 'openJob':
      return taskId ? `/tasks/${taskId}` : '/tasks/create'
    case 'postTask':
      return '/tasks/create'
  }
}
