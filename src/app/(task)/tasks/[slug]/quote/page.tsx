import type { Metadata } from 'next'

import { Box } from '@chakra-ui/react'

import { TaskNotFoundCard } from '../components/TaskNotFoundCard'
import { TaskDetailProvider } from '../context/TaskDetailProvider'
import { getTaskForTaskDetailPage } from '../helpers/getTaskForTaskDetailPage'
import { TaskQuoteFlow } from './components/TaskQuoteFlow'

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
  const { slug } = await params
  const { task } = await getTaskForTaskDetailPage(slug)
  const title = task
    ? `Send a quote · ${task.title} | Slashie`
    : 'Send a quote | Slashie'
  const description = task?.description?.trim()
    ? `Review ${task.title} and send your quote on Slashie.`
    : 'Send a quote for a task on Slashie.'
  const canonicalPath = `/tasks/${slug}/quote`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
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
  const { slug } = await params
  const { task } = await getTaskForTaskDetailPage(slug)

  if (!task) return <TaskNotFoundCard />

  return (
    <TaskDetailProvider taskId={slug} initialTask={task}>
      <Box minH="100dvh" display="flex" flexDirection="column">
        <TaskQuoteFlow />
      </Box>
    </TaskDetailProvider>
  )
}
