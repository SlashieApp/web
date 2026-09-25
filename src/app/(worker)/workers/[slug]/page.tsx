import { notFound, permanentRedirect } from 'next/navigation'

import { fetchWorkerProfileUserId } from '@/app/helpers/legacyProfileRedirect'
import { PublicUserStatus } from '@/app/user/[id]/components/ui/PublicUserStatus'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n } from '@/i18n/loadPageI11n'

import bag from './i11n.json'

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
 * fallback (missing → 404, lookup error → retry).
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

  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  return (
    <PublicUserStatus
      variant="error"
      title={copy.errorTitle}
      description={copy.errorDescription}
    />
  )
}
