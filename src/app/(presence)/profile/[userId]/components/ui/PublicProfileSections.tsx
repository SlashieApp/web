'use client'

import {
  Box,
  HStack,
  Heading,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import { LuAward } from 'react-icons/lu'

import { TaskCard } from '@/app/(task)/components/ui/TaskCard'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Badge, Button, Card, RatingStars } from '@ui'

import type {
  PublicCompletedJob,
  PublicProfileModel,
} from '../../helpers/publicProfileModel'
import bag from '../../i11n.json'
import type { PublicProfileSection } from '../../views'

const VISIBLE_SKILLS = 8
const LIST_LIMIT = 5
const PHOTO_LIMIT = 6

/** One main-column block of a view, in the order the config lists them. */
export function ProfileSection({
  section,
  model,
  excludeTaskId,
}: {
  section: PublicProfileSection
  model: PublicProfileModel
  excludeTaskId: string | null
}) {
  const t = useI11n(bag)
  switch (section) {
    case 'about':
      return <ProfileAboutSection bio={model.bio} />
    case 'skills':
      return (
        <ProfileSkillsSection
          skills={model.skills}
          qualifications={model.qualifications}
        />
      )
    case 'work':
      return <ProfileWorkSection jobs={model.completedJobs} />
    case 'reviews':
      return <ProfileReviewsSection model={model} />
    case 'photos':
      return (
        <ProfilePhotosSection
          urls={model.portfolioUrls}
          name={model.name || t.fallbackName}
        />
      )
    case 'openTasks':
      return (
        <ProfileOpenTasksSection
          tasks={model.openTasks}
          excludeTaskId={excludeTaskId}
        />
      )
  }
}

function Stars({ value }: { value: number }) {
  const t = useI11n(bag).sections
  return (
    <>
      <RatingStars value={value} size="sm" aria-hidden />
      <Text srOnly>
        {formatMessage(t.starsLabel, { count: Math.round(value) })}
      </Text>
    </>
  )
}

