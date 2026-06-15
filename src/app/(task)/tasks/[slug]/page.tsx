import type { Metadata } from 'next'

import { Box, Container, Grid, Stack } from '@chakra-ui/react'

import { Footer } from '@ui'

import { MainSection } from './components/mainSection'
import { MetaSection } from './components/metaSection'
import { QuoteSectionColumn } from './components/quoteSection'
import { StatusSection } from './components/statusSection'
import { getTaskForTaskDetailPage } from './helpers/getTaskForTaskDetailPage'

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
    ? `${task.title} | Slashie Task`
    : 'Task not found | Slashie'
  const rawDescription = task?.description?.trim()
  const description = rawDescription
    ? rawDescription.length > 160
      ? `${rawDescription.slice(0, 157)}…`
      : rawDescription
    : 'Browse task details and availability on Slashie.'
  const firstImage = task?.images?.[0]
  const ogImageUrl = firstImage ? absoluteUrlFromEnv(firstImage) : undefined
  const canonicalPath = `/tasks/${slug}`

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
  const { task, order } = await getTaskForTaskDetailPage(slug)

  if (!task) return null

  return (
    <>
      <Container
        maxW="7xl"
        mx="auto"
        pt={{ base: 4, md: 6 }}
        pb={{ base: 28, md: 10 }}
      >
        <Stack gap={2} px={{ base: 4, md: 6 }}>
          <StatusSection />
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
              top={{ md: 4 }}
              alignSelf="start"
            >
              <MetaSection
                gridColumn={{ base: '1', xl: '1' }}
                gridRow={{ base: '2', xl: '1' }}
                position={{ base: 'static', xl: 'sticky' }}
                top={{ xl: 4 }}
                alignSelf="start"
              />

              <Stack
                gap={4}
                gridColumn={{ base: '1', xl: '3' }}
                gridRow={{ base: '3', xl: '1' }}
                position={{ base: 'static', xl: 'sticky' }}
                top={{ xl: 4 }}
                alignSelf="start"
              >
                <QuoteSectionColumn task={task} order={order} />
              </Stack>
            </Box>
          </Grid>
        </Stack>
      </Container>
      <Box mb={{ base: 24, md: 0 }}>
        <Footer />
      </Box>
    </>
  )
}
