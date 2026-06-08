import { capture } from './capture'
import { EVENTS } from './events'

const SESSION_VIEW_KEY_PREFIX = 'ph_worker_view_'

export type WorkerProfileViewSource = 'quote_card' | 'quotes_page' | 'direct'

export type CaptureWorkerProfileViewInput = {
  workerId: string
  workerUserId: string
  viewerUserId?: string | null
  isAuthenticated: boolean
  source?: WorkerProfileViewSource
}

function inferWorkerProfileViewSource(): WorkerProfileViewSource {
  if (typeof window === 'undefined') return 'direct'

  const params = new URLSearchParams(window.location.search)
  if (params.has('fromTask')) return 'quote_card'

  try {
    const referrer = document.referrer
    if (!referrer) return 'direct'
    const refUrl = new URL(referrer)
    if (refUrl.origin !== window.location.origin) return 'direct'
    if (refUrl.pathname === '/quotes') return 'quotes_page'
  } catch {
    return 'direct'
  }

  return 'direct'
}

/** UBA: non-self views only; once per browser session per worker (sessionStorage debounce). */
export function captureWorkerProfileView(
  input: CaptureWorkerProfileViewInput,
): void {
  try {
    if (typeof window === 'undefined') return
    if (input.viewerUserId && input.viewerUserId === input.workerUserId) {
      return
    }

    const sessionKey = `${SESSION_VIEW_KEY_PREFIX}${input.workerId}`
    if (sessionStorage.getItem(sessionKey)) return

    capture(EVENTS.worker_view, {
      worker_id: input.workerId,
      is_authenticated: input.isAuthenticated,
      source: input.source ?? inferWorkerProfileViewSource(),
    })
    sessionStorage.setItem(sessionKey, '1')
  } catch {
    // Never throw from analytics.
  }
}