function ShowAll({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      minH="44px"
      alignSelf="flex-start"
      aria-expanded={false}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

function rowBorder(index: number) {
  return index === 0
    ? { pt: 0 }
    : { pt: 3, borderTopWidth: '1px', borderColor: 'border.default' }
}

export function ProfileAboutSection({ bio }: { bio: string | null }) {
  const t = useI11n(bag).sections
  if (!bio) return null
  return (
    <Card layout="section" heading={t.about}>
      <Text color="text.default" whiteSpace="pre-line" lineHeight="tall">
        {bio}
      </Text>
    </Card>
  )
}

export function ProfileSkillsSection({
  skills,
  qualifications,
}: {
  skills: readonly string[]
  qualifications: readonly string[]
}) {
  const t = useI11n(bag).sections
  const [open, setOpen] = useState(false)
  if (skills.length + qualifications.length === 0) return null
  const visible = open ? skills : skills.slice(0, VISIBLE_SKILLS)
  const hidden = skills.length - visible.length

  return (
    <Card layout="section" heading={t.skills}>
      {skills.length > 0 ? (
        <HStack gap={2} flexWrap="wrap">
          {visible.map((skill) => (
            <Badge key={skill} variant="neutral" shape="pill" size="lg">
              {skill}
            </Badge>
          ))}
          {hidden > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-expanded={false}
              onClick={() => setOpen(true)}
            >
              {formatMessage(t.skillsMore, { count: hidden })}
            </Button>
          ) : null}
        </HStack>
      ) : null}
      {qualifications.length > 0 ? (
        <Stack gap={2}>
          <Text fontSize="sm" fontWeight={600} color="text.default">
            {t.qualifications}
          </Text>
          <HStack gap={2} flexWrap="wrap">
            {qualifications.map((item) => (
              <Badge key={item} variant="neutral" shape="pill" size="lg">
                <LuAward size={14} aria-hidden />
                {item}
              </Badge>
            ))}
          </HStack>
          <Text fontSize="xs" color="text.muted">
            {t.qualificationsNote}
          </Text>
        </Stack>
      ) : null}
    </Card>
  )
}

function ProfileWorkSection({ jobs }: { jobs: readonly PublicCompletedJob[] }) {
  const t = useI11n(bag).sections
  const [all, setAll] = useState(false)
  const visible = all ? jobs : jobs.slice(0, LIST_LIMIT)

  return (
    <Card
      layout="section"
      heading={t.work}
      headingAccessory={
        <Text fontSize="sm" color="text.muted">
          {jobs.length === 1
            ? t.workCountOne
            : formatMessage(t.workCount, { count: jobs.length })}
        </Text>
      }
    >
      <Stack gap={3}>
        {visible.map((job, index) => (
          <Stack key={`${job.id}-${index}`} gap={0.5} {...rowBorder(index)}>
            <Text fontWeight={600} color="text.default">
              {job.title}
            </Text>
            <HStack gap={2} flexWrap="wrap" fontSize="sm" color="text.muted">
              <Text as="span">
                {[job.category, job.areaLabel, job.completedLabel]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
              {job.rating != null ? <Stars value={job.rating} /> : null}
            </HStack>
          </Stack>
        ))}
      </Stack>
      {jobs.length > visible.length ? (
        <ShowAll
          label={formatMessage(t.showAllJobs, { count: jobs.length })}
          onClick={() => setAll(true)}
        />
      ) : null}
    </Card>
  )
}

function ProfileReviewsSection({ model }: { model: PublicProfileModel }) {
  const t = useI11n(bag).sections
  const [all, setAll] = useState(false)
  const reviews = model.reviews
  const visible = all ? reviews : reviews.slice(0, LIST_LIMIT)
  const count = model.ratingCount
  const average = model.ratingAverage
  const countLabel =
    count === 1 ? t.reviewsCountOne : formatMessage(t.reviewsCount, { count })

  return (
    <Card
      id="reviews"
      layout="section"
      heading={t.reviews}
      scrollMarginTop="6rem"
    >
      {count === 0 ? (
        <Text color="text.muted">{t.reviewsEmpty}</Text>
      ) : average != null ? (
        <HStack gap={3} align="center">
          <Text
            fontFamily="heading"
            fontSize="4xl"
            fontWeight={700}
            lineHeight="1"
            color="text.default"
            fontVariantNumeric="tabular-nums"
            aria-hidden
          >
            {average.toFixed(1)}
          </Text>
          <Stack gap={1}>
            <Stars value={average} />
            <Text fontSize="sm" color="text.muted">
              {countLabel}
            </Text>
          </Stack>
        </HStack>
      ) : (
        <Stack gap={0.5}>
          <Text fontWeight={600} color="text.default">
            {countLabel}
          </Text>
          <Text fontSize="sm" color="text.muted">
            {t.reviewsThreshold}
          </Text>
        </Stack>
      )}
      {visible.length > 0 ? (
        <Stack gap={3}>
          {visible.map((review) => (
            <Stack
              key={review.id}
              gap={1}
              pt={3}
              borderTopWidth="1px"
              borderColor="border.default"
            >
              <HStack justify="space-between" gap={2} flexWrap="wrap">
                <HStack gap={1}>
                  <Stars value={review.stars} />
                </HStack>
                <Text fontSize="xs" color="text.muted">
                  {[
                    review.from === 'worker' ? t.fromWorker : t.fromCustomer,
                    review.createdLabel,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
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
      ) : null}
      {reviews.length > visible.length ? (
        <ShowAll
          label={formatMessage(t.showAllReviews, { count: reviews.length })}
          onClick={() => setAll(true)}
        />
      ) : null}
    </Card>
  )
}

function ProfilePhotosSection({
  urls,
  name,
}: {
  urls: readonly string[]
  name: string
}) {
  const t = useI11n(bag).sections
  return (
    <Card layout="section" heading={t.photos}>
      <SimpleGrid columns={{ base: 2, sm: 3 }} gap={3}>
        {urls.slice(0, PHOTO_LIMIT).map((url, index) => (
          <Box
            key={url}
            borderRadius="lg"
            overflow="hidden"
            borderWidth="1px"
            borderColor="border.default"
            aspectRatio={4 / 3}
            bg="bg.subtle"
          >
            <Image
              src={url}
              alt={formatMessage(t.photoAlt, { name, index: index + 1 })}
              w="full"
              h="full"
              objectFit="cover"
              loading="lazy"
              display="block"
            />
          </Box>
        ))}
      </SimpleGrid>
    </Card>
  )
}

function ProfileOpenTasksSection({
  tasks,
  excludeTaskId,
}: {
  tasks: PublicProfileModel['openTasks']
  excludeTaskId: string | null
}) {
  const t = useI11n(bag).sections

  if (tasks.length === 0) {
    return (
      <Card layout="section" heading={t.openTasks}>
        <Text color="text.muted">
          {excludeTaskId ? t.openTasksEmptyOther : t.openTasksEmpty}
        </Text>
      </Card>
    )
  }

  // The task cards are cards already, so the list sits under a plain heading.
  return (
    <Stack gap={3} as="section" aria-labelledby="profile-open-tasks">
      <Heading
        as="h3"
        id="profile-open-tasks"
        fontSize={{ base: '16px', md: '20px' }}
        fontWeight={500}
        color="text.default"
      >
        {t.openTasks}
      </Heading>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          detailsHref={`/tasks/${task.id}`}
          showDetailsCta
          activateAriaLabel={formatMessage(t.viewTask, { title: task.title })}
        />
      ))}
    </Stack>
  )
}
