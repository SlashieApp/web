'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import type { WorkerQuoteRow } from '@/app/(dashboard)/helpers/workerQuoteJobs'
import { Avatar, Badge, Button, Card, Link, Rating, Thumbnail } from '@ui'

import { sdlMotion } from '@/theme/styles'

import { TaskCardWorkerQuote } from './TaskCardWorkerQuote'

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

function TaskCardBrowse(props: TaskCardBrowseProps) {
  const isActive = props.isActive ?? false
  const isExpanded = props.isExpanded ?? false
  const showDetailsCta = props.showDetailsCta ?? false
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

  const detailsCtaLabel = props.detailsCtaLabel ?? 'View task'
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
      bg="bg.surface"
      boxShadow={isExpanded ? 'e3' : 'card'}
      transitionProperty="box-shadow, transform, border-color, padding"
      transitionDuration={sdlMotion.duration.base}
      transitionTimingFunction={sdlMotion.easing.standard}
      _hover={
        onActivate
          ? {
              boxShadow: 'e3',
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
                <Text fontSize="xs" color="text.muted" truncate>
                  {distanceLabel}
                </Text>
              ) : null}
              {viewsLabel ? (
                <Text fontSize="xs" color="text.muted" truncate>
                  {viewsLabel}
                </Text>
              ) : null}
            </HStack>
          </HStack>

          <Text
            display={{ base: 'none', md: 'block' }}
            fontSize={isExpanded ? '2xl' : 'xl'}
            fontWeight={700}
            color="text.default"
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
              color="text.muted"
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
              color="text.muted"
              lineClamp={isExpanded ? 2 : 1}
              truncate={!isExpanded}
            >
              {metaLine}
            </Text>
            <Text
              fontWeight={800}
              fontSize={{ base: 'xl', md: '2xl' }}
              lineHeight="1"
              color="text.link"
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
