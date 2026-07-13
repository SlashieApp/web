import type { Metadata } from 'next'

import { Box, Container, Grid, HStack, Stack } from '@chakra-ui/react'

import { Footer, Link } from '@ui'

import { taskCategoryDisplayLabel } from '@/app/(task)/helpers/taskCategories'
import { WORKER_SEARCH_HREF } from '@/utils/appRoutes'

import { WorkerAboutSection } from './components/WorkerAboutSection'
import { WorkerContactStickyBar } from './components/WorkerContactStickyBar'
import { WorkerPortfolioSection } from './components/WorkerPortfolioSection'
import { WorkerProfileAddPlaceholder } from './components/WorkerProfileAddPlaceholder'
import { WorkerProfileHero } from './components/WorkerProfileHero'
import { WorkerProfileOwnerBanner } from './components/WorkerProfileOwnerBanner'
import { WorkerProfileSidebar } from './components/WorkerProfileSidebar'
import { WorkerProfileViewCapture } from './components/WorkerProfileViewCapture'
import { WorkerReviewsSection } from './components/WorkerReviewsSection'
import { WorkerSkillsSection } from './components/WorkerSkillsSection'
import { WorkerWorkSection } from './components/WorkerWorkSection'
import { getWorkerForPublicPage } from './helpers/getWorkerForPublicPage'
import {
  formatCompletedMonth,
  workerHeadline,
  workerPublicDisplayName,
  workerServiceAreaDisplay,
} from './helpers/workerProfileHelpers'
import {
  isOwnWorkerProfile,
  workerHasMeaningfulBio,
  workerProfileCompleteness,
} from './helpers/workerProfileOwner'

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
  const headline = worker ? workerHeadline(worker) : null
  const title = displayName
    ? `${displayName} — ${headline ?? 'Worker'} on Slashie`
    : 'Worker not found | Slashie'
  const rawDescription =
    worker?.tagline?.trim() ||
    worker?.bio?.trim() ||
    (worker ? workerServiceAreaDisplay(worker) : null)
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

  // Missing workers 404 in the layout (notFound) — this guard is for types.
  if (!worker) return null

  const analyticsSource = fromTask?.trim() ? 'quote_card' : undefined
  const displayName = workerPublicDisplayName(worker)

  // Owner vs visitor: visitors never see thin/empty sections; the owner sees
  // dashed "Add …" prompts and the dismissible strength banner instead.
  const isOwner = isOwnWorkerProfile(worker)
  const hasBio = workerHasMeaningfulBio(worker)
  const hasSkills = worker.skills.some((s) => s.trim())
  const hasPhotos = worker.portfolioUrls.some((u) => u.trim())
  const completeness = workerProfileCompleteness(worker)

  const completedJobs = worker.completedJobs.map((job) => ({
    id: job.taskId,
    title: job.title,
    category: taskCategoryDisplayLabel(job.category) ?? job.category,
    areaLabel: job.areaLabel,
    completedLabel: formatCompletedMonth(job.completedAt),
    rating: job.rating,
  }))

  return (
    <>
      <Stack as="section" gap={{ base: 5, md: 8 }} pb={{ base: 32, lg: 10 }}>
        <WorkerProfileHero />
        <Container px={{ base: 4, md: 8 }}>
          <Stack gap={{ base: 4, md: 5 }}>
            <Grid
              templateColumns={{
                base: 'minmax(0, 1fr)',
                lg: 'minmax(0, 65fr) minmax(0, 35fr)',
              }}
              gap={{ base: 5, lg: 6 }}
              alignItems="start"
            >
              <Stack gap={{ base: 5, lg: 6 }} minW={0}>
                {isOwner && completeness.percent < 100 ? (
                  <WorkerProfileOwnerBanner
                    workerId={worker.id}
                    percent={completeness.percent}
                    nextGap={completeness.nextGap}
                  />
                ) : null}

                {hasBio ? (
                  <WorkerAboutSection />
                ) : isOwner ? (
                  <WorkerProfileAddPlaceholder
                    title="Add a bio"
                    description="Customers read this before accepting your quote. Two or three sentences about the work you do best."
                  />
                ) : null}

                {hasSkills ? (
                  <WorkerSkillsSection skills={worker.skills} />
                ) : isOwner ? (
                  <WorkerProfileAddPlaceholder
                    title="Add your skills"
                    description="Skills become searchable tags, so customers find you for the right tasks."
                  />
                ) : null}

                {completedJobs.length > 0 || isOwner ? (
                  <WorkerWorkSection jobs={completedJobs} />
                ) : null}

                <WorkerReviewsSection />

                {hasPhotos ? (
                  <WorkerPortfolioSection
                    portfolioUrls={worker.portfolioUrls}
                    workerName={displayName}
                  />
                ) : isOwner ? (
                  <WorkerProfileAddPlaceholder
                    title="Add photos of your work"
                    description="Workers with photos win more quotes. Add pictures of finished jobs."
                  />
                ) : null}
              </Stack>
              <Box minW={0}>
                <WorkerProfileSidebar />
              </Box>
            </Grid>
          </Stack>
        </Container>
      </Stack>
      <Footer />
      <WorkerContactStickyBar />
      <WorkerProfileViewCapture source={analyticsSource} />
    </>
  )
}
