'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import {
  type WorkerQuoteRow,
  type WorkerQuoteStage,
  workerQuotePricePence,
  workerQuoteStage,
  workerQuoteStageLabel,
  workerQuoteTimelineSteps,
} from '@/app/(dashboard)/helpers/workerQuoteJobs'
import { PostedTaskTimeline } from '@/app/(dashboard)/requests/components/PostedTaskTimeline'
import { formatPounds, formatRelativePosted } from '@/utils/dashboardHelpers'
import { isOrderClosed, taskOrderSectionHref } from '@/utils/orderHelpers'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { Avatar, Badge, Button, Card, Link, Rating, Thumbnail } from '@ui'

/** Card-shaped task for list/carousel rows (`location` maps to the pin/meta line). */
export type TaskCardTask = {
  id: string
  title: string
  description: string
  location: string
  priceLabel: string
  badgeText?: string
  distanceLabel?: string
  /** Public views line from GraphQL (`task.views`). */
  viewsLabel?: string
  ownerName?: string
  ownerAvatarSrc?: string
  ratingLabel?: string
  thumbnailSrc?: string
}

type TaskCardShared = {
  detailsHref?: string
  detailsCtaLabel?: string
  isActive?: boolean
  /** Taller layout with description (web list selection). */
  isExpanded?: boolean
  /** When false, hides the details CTA (e.g. unselected rows in web TaskList). */
  showDetailsCta?: boolean
  /** Overrides default “select on map” label when `onActivate` opens task detail. */
  activateAriaLabel?: string
  /** Cursor on the activatable shell (e.g. `grab` in a draggable carousel). */
  activateCursor?: 'pointer' | 'grab'
  /**
   * `gesture` — plain surface so horizontal swipes reach Embla (mobile carousel).
   * `button` — focusable control (lists, keyboard).
   */
  activateMode?: 'button' | 'gesture'
  onActivate?: () => void
}

type TaskCardWithTask = TaskCardShared & {
  task: TaskCardTask
}

type TaskCardLegacy = TaskCardShared & {
  title: string
  description: string
  priceLabel: string
  metaLine: string
  distanceLabel?: string
  /** Public views line from GraphQL (`task.views`). */
  viewsLabel?: string
  ownerName?: string
  ownerAvatarSrc?: string
  ratingLabel?: string
  thumbnailSrc?: string
  detailsHref: string
  badgeText?: string
}

export type TaskCardWorkerQuoteProps = WorkerQuoteRow & {
  variant: 'workerQuote'
  /** Storybook / tests: start with timeline and details visible. */
  initialExpanded?: boolean
}

type TaskCardBrowseProps = (TaskCardWithTask | TaskCardLegacy) & {
  variant?: 'browse'
}

export type TaskCardProps = TaskCardBrowseProps | TaskCardWorkerQuoteProps

function isWorkerQuoteCard(
  props: TaskCardProps,
): props is TaskCardWorkerQuoteProps {
  return props.variant === 'workerQuote'
}

function isTaskCardWithTask(
  props: TaskCardBrowseProps,
): props is TaskCardWithTask {
  return 'task' in props && props.task != null
}

export function TaskCard(props: TaskCardProps) {
  if (isWorkerQuoteCard(props)) {
    return <TaskCardWorkerQuote {...props} />
  }

  return <TaskCardBrowse {...props} />
}

