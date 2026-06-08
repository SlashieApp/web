import type { Metadata } from 'next'

import { Box, Container, Stack } from '@chakra-ui/react'

import { Footer } from '@ui'

import { AboutSection } from './components/AboutSection'
import { ActionBar } from './components/ActionBar'
import { PortfolioPlaceholder } from './components/PortfolioPlaceholder'
import { ReviewsPlaceholder } from './components/ReviewsPlaceholder'
import { StatsGrid } from './components/StatsGrid'
import { WorkerProfileHeader } from './components/WorkerProfileHeader'
import { WorkerProfileViewCapture } from './components/WorkerProfileViewCapture'
import { getWorkerForPublicPage } from './helpers/getWorkerForPublicPage'
import {
  workerPublicDisplayName,
  workerServiceAreaLabel,
} from './helpers/workerProfileHelpers'

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
  const { worker } = await getWorkerForPublicPage(slug)
  const displayName = worker ? workerPublicDisplayName(worker) : null
  const title = displayName
    ? `${displayName} – Worker on Slashie`
    : 'Worker not found | Slashie'
  const rawDescription =
    worker?.tagline?.trim() ||
    worker?.bio?.trim() ||
    (worker ? workerServiceAreaLabel(worker) : null)
  const description = rawDescription
    ? rawDescription.length > 160
      ? `${rawDescription.slice(0, 157)}…`
      : rawDescription
    : 'View worker profile and trust signals on Slashie.'
  const canonicalPath = `/workers/${slug}`
  const avatarUrl = worker?.profile?.avatarUrl?.trim()

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
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

export default async function WorkerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ fromTask?: string }>
}) {
  const { slug } = await params
  const { fromTask } = await searchParams
  const { worker } = await getWorkerForPublicPage(slug)

  if (!worker) return null

  const analyticsSource = fromTask?.trim() ? 'quote_card' : undefined

  return (
    <>
      <Box as="section" py={{ base: 6, md: 10 }} pb={{ base: 24, md: 10 }}>
        <Container>
          <Stack gap={6} maxW="3xl" mx="auto" px={{ base: 4, md: 6 }}>
            <WorkerProfileHeader />
            <AboutSection />
            <StatsGrid />
            <ReviewsPlaceholder />
            <PortfolioPlaceholder />
            <ActionBar fromTask={fromTask} />
          </Stack>
        </Container>
      </Box>
      <Footer />
      <WorkerProfileViewCapture source={analyticsSource} />
    </>
  )
}
