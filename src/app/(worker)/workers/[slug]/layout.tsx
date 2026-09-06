import type { Metadata } from 'next'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'

import { getWorkerForSeoPage } from './helpers/getWorkerForSeoPage'
import bag from './i11n.json'

function absoluteUrlFromEnv(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`
      : '')
  if (!base) return pathOrUrl
  return `${base}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const locale = await getRequestLocale()
  const { slug } = await params
  const copy = loadPageI11n(bag, locale)
  const { worker } = await getWorkerForSeoPage(slug)
  const displayName = worker?.profile?.name?.trim() || null
  const title = displayName
    ? `${displayName} — Worker on Slashie`
    : copy.metadata.title
  const rawDescription =
    worker?.tagline?.trim() ||
    worker?.bio?.trim() ||
    worker?.serviceAreaLabel?.trim() ||
    null
  const description = rawDescription
    ? rawDescription.length > 160
      ? `${rawDescription.slice(0, 157)}…`
      : rawDescription
    : copy.metadata.description
  const canonicalPath = `/workers/${slug}`
  const avatarUrl = worker?.profile?.avatarUrl?.trim()
  const base = metadataFromI11n(copy.metadata, { locale, path: canonicalPath })

  return {
    ...base,
    title,
    description,
    openGraph: {
      ...base.openGraph,
      type: 'profile',
      url: absoluteUrlFromEnv(canonicalPath),
      title,
      description,
      images: avatarUrl ? [{ url: absoluteUrlFromEnv(avatarUrl) }] : undefined,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: avatarUrl ? [absoluteUrlFromEnv(avatarUrl)] : undefined,
    },
  }
}

export default function WorkerProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
