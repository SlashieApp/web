import { Box } from '@chakra-ui/react'
import type { Metadata } from 'next'

import { TaskNotFoundCard } from '@/app/(task)/tasks/[slug]/components/ui/TaskNotFoundCard'
import { TaskDetailProvider } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { getTaskForTaskDetailPage } from '@/app/(task)/tasks/[slug]/helpers/getTaskForTaskDetailPage'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'

import { TaskReviewScreen } from './components/TaskReviewScreen'
import bag from './i11n.json'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const locale = await getRequestLocale()
  const { slug } = await params
  const copy = loadPageI11n(bag, locale)
  const canonicalPath = `/tasks/${slug}/review`
  return metadataFromI11n(copy.metadata, { locale, path: canonicalPath })
}

export default async function TaskReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ orderId?: string }>
}) {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(bag, locale)
  const { slug } = await params
  const query = await searchParams
  const { task } = await getTaskForTaskDetailPage(slug)

  if (!task) {
    return (
      <TaskNotFoundCard
        heading={copy.ineligibleTitle}
        description={copy.ineligibleBody}
      />
    )
  }

  return (
    <TaskDetailProvider taskId={slug} initialTask={task}>
      <Box minH="100dvh" display="flex" flexDirection="column">
        <TaskReviewScreen orderIdFromLink={query.orderId} />
      </Box>
    </TaskDetailProvider>
  )
}
