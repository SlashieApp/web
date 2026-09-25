'use client'

import {
  Box,
  Container,
  Grid,
  HStack,
  Heading,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { WorkerContactAction } from '@codegen/schema'
import { useState } from 'react'
import { LuCalendar, LuCheck, LuHeart, LuLock, LuMapPin } from 'react-icons/lu'

import { TaskCard } from '@/app/(task)/components/ui/TaskCard'
import { WorkerPortfolioSection } from '@/app/(worker)/workers/[slug]/components'
import { ReportControl } from '@/content/trust/ReportControl'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { RatingStars } from '@/ui/Rating/Rating'
import { Avatar, Badge, Button, Card, Link, SafetyNotice } from '@ui'

import type { PublicProfileView } from '../../helpers/publicProfileModel'
import { isWorkerProfile } from '../../helpers/publicProfileModel'
import { PublicProfileUserType } from '../../helpers/publicProfileTypes'
import bag from '../../i11n.json'
import { PublicProfileAchievements } from './PublicProfileAchievements'

const VISIBLE_SKILLS = 8

export type PublicProfileScreenProps = {
  pending?: boolean
  view?: PublicProfileView | null
  saved?: boolean
  reviewHref?: string | null
  excludeTaskId?: string | null
  onSave?: () => void
  onContact?: () => void
}

export function PublicProfileScreen({
  pending = false,
  view = null,
  saved = false,
  reviewHref = null,
  excludeTaskId = null,
  onSave,
  onContact,
}: PublicProfileScreenProps) {
  const t = useI11n(bag)

  if (pending || !view) {
    return (
      <Container py={{ base: 8, md: 10 }}>
        <Stack gap={4} aria-busy>
          <Skeleton h="140px" borderRadius="xl" />
          <Skeleton h="220px" borderRadius="xl" />
        </Stack>
      </Container>
    )
  }

  const name = view.name || t.fallbackName
  const firstName = name.split(/\s+/)[0] || name
  const showWorker = isWorkerProfile(view)
  const count = view.openTaskCount
  const countLabel =
    count === 1
      ? t.openTasksCountOne
      : formatMessage(t.openTasksCountMany, { count })
  const emptyTasks = excludeTaskId?.trim()
    ? t.openTasksEmptyOther
    : t.openTasksEmpty

  return (
    <Stack gap={{ base: 5, md: 8 }} pb={{ base: showWorker ? 32 : 10, lg: 10 }}>
      {view.isSelf ? (
        <Container>
          <Card layout="section" heading={t.previewTitle}>
            <Stack gap={3}>
              <Text color="text.muted" fontSize="sm">
                {t.previewBody}
              </Text>
              <Button
                asChild
                size="sm"
                variant="secondary"
                alignSelf="flex-start"
              >
                <Link href="/profile" _hover={{ textDecoration: 'none' }}>
                  {t.previewSettings}
                </Link>
              </Button>
            </Stack>
          </Card>
        </Container>
      ) : null}

      <Box
        w="full"
        borderWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
        bgImage="linear-gradient(180deg, var(--chakra-colors-status-success-soft) 0%, var(--chakra-colors-bg-surface) 78%)"
      >
        <Container py={{ base: 6, md: 8 }}>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: 4, md: 6 }}
            align={{ base: 'center', md: 'flex-start' }}
          >
            <Avatar name={name} src={view.avatarUrl ?? undefined} size="xl" />
            <Stack
              gap={2}
              flex={1}
              minW={0}
              align={{ base: 'center', md: 'flex-start' }}
              textAlign={{ base: 'center', md: 'start' }}
            >
              <HStack
                gap={2}
                flexWrap="wrap"
                justify={{ base: 'center', md: 'flex-start' }}
              >
                <Heading size="2xl" color="text.default">
                  {name}
                </Heading>
                {view.verified ? (
                  <Box
                    as="span"
                    color="text.link"
                    aria-label={t.identityVerified}
                  >
                    <LuCheck size={18} strokeWidth={3} />
                  </Box>
                ) : null}
              </HStack>
              <Badge variant="neutral" shape="pill" size="sm">
                {view.userType === PublicProfileUserType.Worker
                  ? t.userTypeWorker
                  : t.userTypeCustomer}
              </Badge>
              {view.headline ? (
                <Text color="text.default" fontWeight={600}>
                  {view.headline}
                </Text>
              ) : null}
              {view.tagline ? (
                <Text color="text.muted" fontStyle="italic">
                  {view.tagline}
                </Text>
              ) : null}
              {view.memberSinceLabel ? (
                <Text color="text.muted" fontSize="sm">
                  {formatMessage(t.memberSince, {
                    date: view.memberSinceLabel,
                  })}
                </Text>
              ) : null}
              <RatingLine view={view} />
              {view.serviceAreaLabel ? (
                <HStack gap={1.5} color="text.muted" fontSize="sm">
                  <LuMapPin size={14} />
                  <Text>
                    {t.serviceArea}: {view.serviceAreaLabel}
                  </Text>
                </HStack>
              ) : null}
              {showWorker ? (
                <ProfileActions
                  view={view}
                  saved={saved}
                  reviewHref={reviewHref}
                  onSave={onSave}
                  name={name}
                />
              ) : null}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container>
        <Grid
          templateColumns={{
            base: 'minmax(0, 1fr)',
            lg: 'minmax(0, 65fr) minmax(0, 35fr)',
          }}
          gap={{ base: 5, lg: 6 }}
          alignItems="start"
        >
          <Stack gap={5} minW={0}>
            {view.bio ? (
              <Card layout="section" heading={t.about}>
                <Text
                  color="text.muted"
                  whiteSpace="pre-line"
                  lineHeight="tall"
                >
                  {view.bio}
                </Text>
              </Card>
            ) : null}
            {view.skills.length > 0 ? (
              <SkillsCard
                skills={view.skills}
                heading={t.skills}
                moreLabel={t.skillsMore}
              />
            ) : null}
            {view.qualifications.length > 0 ? (
              <Card layout="section" heading={t.qualifications}>
                <Stack gap={2}>
                  <HStack gap={2} flexWrap="wrap">
                    {view.qualifications.map((item) => (
                      <Badge
                        key={item}
                        variant="neutral"
                        shape="pill"
                        size="sm"
                      >
                        {item}
                      </Badge>
                    ))}
                  </HStack>
                  <Text fontSize="xs" color="text.muted">
                    {t.qualificationsNote}
                  </Text>
                </Stack>
              </Card>
            ) : null}
            <Stack gap={3}>
              <Stack gap={1}>
                <Heading size="lg">{t.openTasksHeading}</Heading>
                <Text fontSize="sm" color="text.muted">
                  {countLabel}
                </Text>
              </Stack>
              {view.openTasks.length === 0 ? (
                <Text color="text.muted">{emptyTasks}</Text>
              ) : (
                <Stack gap={3}>
                  {view.openTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      detailsHref={`/tasks/${task.id}`}
                      showDetailsCta
                      activateAriaLabel={formatMessage(t.viewTask, {
                        title: task.title,
                      })}
                    />
                  ))}
                </Stack>
              )}
            </Stack>
            {showWorker ? (
              <Card layout="section" heading={t.workHeading}>
                {view.completedJobs.length === 0 ? (
                  <Stack gap={1}>
                    <Text fontWeight={600}>{t.workEmptyTitle}</Text>
                    <Text fontSize="sm" color="text.muted">
                      {t.workEmptyBody}
                    </Text>
                  </Stack>
                ) : (
                  <Stack gap={3}>
                    {view.completedJobs.map((job) => (
                      <Stack key={job.id} gap={1}>
                        <Link href={`/tasks/${job.id}`} tone="emphasis">
                          {job.title}
                        </Link>
                        <HStack
                          gap={2}
                          flexWrap="wrap"
                          color="text.muted"
                          fontSize="xs"
                        >
                          <Badge variant="neutral" shape="pill" size="sm">
                            {job.category}
                          </Badge>
                          {job.areaLabel ? (
                            <Text as="span">{job.areaLabel}</Text>
                          ) : null}
                          {job.completedLabel ? (
                            <Text as="span">{job.completedLabel}</Text>
                          ) : null}
                          {job.rating != null ? (
                            <RatingStars
                              value={job.rating}
                              label={`${job.title} rating`}
                            />
                          ) : null}
                        </HStack>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Card>
            ) : null}
            <ReviewsBlock view={view} />
            {showWorker && view.portfolioUrls.length > 0 ? (
              <WorkerPortfolioSection
                portfolioUrls={view.portfolioUrls}
                workerName={name}
              />
            ) : null}
          </Stack>
          <ProfileSidebar
            view={view}
            name={name}
            firstName={firstName}
            onContact={onContact}
          />
        </Grid>
      </Container>

      {view.isSelf ? (
        <Container>
          <PublicProfileAchievements view={view} />
        </Container>
      ) : null}

      {showWorker && !view.isSelf ? (
        <Box
          display={{ base: 'block', lg: 'none' }}
          position="fixed"
          insetX={0}
          bottom={0}
          zIndex={10}
          bg="bg.surface"
          borderTopWidth="1px"
          borderColor="border.default"
          px={4}
          pt={3}
          pb="calc(0.75rem + env(safe-area-inset-bottom))"
        >
          <Button type="button" w="full" size="lg" onClick={onContact}>
            {formatMessage(t.contact, { name: firstName })}
          </Button>
        </Box>
      ) : null}
    </Stack>
  )
}

function RatingLine({ view }: { view: PublicProfileView }) {
  const t = useI11n(bag)
  const count = view.ratingCount
  if (count <= 0) {
    return (
      <Text fontSize="sm" color="text.muted">
        {t.reviewsNone}
      </Text>
    )
  }
  const label =
    view.ratingAverage == null
      ? formatMessage(count === 1 ? t.reviewsCountOne : t.reviewsCount, {
          count,
        })
      : formatMessage(t.reviewsAverage, {
          average: view.ratingAverage.toFixed(1),
          count,
        })
  return (
    <HStack gap={2}>
      {view.ratingAverage != null ? (
        <RatingStars value={view.ratingAverage} label={label} />
      ) : null}
      <Text fontSize="sm" color="text.muted">
        {label}
      </Text>
    </HStack>
  )
}

function ProfileActions({
  view,
  saved,
  reviewHref,
  onSave,
  name,
}: {
  view: PublicProfileView
  saved: boolean
  reviewHref: string | null
  onSave?: () => void
  name: string
}) {
  const t = useI11n(bag)
  const own =
    view.viewer?.contactAction === WorkerContactAction.None || view.isSelf
  const canReview = Boolean(view.viewer?.canLeaveReview && reviewHref)
  return (
    <HStack
      gap={2}
      flexWrap="wrap"
      justify={{ base: 'center', md: 'flex-start' }}
    >
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onSave}
        disabled={own}
        aria-pressed={saved}
        aria-label={saved ? t.savedAria : t.saveAria}
        title={own ? t.saveOwn : undefined}
      >
        <Box as="span" display="inline-flex" aria-hidden>
          <LuHeart size={15} fill={saved ? 'currentColor' : 'none'} />
        </Box>
        {saved ? t.saved : t.save}
      </Button>
      {canReview && reviewHref ? (
        <Button asChild variant="secondary" size="sm">
          <Link href={reviewHref} _hover={{ textDecoration: 'none' }}>
            {t.leaveReview}
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled
          title={t.leaveReviewHint}
        >
          {t.leaveReview}
        </Button>
      )}
      <Text srOnly>{name}</Text>
    </HStack>
  )
}

function SkillsCard({
  skills,
  heading,
  moreLabel,
}: {
  skills: string[]
  heading: string
  moreLabel: string
}) {
  const [open, setOpen] = useState(false)
  const visible = open ? skills : skills.slice(0, VISIBLE_SKILLS)
  const hidden = skills.length - visible.length
  return (
    <Card layout="section" heading={heading}>
      <HStack gap={2} flexWrap="wrap">
        {visible.map((skill) => (
          <Badge key={skill} variant="success" shape="pill" size="lg">
            {skill}
          </Badge>
        ))}
        {hidden > 0 ? (
          <Badge
            as="button"
            variant="neutral"
            shape="pill"
            size="lg"
            cursor="pointer"
            onClick={() => setOpen(true)}
          >
            {formatMessage(moreLabel, { count: hidden })}
          </Badge>
        ) : null}
      </HStack>
    </Card>
  )
}

function ReviewsBlock({ view }: { view: PublicProfileView }) {
  const t = useI11n(bag)
  const count = view.ratingCount
  const title =
    count <= 0
      ? t.reviewsNone
      : view.ratingAverage == null
        ? formatMessage(count === 1 ? t.reviewsCountOne : t.reviewsCount, {
            count,
          })
        : formatMessage(t.reviewsAverage, {
            average: view.ratingAverage.toFixed(1),
            count,
          })
  return (
    <Card layout="section" heading={t.reviewsHeading}>
      <Stack gap={4}>
        <Stack gap={1}>
          <Text fontWeight={600}>{title}</Text>
          <Text fontSize="sm" color="text.muted">
            {count > 0 && view.ratingAverage == null
              ? t.reviewsThreshold
              : t.reviewsEmptyBody}
          </Text>
        </Stack>
        {view.reviews.map((review) => (
          <Stack
            key={review.id}
            gap={1}
            pt={3}
            borderTopWidth="1px"
            borderColor="border.default"
          >
            <HStack justify="space-between">
              <RatingStars value={review.stars} label={`${review.stars}`} />
              <Text fontSize="xs" color="text.muted">
                {review.createdLabel}
              </Text>
            </HStack>
            {review.comment ? (
              <Text fontSize="sm" color="text.default" whiteSpace="pre-line">
                {review.comment}
              </Text>
            ) : null}
          </Stack>
        ))}
      </Stack>
    </Card>
  )
}

function CheckRow({ label, verified }: { label: string; verified: boolean }) {
  return (
    <HStack gap={2.5}>
      <Box
        boxSize="20px"
        borderRadius="full"
        bg={verified ? 'action.primary' : 'transparent'}
        borderWidth={verified ? 0 : '2px'}
        borderColor="border.strong"
        color="text.onGreen"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        aria-hidden
      >
        {verified ? <LuCheck size={11} strokeWidth={3.2} /> : null}
      </Box>
      <Text fontSize="sm" color={verified ? 'text.default' : 'text.muted'}>
        {label}
      </Text>
    </HStack>
  )
}

function ProfileSidebar({
  view,
  name,
  firstName,
  onContact,
}: {
  view: PublicProfileView
  name: string
  firstName: string
  onContact?: () => void
}) {
  const t = useI11n(bag)
  const worker = isWorkerProfile(view)
  const own = view.isSelf
  const jobs = view.completedJobs.length
  return (
    <Stack gap={5} minW={0}>
      {worker ? (
        <Card layout="section" heading={t.trustHeading}>
          <Stack gap={3}>
            <Text fontSize="xs" color="text.muted">
              {t.trustNote}
            </Text>
            {view.verified ? (
              <CheckRow label={t.identityVerified} verified />
            ) : null}
            <CheckRow
              label={view.phoneVerified ? t.phoneVerified : t.phoneUnverified}
              verified={view.phoneVerified}
            />
            <CheckRow
              label={view.emailVerified ? t.emailVerified : t.emailUnverified}
              verified={view.emailVerified}
            />
            {view.yearsExperience != null ? (
              <HStack gap={2} color="text.muted" fontSize="sm">
                <LuCalendar size={14} />
                <Text>
                  {view.yearsExperience === 1
                    ? t.yearsExperienceOne
                    : formatMessage(t.yearsExperience, {
                        count: view.yearsExperience,
                      })}
                </Text>
              </HStack>
            ) : null}
            {jobs > 0 ? (
              <Text fontSize="sm" color="text.muted">
                {jobs === 1
                  ? t.jobsCompletedOne
                  : formatMessage(t.jobsCompleted, { count: jobs })}
              </Text>
            ) : null}
          </Stack>
        </Card>
      ) : null}
      {worker ? (
        <Card layout="section" heading={t.contactHeading}>
          <Stack gap={3}>
            <Text fontSize="sm" color="text.muted">
              {formatMessage(t.contactBody, { name: firstName })}
            </Text>
            <Button
              type="button"
              w="full"
              onClick={onContact}
              disabled={own}
              title={own ? t.contactOwn : undefined}
            >
              {formatMessage(t.contact, { name: firstName })}
            </Button>
            <SafetyNotice variant="inline" />
            <HStack gap={2} color="text.muted" align="flex-start">
              <LuLock size={13} />
              <Text fontSize="xs">{t.detailsSafe}</Text>
            </HStack>
          </Stack>
        </Card>
      ) : null}
      {own ? null : (
        <ReportControl
          kind="user"
          targetId={view.reportTargetId}
          targetTitle={name}
          variant="button"
        />
      )}
    </Stack>
  )
}
