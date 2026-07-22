import type { Metadata } from 'next'

import { Box } from '@chakra-ui/react'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { TaskNotFoundCard } from './components/TaskNotFoundCard'
import { TaskDetailMobile } from './components/tripDetail/TaskDetailMobile'
import { TaskDetailView } from './components/tripDetail/openTask/TaskDetailView'
import { TaskDetailProvider } from './context/TaskDetailProvider'
import { getTaskForTaskDetailPage } from './helpers/getTaskForTaskDetailPage'
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
  const { task } = await getTaskForTaskDetailPage(slug)
  const title = task ? `${task.title} | Slashie Task` : copy.metadata.title
  const rawDescription = task?.description?.trim()
  const description = rawDescription
    ? rawDescription.length > 160
      ? `${rawDescription.slice(0, 157)}…`
      : rawDescription
    : copy.metadata.description
  const firstImage = task?.images?.[0]
  const ogImageUrl = firstImage ? absoluteUrlFromEnv(firstImage) : undefined
  const canonicalPath = `/tasks/${slug}`
  const base = metadataFromI11n(copy.metadata, { locale, path: canonicalPath })

  return {
    ...base,
    title,
    description,
    openGraph: {
      ...base.openGraph,
      type: 'website',
      url: absoluteUrlFromEnv(canonicalPath),
      title,
      description,
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  }
}

/**
 * Task detail page. The page owns the whole composition: the SSR-fetched
 * public task meta seeds `TaskDetailProvider` (viewer/quotes stream in
 * client-side), and the two form-factor views render as direct children —
 * CSS-gated so the server HTML paints the correct layout at any width.
 */
export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  const { slug } = await params
  const { task } = await getTaskForTaskDetailPage(slug)

  if (!task) {
    return (
      <TaskNotFoundCard
        heading={copy.notFoundTitle}
        description={copy.notFoundDescription}
      />
    )
  }

  return (
    <TaskDetailProvider taskId={slug} initialTask={task}>
      <Box display={{ base: 'block', lg: 'none' }}>
        <TaskDetailMobile />
      </Box>
      <Box display={{ base: 'none', lg: 'block' }}>
        <TaskDetailView />
      </Box>
    </TaskDetailProvider>
  )
}
