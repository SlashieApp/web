import type { Metadata } from 'next'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import {
  formatMessage,
  loadPageI11n,
  metadataFromI11n,
} from '@/i18n/loadPageI11n'

import { getPublicUserForSeoPage } from './helpers/getPublicUserForSeoPage'
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
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const locale = await getRequestLocale()
  const { id } = await params
  const copy = loadPageI11n(bag, locale)
  const { user } = await getPublicUserForSeoPage(id)
  const displayName = user?.profile?.name?.trim() || null
  const title = displayName
    ? formatMessage(copy.metadata.titleWithName, { name: displayName })
    : copy.metadata.title
  const description = displayName
    ? formatMessage(copy.metadata.descriptionWithName, { name: displayName })
    : copy.metadata.description
  const canonicalPath = `/user/${id}`
  const avatarUrl = user?.profile?.avatarUrl?.trim()
  const base = metadataFromI11n(copy.metadata, { locale, path: canonicalPath })

  return {
    ...base,
    title,
    description,
    robots: displayName ? undefined : { index: false, follow: false },
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

export default function PublicUserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
