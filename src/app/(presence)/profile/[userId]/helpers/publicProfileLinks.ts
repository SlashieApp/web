import { publicProfilePath } from '@/app/helpers/publicProfilePath'

import type { PublicProfileContactAction } from '../views'

export function reviewFormPath(
  taskId: string,
  orderId?: string | null,
): string {
  const base = `/tasks/${taskId}/review`
  const id = orderId?.trim()
  if (!id) return base
  return `${base}?orderId=${encodeURIComponent(id)}`
}

/**
 * Review form for the newest unreviewed finished job together
 * (`worker.viewer.reviewTaskId` / `reviewOrderId`); null when the viewer
 * can't review or the API named no job.
 */
export function resolveReviewHref(
  viewer: {
    canLeaveReview: boolean
    reviewTaskId: string | null
    reviewOrderId: string | null
  } | null,
): string | null {
  if (!viewer?.canLeaveReview) return null
  const taskId = viewer.reviewTaskId?.trim()
  const orderId = viewer.reviewOrderId?.trim()
  return taskId && orderId ? reviewFormPath(taskId, orderId) : null
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
