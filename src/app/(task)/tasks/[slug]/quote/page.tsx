import type { Metadata } from 'next'

import { Box } from '@chakra-ui/react'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { TaskNotFoundCard } from '../components/TaskNotFoundCard'
import { TaskDetailProvider } from '../context/TaskDetailProvider'
import { getTaskForTaskDetailPage } from '../helpers/getTaskForTaskDetailPage'
import { TaskQuoteFlow } from './components/TaskQuoteFlow'
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
  const title = task
    ? `Send a quote · ${task.title} | Slashie`
    : copy.metadata.title
  const description = task?.description?.trim()
    ? `Review ${task.title} and send your quote on Slashie.`
    : copy.metadata.description
  const canonicalPath = `/tasks/${slug}/quote`
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
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function TaskQuotePage({
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
      <Box minH="100dvh" display="flex" flexDirection="column">
        <TaskQuoteFlow />
      </Box>
    </TaskDetailProvider>
  )
}
