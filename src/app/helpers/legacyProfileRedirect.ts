export type LegacyWorkerProfileMatch = {
  workerId: string
  /** Unprefixed English, or `/zh-hk`. Explicit `/en` collapses to English. */
  localePrefix: '' | '/zh-hk'
}

const LEGACY_WORKER_PROFILE = /^\/(?:(en|zh-hk)\/)?workers\/([^/]+)\/?$/

/**
 * `/workers/[workerId]` (one segment: the worker document id). The workers
 * index (`/workers`) does not match.
 */
export function matchLegacyWorkerProfile(
  pathname: string,
): LegacyWorkerProfileMatch | null {
  const match = pathname.match(LEGACY_WORKER_PROFILE)
  if (!match) return null
  const workerId = match[2]?.trim()
  if (!workerId || workerId === '.' || workerId === '..') return null
  if (workerId.includes('\\')) return null
  return { workerId, localePrefix: match[1] === 'zh-hk' ? '/zh-hk' : '' }
}

export function profileRedirectPath(
  userId: string,
  localePrefix: '' | '/zh-hk',
): string {
  return `${localePrefix}/profile/${userId}`
}

const WORKER_REDIRECT_QUERY = `query WorkerProfileRedirect($workerId: ID!) {
  workerProfileRedirect(workerId: $workerId) { userId }
}`

export type WorkerRedirectLookup =
  | { status: 'ok'; userId: string }
  | { status: 'missing' }
  | { status: 'error' }

export function userIdFromWorkerRedirectPayload(json: unknown): string | null {
  if (!json || typeof json !== 'object') return null
  const data = (
    json as { data?: { workerProfileRedirect?: { userId?: unknown } | null } }
  ).data
  const userId = data?.workerProfileRedirect?.userId
  if (typeof userId !== 'string') return null
  const trimmed = userId.trim()
  return trimmed || null
}

/**
 * Map a legacy `/workers/[workerId]` segment to `users._id`.
 * Hidden and disabled accounts still resolve; `publicProfile` then returns null.
 */
export async function fetchWorkerProfileUserId(
  workerId: string,
): Promise<WorkerRedirectLookup> {
  const base = process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim()
  if (!base) return { status: 'error' }
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: WORKER_REDIRECT_QUERY,
        variables: { workerId },
      }),
      cache: 'no-store',
    })
    if (!response.ok) return { status: 'error' }
    const json: unknown = await response.json()
    const userId = userIdFromWorkerRedirectPayload(json)
    if (userId) return { status: 'ok', userId }
    const errors = (json as { errors?: unknown }).errors
    if (errors && !userIdFromWorkerRedirectPayload(json)) {
      const data = (json as { data?: unknown }).data
      if (data == null) return { status: 'error' }
    }
    return { status: 'missing' }
  } catch {
    return { status: 'error' }
  }
}