function TaskCardWorkerQuote({
  task,
  quote,
  workerOrder,
  initialExpanded = false,
}: TaskCardWorkerQuoteProps) {
  const [expanded, setExpanded] = useState(initialExpanded)
  const stage = workerQuoteStage(task, quote, workerOrder)
  const thumbnailSrc = task.images?.[0] ?? undefined
  const timelineSteps = workerQuoteTimelineSteps(task, quote, workerOrder)
  const quotePence = workerQuotePricePence(quote, workerOrder)
  const orderClosed = workerOrder ? isOrderClosed(workerOrder.status) : false
  const taskHref = `/tasks/${task.id}`

  const primaryCta =
    stage === 'booked' && workerOrder && !orderClosed
      ? {
          label: 'Manage job',
          href: taskOrderSectionHref(task.id),
          variant: 'primary' as const,
        }
      : stage === 'closed' || (stage === 'booked' && orderClosed)
        ? {
            label: 'View job',
            href: taskOrderSectionHref(task.id),
            variant: 'secondary' as const,
          }
        : stage === 'pending'
          ? {
              label: 'Open task',
              href: taskHref,
              variant: 'primary' as const,
            }
          : {
              label: 'Open task',
              href: taskHref,
              variant: 'ghost' as const,
            }

  const sentLabel = formatRelativePosted(quote.createdAt).replace(
    /^Posted /,
    'Sent ',
  )
  const summaryMeta =
    quotePence != null && quotePence > 0
      ? `${formatPounds(quotePence)} · ${sentLabel}`
      : sentLabel

  const showSecondaryCta =
    expanded && primaryCta.href !== taskHref && primaryCta.label !== 'Open task'

  return (
    <Card layout="section" p={0} overflow="hidden">
      <Box
        as="button"
        w="full"
        textAlign="left"
        p={5}
        cursor="pointer"
        bg="transparent"
        border="none"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
      >
        <HStack justify="space-between" align="flex-start" gap={3}>
          <HStack align="flex-start" gap={3} flex={1} minW={0}>
            <Thumbnail alt={`${task.title} thumbnail`} src={thumbnailSrc} />
            <Stack gap={1} minW={0}>
              <Heading size="sm" lineClamp={2}>
                {task.title}
              </Heading>
              <Text fontSize="sm" color="formLabelMuted">
                {taskPublicLocationLabel(task) || 'Location TBC'}
              </Text>
              <Text fontSize="sm" fontWeight={600} color="cardFg">
                {summaryMeta}
              </Text>
            </Stack>
          </HStack>
          <Stack align="flex-end" gap={2} flexShrink={0}>
            <WorkerQuoteStageBadge stage={stage} />
            <WorkerQuoteChevronIcon expanded={expanded} />
          </Stack>
        </HStack>
      </Box>

      <HStack
        px={5}
        pb={4}
        pt={2}
        gap={2}
        justify="flex-end"
        flexWrap="wrap"
        borderTopWidth="1px"
        borderColor="cardBorder"
      >
        <Link href={taskHref} _hover={{ textDecoration: 'none' }}>
          <Button size="sm" variant="primary">
            Open task
          </Button>
        </Link>
      </HStack>

      {expanded ? (
        <Stack
          gap={4}
          px={5}
          pb={5}
          pt={0}
          borderTopWidth="1px"
          borderColor="cardBorder"
        >
          {quote.message ? (
            <Text fontSize="sm" color="formLabelMuted" fontStyle="italic">
              “{quote.message}”
            </Text>
          ) : null}

          <PostedTaskTimeline steps={timelineSteps} />

          {showSecondaryCta ? (
            <HStack justify="flex-end" flexWrap="wrap" gap={2}>
              <Link href={primaryCta.href} _hover={{ textDecoration: 'none' }}>
                <Button size="sm" variant={primaryCta.variant}>
                  {primaryCta.label}
                </Button>
              </Link>
            </HStack>
          ) : null}
        </Stack>
      ) : null}
    </Card>
  )
}

function WorkerQuoteChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <Box
      as="span"
      display="inline-flex"
      color="formLabelMuted"
      transform={expanded ? 'rotate(180deg)' : 'rotate(0deg)'}
      transition="transform 0.15s ease"
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <title>Expand</title>
        <path
          d="m6 9 6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

function WorkerQuoteStageBadge({ stage }: { stage: WorkerQuoteStage }) {
  const tone =
    stage === 'booked'
      ? { bg: 'primary.100', color: 'primary.800' }
      : stage === 'closed'
        ? { bg: 'badgeBg', color: 'cardFg' }
        : stage === 'ended'
          ? { bg: 'neutral.200', color: 'formLabelMuted' }
          : { bg: 'badgeBg', color: 'cardFg' }

  return (
    <Badge bg={tone.bg} color={tone.color} flexShrink={0}>
      {workerQuoteStageLabel(stage)}
    </Badge>
  )
}

