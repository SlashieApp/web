import { notFound, permanentRedirect } from 'next/navigation'

import { PublicProfileStatus } from '@/app/(presence)/profile/[userId]/components/ui/PublicProfileStatus'
import { loadError } from '@/app/(presence)/profile/[userId]/views/loadError'
import { fetchWorkerProfileUserId } from '@/app/helpers/legacyProfileRedirect'

type Search = Record<string, string | string[] | undefined>

function searchString(search: Search): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(search)) {
    if (typeof value === 'string') params.set(key, value)
    else if (Array.isArray(value)) {
      for (const item of value) params.append(key, item)
    }
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

/**
 * Retired `/workers/[workerId]`. The segment is the worker document id.
 * `proxy` 301s when `workerProfileRedirect` resolves; this page is the
 * fallback (missing → 404, lookup error → the profile's error screen).
 */
export default async function LegacyWorkerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Search>
}) {
  const { slug } = await params
  const search = await searchParams
  const lookup = await fetchWorkerProfileUserId(slug)
  if (lookup.status === 'ok') {
    permanentRedirect(`/profile/${lookup.userId}${searchString(search)}`)
  }
  if (lookup.status === 'missing') notFound()

  return <PublicProfileStatus config={loadError} />
}
