import type { Metadata } from 'next'
import { Suspense } from 'react'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import {
  formatMessage,
  loadPageI11n,
  metadataFromI11n,
} from '@/i18n/loadPageI11n'

import { getPublicProfileForSeo } from './helpers/getPublicProfileForSeo'
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
  params: Promise<{ userId: string }>
}): Promise<Metadata> {
  const locale = await getRequestLocale()
  const { userId } = await params
  const copy = loadPageI11n(bag, locale)
  const { profile } = await getPublicProfileForSeo(userId)
  const displayName = profile?.profile.name?.trim() || null
  const title = displayName
    ? formatMessage(copy.metadata.titleWithName, { name: displayName })
    : copy.metadata.title
  const rawDescription =
    profile?.worker?.tagline?.trim() ||
    profile?.worker?.bio?.trim() ||
    profile?.worker?.serviceAreaLabel?.trim() ||
    null
  const description = displayName
    ? rawDescription
      ? rawDescription.length > 160
        ? `${rawDescription.slice(0, 157)}…`
        : rawDescription
      : formatMessage(copy.metadata.descriptionWithName, { name: displayName })
    : copy.metadata.description
  const canonicalPath = `/profile/${userId}`
  const avatarUrl = profile?.profile.avatarUrl?.trim()
  const base = metadataFromI11n(copy.metadata, {
    locale,
    path: canonicalPath,
  })

  return {
    ...base,
    title,
    description,
    robots: profile ? undefined : { index: false, follow: false },
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

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense fallback={null}>{children}</Suspense>
}