function TaskCardBrowse(props: TaskCardBrowseProps) {
  const isActive = props.isActive ?? false
  const isExpanded = props.isExpanded ?? false
  const showDetailsCta = props.showDetailsCta ?? true
  const onActivate = props.onActivate
  const activateCursor = props.activateCursor ?? 'pointer'
  const activateMode = props.activateMode ?? 'button'

  let title: string
  let description: string
  let priceLabel: string
  let metaLine: string
  let distanceLabel: string | undefined
  let viewsLabel: string | undefined
  let ownerName: string | undefined
  let ownerAvatarSrc: string | undefined
  let ratingLabel: string | undefined
  let thumbnailSrc: string | undefined
  let detailsHref: string
  let badgeText: string | undefined

  if (isTaskCardWithTask(props)) {
    const { task } = props
    title = task.title
    description = task.description
    priceLabel = task.priceLabel
    metaLine = task.location
    distanceLabel = task.distanceLabel
    viewsLabel = task.viewsLabel
    ownerName = task.ownerName
    ownerAvatarSrc = task.ownerAvatarSrc
    ratingLabel = task.ratingLabel
    thumbnailSrc = task.thumbnailSrc
    detailsHref = props.detailsHref ?? `/tasks/${task.id}`
    badgeText = task.badgeText
  } else {
    title = props.title
    description = props.description
    priceLabel = props.priceLabel
    metaLine = props.metaLine
    distanceLabel = props.distanceLabel
    viewsLabel = props.viewsLabel
    ownerName = props.ownerName
    ownerAvatarSrc = props.ownerAvatarSrc
    ratingLabel = props.ratingLabel
    thumbnailSrc = props.thumbnailSrc
    detailsHref = props.detailsHref
    badgeText = props.badgeText
  }

  const detailsCtaLabel = props.detailsCtaLabel ?? 'View details'
  const activateAriaLabel =
    props.activateAriaLabel ?? `${title}. Select to highlight on map.`
  const descriptionText = description?.trim()
  const showDescription = isExpanded && Boolean(descriptionText)
  const showBadge = Boolean(badgeText?.trim())
  const displayOwnerName = ownerName?.trim() || 'Task owner'
  const displayRatingLabel = ratingLabel?.trim()

  const shell = (
    <Card
      isActive={isActive}
      p={{ base: 2, md: isExpanded ? 3.5 : 2 }}
      px={{ base: 3, md: isExpanded ? 4 : 3 }}
      minH={{ base: '108px', md: isExpanded ? 'auto' : '132px' }}
      maxW="full"
      bg="cardBg"
      boxShadow={isExpanded ? '0 10px 28px rgba(15, 23, 42, 0.1)' : 'card'}
      transition="box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease, padding 200ms ease"
      _hover={
        onActivate
          ? {
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
            }
          : undefined
      }
    >
      <HStack
        gap={{ base: 2.5, md: 4 }}
        align={isExpanded ? 'flex-start' : 'stretch'}
        flexWrap={{ base: 'wrap', md: 'nowrap' }}
      >
        <Thumbnail alt={`${title} thumbnail`} src={thumbnailSrc} />
        <Stack flex={1} minW={0} gap={0}>
          <HStack
            justify="space-between"
            align="center"
            gap={2}
            pb={1}
            minW={0}
          >
            <HStack gap={3} flex={1} minW={0}>
              {showBadge ? <Badge>{badgeText}</Badge> : null}
              {distanceLabel ? (
                <Text fontSize="xs" color="formLabelMuted" truncate>
                  {distanceLabel}
                </Text>
              ) : null}
              {viewsLabel ? (
                <Text fontSize="xs" color="formLabelMuted" truncate>
                  {viewsLabel}
                </Text>
              ) : null}
            </HStack>
          </HStack>

          <Text
            display={{ base: 'none', md: 'block' }}
            fontSize={isExpanded ? '2xl' : 'xl'}
            fontWeight={700}
            color="cardFg"
            lineClamp={isExpanded ? 2 : 1}
            truncate={!isExpanded}
          >
            {title}
          </Text>

          {showDescription ? (
            <Text
              display={{ base: 'none', md: 'block' }}
              fontSize="sm"
              lineHeight="1.5"
              color="formLabelMuted"
              lineClamp={4}
              pb={2}
            >
              {descriptionText}
            </Text>
          ) : null}

          <Stack direction="row" justify="space-between" align="center" pb={2}>
            <Text
              flex={1}
              minW={0}
              fontSize="xs"
              color="formLabelMuted"
              lineClamp={isExpanded ? 2 : 1}
              truncate={!isExpanded}
            >
              {metaLine}
            </Text>
            <Text
              fontWeight={800}
              fontSize={{ base: 'xl', md: '2xl' }}
              lineHeight="1"
              color="cardAccentFg"
              whiteSpace="nowrap"
              flexShrink={0}
            >
              {priceLabel}
            </Text>
          </Stack>

          <HStack
            gap={{ base: 2, md: 3 }}
            minW={0}
            align="center"
            flexWrap="nowrap"
          >
            <HStack gap={2} minW={0} flex={1} overflow="hidden">
              <Box flex={1} minW={0} overflow="hidden">
                <Avatar
                  name={displayOwnerName}
                  src={ownerAvatarSrc}
                  label={displayOwnerName}
                  labelProps={{ flex: 1, minW: 0 }}
                />
              </Box>
              {displayRatingLabel ? (
                <Rating value={displayRatingLabel} />
              ) : null}
            </HStack>
            {showDetailsCta ? (
              <Link
                href={detailsHref}
                onClick={(e) => e.stopPropagation()}
                _hover={{ textDecoration: 'none' }}
                flexShrink={0}
              >
                <Button
                  size="sm"
                  minW={{ md: '106px' }}
                  h={9}
                  px={{ base: 3, md: 4 }}
                  borderRadius="lg"
                  whiteSpace="nowrap"
                >
                  {detailsCtaLabel}
                </Button>
              </Link>
            ) : null}
          </HStack>
        </Stack>
      </HStack>
    </Card>
  )

  if (onActivate) {
    if (activateMode === 'gesture') {
      return (
        <Box
          w="full"
          cursor={activateCursor}
          aria-current={isActive ? 'true' : undefined}
          aria-label={activateAriaLabel}
          onClick={onActivate}
          css={{
            touchAction: 'pan-y',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {shell}
        </Box>
      )
    }

    return (
      <Box
        as="div"
        role="button"
        tabIndex={0}
        aria-current={isActive ? 'true' : undefined}
        aria-label={activateAriaLabel}
        onClick={onActivate}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onActivate()
          }
        }}
        w="full"
        m={0}
        p={0}
        border="none"
        textAlign="left"
        bg="transparent"
        cursor={activateCursor}
        style={{ font: 'inherit' }}
      >
        {shell}
      </Box>
    )
  }

  return shell
}
