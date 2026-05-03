import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { cache } from 'react'

import { Box, Container, Grid, Stack, Text } from '@chakra-ui/react'
import type { TaskQuery } from '@codegen/schema'

import { TASK_QUERY } from '@/graphql/tasks'
import { fetch } from '@/utils/api'
import { Footer } from '@ui'

import { TaskDetailBackToBrowseLink } from './components/TaskDetailBackToBrowseLink'
import { TaskDetailIntroText } from './components/TaskDetailIntroText'
import { TaskDetailMainColumn } from './components/TaskDetailMainColumn'
import { TaskDetailMobileStickyQuoteBar } from './components/TaskDetailMobileStickyQuoteBar'
import { TaskDetailOwnerHelpCard } from './components/TaskDetailOwnerHelpCard'
import { TaskDetailOwnerPerformanceCard } from './components/TaskDetailOwnerPerformanceCard'
import { TaskDetailOwnerQuotesSection } from './components/TaskDetailOwnerQuotesSection'
import { TaskDetailOwnerToolbar } from './components/TaskDetailOwnerToolbar'
import { TaskDetailPaymentTrustCard } from './components/TaskDetailPaymentTrustCard'
import { TaskDetailVisitorSidebar } from './components/TaskDetailVisitorSidebar'
import {
  TaskDetailWorkerCtas,
  TaskDetailWorkerQuotePanel,
} from './components/TaskDetailWorkerSidebar'
import { TaskDetailProvider } from './context/TaskDetailProvider'

const AUTH_COOKIE = 'auth'

const getTaskForTaskDetailPage = cache(async (taskId: string) => {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value ?? ''
  const json = await fetch<TaskQuery>({
    query: TASK_QUERY,
    variables: { id: taskId },
    authToken: token,
  })
  return json?.data?.task ?? null
})

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
  const task = await getTaskForTaskDetailPage(slug)
  const title = task ? `${task.title} | Slashie Task` : 'Task Details | Slashie'
  const rawDescription = task?.description?.trim()
  const description = rawDescription
    ? rawDescription.length > 160
      ? `${rawDescription.slice(0, 157)}…`
      : rawDescription
    : 'Browse task details and availability on Slashie.'
  const firstImage = task?.images?.[0]
  const ogImageUrl = firstImage ? absoluteUrlFromEnv(firstImage) : undefined
  const canonicalPath = `/task/${slug}`

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

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const task = await getTaskForTaskDetailPage(slug)

  if (!task) {
    return (
      <Box bg="bg" color="cardFg" minH="100vh">
        <Stack gap={0}>
          <Box as="section" py={{ base: 8, md: 10 }}>
            <Container>
              <Stack gap={8} maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
                <Text color="formLabelMuted">
                  Task details are unavailable.
                </Text>
              </Stack>
            </Container>
          </Box>
          <Footer />
        </Stack>
      </Box>
    )
  }

  return (
    <TaskDetailProvider taskId={slug} initialTask={task}>
      <Box bg="bg" color="cardFg" minH="100vh">
        <Stack gap={0}>
          <Box as="section" py={{ base: 8, md: 10 }}>
            <Container>
              <Stack gap={8} maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
                <Grid
                  w="full"
                  templateColumns={{
                    base: 'minmax(0, 1fr)',
                    xl: 'minmax(220px, 260px) minmax(0, 1fr) minmax(280px, 340px)',
                  }}
                  gap={{ base: 6, xl: 8 }}
                  alignItems="start"
                >
                  <Box
                    position={{ base: 'static', xl: 'sticky' }}
                    top={{ xl: 6 }}
                    alignSelf="start"
                  >
                    <Stack gap={4}>
                      <TaskDetailBackToBrowseLink />
                      <TaskDetailIntroText />
                      <TaskDetailVisitorSidebar />
                    </Stack>
                  </Box>

                  <Box minW={0}>
                    <TaskDetailMainColumn />
                  </Box>

                  <Box
                    position={{ base: 'static', xl: 'sticky' }}
                    top={{ xl: 6 }}
                    alignSelf="start"
                    w="full"
                  >
                    <Stack gap={4} w="full">
                      <TaskDetailOwnerToolbar />
                      <TaskDetailWorkerCtas />
                      <TaskDetailWorkerQuotePanel />
                      <TaskDetailOwnerQuotesSection />
                      <TaskDetailPaymentTrustCard />
                      <TaskDetailOwnerPerformanceCard />
                      <TaskDetailOwnerHelpCard />
                    </Stack>
                  </Box>
                </Grid>
              </Stack>
            </Container>
          </Box>
          <TaskDetailMobileStickyQuoteBar />
          <Footer />
        </Stack>
      </Box>
    </TaskDetailProvider>
  )
}
