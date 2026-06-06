import { capture } from './capture'
import { EVENTS } from './events'

const SESSION_VIEW_KEY_PREFIX = 'ph_task_view_'

export type TaskDetailViewerRole = 'owner' | 'visitor' | 'worker'
export type TaskDetailViewSource =
  | 'direct'
  | 'browse'
  | 'notification'
  | 'search'

export type CaptureTaskDetailViewInput = {
  taskId: string
  taskSlug: string
  viewerRole: TaskDetailViewerRole
  isAuthenticated: boolean
  source?: TaskDetailViewSource
}

function inferTaskDetailViewSource(): TaskDetailViewSource {
  if (typeof window === 'undefined') return 'direct'

  const params = new URLSearchParams(window.location.search)
  if (params.get('from') === 'notification' || params.has('notification_id')) {
    return 'notification'
  }
  if (params.get('from') === 'search' || params.has('q')) {
    return 'search'
  }

  try {
    const referrer = document.referrer
    if (!referrer) return 'direct'
    const refUrl = new URL(referrer)
    if (refUrl.origin !== window.location.origin) return 'direct'
    const path = refUrl.pathname
    if (path === '/' || path === '/tasks') return 'browse'
  } catch {
    return 'direct'
  }

  return 'direct'
}

/** UBA: once per browser session per task (sessionStorage debounce). */
export function captureTaskDetailView(input: CaptureTaskDetailViewInput): void {
  try {
    if (typeof window === 'undefined') return
    const sessionKey = `${SESSION_VIEW_KEY_PREFIX}${input.taskId}`
    if (sessionStorage.getItem(sessionKey)) return
    sessionStorage.setItem(sessionKey, '1')

    capture(EVENTS.task_view, {
      task_id: input.taskId,
      task_slug: input.taskSlug,
      viewer_role: input.viewerRole,
      is_authenticated: input.isAuthenticated,
      source: input.source ?? inferTaskDetailViewSource(),
    })
  } catch {
    // Never throw from analytics.
  }
}

export function resolveTaskDetailViewerRole(options: {
  isOwner: boolean
  isAuthenticated: boolean
  hasWorkerProfile: boolean
}): TaskDetailViewerRole {
  if (options.isOwner) return 'owner'
  if (options.isAuthenticated && options.hasWorkerProfile) return 'worker'
  return 'visitor'
}
