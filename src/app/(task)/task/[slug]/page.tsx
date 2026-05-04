import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { cache } from 'react'

import { Box, Container, Grid, Stack, Text } from '@chakra-ui/react'
import type { TaskQuery } from '@codegen/schema'

import { TASK_QUERY } from '@/graphql/tasks'
import { fetch } from '@/utils/api'
import { Footer, SectionCard } from '@ui'

import { TaskHeader } from './components/TaskHeader'
import { MainSection } from './components/mainSection'
import { MetaSection } from './components/metaSection'
import { QuoteSection } from './components/quoteSection'
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
                <SectionCard eyebrow="Task" heading="Unavailable">
                  <Text color="formLabelMuted">
                    Task details are unavailable.
                  </Text>
                </SectionCard>
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
          <Box as="section">
            <Container pb={{ base: 28, md: 10 }}>
              <Stack gap={8} maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
                <TaskHeader />
                <Grid
                  w="full"
                  templateColumns={{
                    base: 'minmax(0, 1fr)',
                    md: 'minmax(0, 1fr) minmax(280px, 340px)',
                    xl: 'minmax(220px, 260px) minmax(0, 1fr) minmax(280px, 340px)',
                  }}
                  gap={{ base: 6, md: 8, xl: 8 }}
                  alignItems="start"
                >
                  <Box
                    minW={0}
                    gridColumn={{ base: '1', md: '1', xl: '2' }}
                    gridRow={{ base: '1', md: '1', xl: '1' }}
                  >
                    <MainSection />
                  </Box>

                  <Box
                    display={{ base: 'contents', md: 'flex', xl: 'contents' }}
                    flexDirection="column"
                    gap={4}
                    w={{ md: 'full' }}
                    gridColumn={{ md: '2' }}
                    gridRow={{ md: '1 / 3' }}
                    position={{ md: 'sticky' }}
                    top={{ md: 20 }}
                    alignSelf="start"
                  >
                    <MetaSection
                      gridColumn={{ base: '1', xl: '1' }}
                      gridRow={{ base: '2', xl: '1' }}
                      position={{ base: 'static', xl: 'sticky' }}
                      top={{ xl: 20 }}
                      alignSelf="start"
                    />

                    <QuoteSection
                      gridColumn={{ base: '1', xl: '3' }}
                      gridRow={{ base: '3', xl: '1' }}
                      position={{ base: 'static', xl: 'sticky' }}
                      top={{ xl: 20 }}
                      alignSelf="start"
                    />
                  </Box>
                </Grid>
              </Stack>
            </Container>
          </Box>
          <Box mb={{ base: 24, md: 0 }}>
            <Footer />
          </Box>
        </Stack>
      </Box>
    </TaskDetailProvider>
  )
}
