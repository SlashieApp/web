'use client'

import { Box, Container, Grid, Stack, Text } from '@chakra-ui/react'
import { useParams } from 'next/navigation'

import { Button, Card, Footer } from '@ui'

import { taskCategoryDisplayLabel } from '@/app/(task)/helpers/taskCategories'
import { useI11n } from '@/i18n/useI11n'

import {
  WorkerAboutSection,
  WorkerContactStickyBar,
  WorkerPortfolioSection,
  WorkerProfileAddPlaceholder,
  WorkerProfileHero,
  WorkerProfileOwnerBanner,
  WorkerProfileSidebar,
  WorkerProfileViewCapture,
  WorkerReviewsSection,
  WorkerSkillsSection,
  WorkerWorkSection,
} from './components'
import { WorkerProfileSectionSkeleton } from './components/shared/WorkerProfileSkeletons'
import {
  WorkerProfileProvider,
  useWorkerProfile,
} from './context/WorkerProfileContext'
import {
  formatCompletedMonth,
  workerPublicDisplayName,
} from './helpers/workerProfileHelpers'
import {
  isOwnWorkerProfile,
  workerHasMeaningfulBio,
  workerProfileCompleteness,
} from './helpers/workerProfileOwner'
import bag from './i11n.json'

function findScrollParent(node: HTMLElement): HTMLElement | null {
  let el = node.parentElement
  while (el) {
    const overflowY = getComputedStyle(el).overflowY
    if (
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowY === 'overlay'
    ) {
      return el
    }
    el = el.parentElement
  }
  return null
}

/**
 * The router's own scroll-to-top is skipped when a navigation runs a view
 * transition. Reset the app-shell pane (not the window — it never scrolls
 * in this layout) during the transition's DOM update.
 */
function WorkerProfileScrollReset({ workerId }: { workerId: string }) {
  return (
    <span
      hidden
      key={workerId}
      ref={(node) => {
        if (!node) return
        const scroller = findScrollParent(node)
        if (scroller) scroller.scrollTop = 0
        else window.scrollTo(0, 0)
      }}
    />
  )
}

function WorkerProfileBody() {
  const t = useI11n(bag)
  const { worker, seed, pending, error, refetch } = useWorkerProfile()

  if (error && !worker && !seed) {
    return (
      <Box
        bg="bg.canvas"
        color="text.default"
        minH="100vh"
        py={{ base: 8, md: 10 }}
      >
        <Card layout="section" heading={t.errorTitle} maxW="lg" mx="auto">
          <Text color="text.muted" mb={4}>
            {t.errorDescription}
          </Text>
          <Button type="button" onClick={() => refetch()}>
            {t.errorRetry}
          </Button>
        </Card>
      </Box>
    )
  }

  if (!pending && !worker) {
    return (
      <Box bg="bg.canvas" color="text.default" minH="100vh">
        <Stack gap={0}>
          <Box as="section" py={{ base: 8, md: 10 }}>
            <Container>
              <Card
                layout="section"
                heading={t.notFoundTitle}
                maxW="lg"
                mx="auto"
              >
                <Text color="text.muted">{t.notFoundDescription}</Text>
              </Card>
            </Container>
          </Box>
          <Footer />
        </Stack>
      </Box>
    )
  }

  const isOwner = worker ? isOwnWorkerProfile(worker) : false
  const hasBio = worker ? workerHasMeaningfulBio(worker) : false
  const skills = worker?.skills ?? seed?.skills ?? []
  const hasSkills = skills.some((s) => s.trim())
  const completeness = worker ? workerProfileCompleteness(worker) : null
  const displayName = worker
    ? workerPublicDisplayName(worker)
    : (seed?.name ?? 'Worker')
  const hasPhotos = worker ? worker.portfolioUrls.some((u) => u.trim()) : false
  const completedJobs = worker
    ? worker.completedJobs.map((job) => ({
        id: job.taskId,
        title: job.title,
        category: taskCategoryDisplayLabel(job.category) ?? job.category,
        areaLabel: job.areaLabel,
        completedLabel: formatCompletedMonth(job.completedAt),
        rating: job.rating,
      }))
    : []

  return (
    <>
      <Stack as="section" gap={{ base: 5, md: 8 }} pb={{ base: 32, lg: 10 }}>
        <WorkerProfileHero />
        <Container>
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
                {worker &&
                isOwner &&
                completeness &&
                completeness.percent < 100 ? (
                  <WorkerProfileOwnerBanner
                    workerId={worker.id}
                    percent={completeness.percent}
                    nextGap={completeness.nextGap}
                  />
                ) : null}

                {hasBio ? (
                  <WorkerAboutSection />
                ) : pending && !worker ? (
                  <WorkerProfileSectionSkeleton lines={3} />
                ) : isOwner ? (
                  <WorkerProfileAddPlaceholder
                    title={t.addBioTitle}
                    description={t.addBioDescription}
                  />
                ) : null}

                {hasSkills ? (
                  <WorkerSkillsSection />
                ) : pending && !worker ? (
                  <WorkerProfileSectionSkeleton lines={2} />
                ) : isOwner ? (
                  <WorkerProfileAddPlaceholder
                    title={t.addSkillsTitle}
                    description={t.addSkillsDescription}
                  />
                ) : null}

                {pending && !worker ? (
                  <WorkerProfileSectionSkeleton lines={4} />
                ) : completedJobs.length > 0 || isOwner ? (
                  <WorkerWorkSection jobs={completedJobs} />
                ) : null}

                {pending && !worker ? (
                  <WorkerProfileSectionSkeleton lines={3} />
                ) : (
                  <WorkerReviewsSection />
                )}

                {worker && hasPhotos ? (
                  <WorkerPortfolioSection
                    portfolioUrls={worker.portfolioUrls}
                    workerName={displayName}
                  />
                ) : pending && !worker ? (
                  <WorkerProfileSectionSkeleton lines={2} />
                ) : isOwner ? (
                  <WorkerProfileAddPlaceholder
                    title={t.addPhotosTitle}
                    description={t.addPhotosDescription}
                  />
                ) : null}
              </Stack>
              <Box minW={0}>
                {pending && !worker ? (
                  <Stack gap={5}>
                    <WorkerProfileSectionSkeleton lines={3} />
                    <WorkerProfileSectionSkeleton lines={2} />
                  </Stack>
                ) : (
                  <WorkerProfileSidebar />
                )}
              </Box>
            </Grid>
          </Stack>
        </Container>
      </Stack>
      <Footer />
      <WorkerContactStickyBar />
      <WorkerProfileViewCapture />
    </>
  )
}

/**
 * Worker profile. Client-owned so a listing click can paint seeded photo /
 * name / card fields immediately while colocated skeletons stand in for the
 * rest. Direct loads have no handoff and show the full skeleton until the
 * public profile query resolves. SSR only runs a light SEO query in layout.
 */
export default function WorkerProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const workerId = String(slug ?? '')

  return (
    <WorkerProfileProvider workerId={workerId}>
      <WorkerProfileScrollReset workerId={workerId} />
      <WorkerProfileBody />
    </WorkerProfileProvider>
  )
}
