'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { MouseEvent, ReactNode } from 'react'
import {
  LuBookmark,
  LuCalendarDays,
  LuEye,
  LuMapPin,
  LuMessageSquareText,
} from 'react-icons/lu'

import type { WorkerQuoteRow } from '@/app/(dashboard)/helpers/workerQuoteJobs'
import { Badge, Button, Card, IconButton, Link, Thumbnail } from '@ui'

import { sdlMotion } from '@/theme/styles'

import { TaskCardWorkerQuote } from './TaskCardWorkerQuote'

/** Card-shaped task for list/carousel rows (`location` maps to the pin/meta line). */
export type TaskCardTask = {
  id: string
  title: string
  description: string
  location: string
  priceLabel: string
  /** Category pill, e.g. "Tech setup". */
  badgeText?: string
  distanceLabel?: string
  /** Compact schedule line, e.g. "Flexible" / "Tomorrow". */
  timingLabel?: string
  /** Quote-count line, e.g. "5 quotes" (owner/worker lists only). */
  quotesLabel?: string
  /** Public views line from GraphQL (`task.views`); fallback when quotes are unavailable. */
  viewsLabel?: string
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
  /** Bookmark state; the button renders only when `onToggleSave` is provided. */
  isSaved?: boolean
  /** Toggles the bookmark. Absent until the save-task API exists. */
  onToggleSave?: () => void
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
  badgeText?: string
  distanceLabel?: string
  timingLabel?: string
  quotesLabel?: string
  /** Public views line from GraphQL (`task.views`). */
  viewsLabel?: string
  thumbnailSrc?: string
  detailsHref: string
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

/** Icon + text meta line (`text.muted`, xs). Icon is decorative. */
function TaskCardMetaRow({
  icon,
  children,
}: {
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <HStack gap={1.5} color="text.muted" fontSize="xs" minW={0}>
      <Box as="span" aria-hidden display="inline-flex" flexShrink={0}>
        {icon}
      </Box>
      <Text fontSize="xs" truncate>
        {children}
      </Text>
    </HStack>
  )
}

function TaskCardBrowse(props: TaskCardBrowseProps) {
  const isActive = props.isActive ?? false
  const isExpanded = props.isExpanded ?? false
  const showDetailsCta = props.showDetailsCta ?? false
  const isSaved = props.isSaved ?? false
  const onToggleSave = props.onToggleSave
  const onActivate = props.onActivate
  const activateCursor = props.activateCursor ?? 'pointer'
  const activateMode = props.activateMode ?? 'button'

  let title: string
  let description: string
  let priceLabel: string
  let metaLine: string
  let badgeText: string | undefined
  let distanceLabel: string | undefined
  let timingLabel: string | undefined
  let quotesLabel: string | undefined
  let viewsLabel: string | undefined
  let thumbnailSrc: string | undefined
  let detailsHref: string

  if (isTaskCardWithTask(props)) {
    const { task } = props
    title = task.title
    description = task.description
    priceLabel = task.priceLabel
    metaLine = task.location
    badgeText = task.badgeText
    distanceLabel = task.distanceLabel
    timingLabel = task.timingLabel
    quotesLabel = task.quotesLabel
    viewsLabel = task.viewsLabel
    thumbnailSrc = task.thumbnailSrc
    detailsHref = props.detailsHref ?? `/tasks/${task.id}`
  } else {
    title = props.title
    description = props.description
    priceLabel = props.priceLabel
    metaLine = props.metaLine
    badgeText = props.badgeText
    distanceLabel = props.distanceLabel
    timingLabel = props.timingLabel
    quotesLabel = props.quotesLabel
    viewsLabel = props.viewsLabel
    thumbnailSrc = props.thumbnailSrc
    detailsHref = props.detailsHref
  }

  const detailsCtaLabel = props.detailsCtaLabel ?? 'View task'
  const activateAriaLabel =
    props.activateAriaLabel ?? `${title}. Select to highlight on map.`
  const descriptionText = description?.trim()
  const showDescription = isExpanded && Boolean(descriptionText)
  const showBadge = Boolean(badgeText?.trim())
  const locationLine = distanceLabel
    ? `${metaLine} · ${distanceLabel}`
    : metaLine
  const engagementLabel = quotesLabel ?? viewsLabel

  const handleToggleSave = onToggleSave
    ? (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        onToggleSave()
      }
    : undefined

  const shell = (
    <Card
      isActive={isActive}
      p={{ base: 3, md: isExpanded ? 4 : 3 }}
      maxW="full"
      bg={isActive ? 'status.success.soft' : 'bg.surface'}
      boxShadow={isExpanded ? 'e3' : 'card'}
      transitionProperty="background-color, box-shadow, transform, border-color, padding"
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
      <HStack gap={{ base: 3, md: 4 }} align="stretch">
        <Thumbnail alt={`${title} thumbnail`} src={thumbnailSrc} />
        <Stack flex={1} minW={0} gap={1}>
          <HStack justify="space-between" align="flex-start" gap={2} minW={0}>
            <Stack gap={1} flex={1} minW={0} align="flex-start">
              {showBadge ? (
                // Active card bg is the same soft green as the brand pill —
                // switch the pill to a surface fill so it stays visible.
                <Badge shape="pill" bg={isActive ? 'bg.surface' : undefined}>
                  {badgeText}
                </Badge>
              ) : null}
              <Text
                fontSize={isExpanded ? 'xl' : 'md'}
                fontWeight={700}
                color="text.default"
                lineClamp={isExpanded ? 2 : 1}
                truncate={!isExpanded}
                maxW="full"
              >
                {title}
              </Text>
            </Stack>
            <Text
              fontWeight={800}
              fontSize={{ base: 'lg', md: 'xl' }}
              lineHeight="1.4"
              color="text.link"
              whiteSpace="nowrap"
              flexShrink={0}
            >
              {priceLabel}
            </Text>
          </HStack>

          {showDescription ? (
            <Text
              display={{ base: 'none', md: 'block' }}
              fontSize="sm"
              lineHeight="1.5"
              color="text.muted"
              lineClamp={4}
              pb={1}
            >
              {descriptionText}
            </Text>
          ) : null}

          <HStack justify="space-between" align="flex-end" gap={2} minW={0}>
            <Stack gap={1} flex={1} minW={0} py={0.5}>
              <TaskCardMetaRow icon={<LuMapPin size={12} strokeWidth={2} />}>
                {locationLine}
              </TaskCardMetaRow>
              {timingLabel ? (
                <TaskCardMetaRow
                  icon={<LuCalendarDays size={12} strokeWidth={2} />}
                >
                  {timingLabel}
                </TaskCardMetaRow>
              ) : null}
              {engagementLabel ? (
                <TaskCardMetaRow
                  icon={
                    quotesLabel ? (
                      <LuMessageSquareText size={12} strokeWidth={2} />
                    ) : (
                      <LuEye size={12} strokeWidth={2} />
                    )
                  }
                >
                  {engagementLabel}
                </TaskCardMetaRow>
              ) : null}
            </Stack>
            <HStack gap={1} flexShrink={0} align="center">
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
              {handleToggleSave ? (
                <IconButton
                  aria-label={
                    isSaved
                      ? `Remove bookmark from ${title}`
                      : `Bookmark ${title}`
                  }
                  aria-pressed={isSaved}
                  onClick={handleToggleSave}
                  color={isSaved ? 'text.link' : 'text.muted'}
                >
                  <LuBookmark
                    size={18}
                    strokeWidth={2}
                    fill={isSaved ? 'currentColor' : 'none'}
                  />
                </IconButton>
              ) : null}
            </HStack>
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
          // Only card-level keypresses activate; inner controls (bookmark,
          // details CTA) handle their own Enter/Space.
          if (e.target !== e.currentTarget) return
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
