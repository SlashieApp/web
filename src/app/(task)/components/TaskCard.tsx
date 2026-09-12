'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { MouseEvent } from 'react'
import { Fragment, useState } from 'react'
import { LuBadgeCheck, LuBookmark } from 'react-icons/lu'

import type { WorkerQuoteRow } from '@/app/(dashboard)/helpers/workerQuoteJobs'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { ViewTransition } from '@/ui/ViewTransition'
import { Badge, Button, Card, IconButton, Link, Thumbnail } from '@ui'

import { sdlMotion } from '@/theme/styles'

import { taskCardMetaParts } from '../helpers/taskBrowseHelpers'
import {
  setTaskHandoff,
  taskHandoffFor,
  taskVtName,
} from '../helpers/taskCardHandoff'
import { TaskCardWorkerQuote } from './TaskCardWorkerQuote'
import bag from './i11n.json'

/** Optional discovery trust crumb — rendered only when the API has a signal. */
export type TaskCardTrust =
  | { kind: 'verified' }
  | { kind: 'jobsDone'; count: number }

/** Card-shaped task for list/carousel rows (`location` maps to the pin/meta line). */
export type TaskCardTask = {
  id: string
  title: string
  description: string
  location: string
  /** Empty when the task has no budget — the £ slot is omitted. */
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
  trust?: TaskCardTrust
}

type TaskCardShared = {
  detailsHref?: string
  detailsCtaLabel?: string
  /** Fires when the details CTA link is clicked (analytics / handoff). */
  onOpenDetails?: () => void
  isActive?: boolean
  /** Taller selected-row treatment (web list). Anatomy stays the same. */
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
  /**
   * When true, `onActivate` navigates to task detail (second click on the
   * selected web row, or a centered mobile card). Arms the shared-element
   * morph. First-click map selection should leave this false.
   */
  navigateOnActivate?: boolean
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
  trust?: TaskCardTrust
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

function taskIdFromDetailsHref(href: string): string | undefined {
  const match = href.match(/\/tasks\/([^/?#]+)/)
  return match?.[1]
}

function TaskCardBrowse(props: TaskCardBrowseProps) {
  const t = useI11n(bag)
  const isActive = props.isActive ?? false
  const isExpanded = props.isExpanded ?? false
  const showDetailsCta = props.showDetailsCta ?? false
  const isSaved = props.isSaved ?? false
  const onToggleSave = props.onToggleSave
  const onActivate = props.onActivate
  const onOpenDetails = props.onOpenDetails
  const navigateOnActivate = props.navigateOnActivate ?? false
  const activateCursor = props.activateCursor ?? 'pointer'
  const activateMode = props.activateMode ?? 'button'

  let cardTask: TaskCardTask
  let detailsHref: string

  if (isTaskCardWithTask(props)) {
    cardTask = props.task
    detailsHref = props.detailsHref ?? `/tasks/${props.task.id}`
  } else {
    detailsHref = props.detailsHref
    cardTask = {
      id: taskIdFromDetailsHref(props.detailsHref) ?? props.detailsHref,
      title: props.title,
      description: props.description,
      location: props.metaLine,
      priceLabel: props.priceLabel,
      badgeText: props.badgeText,
      distanceLabel: props.distanceLabel,
      timingLabel: props.timingLabel,
      quotesLabel: props.quotesLabel,
      viewsLabel: props.viewsLabel,
      thumbnailSrc: props.thumbnailSrc,
      trust: props.trust,
    }
  }

  const {
    id: taskId,
    title,
    priceLabel,
    badgeText,
    distanceLabel,
    timingLabel,
    thumbnailSrc,
    trust,
  } = cardTask

  const [morphing, setMorphing] = useState(
    () => taskHandoffFor(taskId) !== null,
  )

  const armMorph = () => {
    setTaskHandoff(cardTask)
    setMorphing(true)
  }

  const handleActivate = onActivate
    ? () => {
        if (navigateOnActivate) armMorph()
        onActivate()
      }
    : undefined

  const detailsCtaLabel = props.detailsCtaLabel ?? t.detailsCta
  const activateAriaLabel =
    props.activateAriaLabel ?? `${title}. Select to highlight on map.`
  const showBadge = Boolean(badgeText?.trim())
  const metaParts = taskCardMetaParts({
    priceLabel,
    distanceLabel,
    timingLabel,
  })
  const trustLabel =
    trust?.kind === 'verified'
      ? t.trustVerified
      : trust?.kind === 'jobsDone'
        ? formatMessage(t.trustJobsDone, { count: trust.count })
        : null

  const handleToggleSave = onToggleSave
    ? (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        onToggleSave()
      }
    : undefined

  const shell = (
    <Card
      isActive={isActive}
      p={{ base: 3, md: isExpanded ? 3.5 : 3 }}
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
      <HStack gap={{ base: 3, md: 3.5 }} align="stretch">
        <ViewTransition
          name={
            morphing && thumbnailSrc ? taskVtName('img', taskId) : undefined
          }
          share="auto"
          default="none"
        >
          <Thumbnail
            alt={`${title} thumbnail`}
            src={thumbnailSrc}
            size="sm"
            minW={{ base: '72px', md: '80px' }}
            alignSelf="flex-start"
          />
        </ViewTransition>
        <Stack flex={1} minW={0} gap={1.5}>
          <Stack gap={1} minW={0} align="flex-start">
            {showBadge ? (
              // Active card bg is the same soft green as the brand pill —
              // switch the pill to a surface fill so it stays visible.
              <Badge shape="pill" bg={isActive ? 'bg.surface' : undefined}>
                {badgeText}
              </Badge>
            ) : null}
            <ViewTransition
              name={morphing ? taskVtName('title', taskId) : undefined}
              share="vt-text"
              default="none"
            >
              <Text
                fontSize="md"
                fontWeight={700}
                color="text.default"
                lineHeight="1.3"
                lineClamp={2}
                maxW="full"
              >
                {title}
              </Text>
            </ViewTransition>
          </Stack>

          {metaParts.length > 0 ? (
            <HStack gap={1} minW={0} flexWrap="wrap" align="baseline">
              {metaParts.map((part) => {
                const isBudget = part === priceLabel?.trim()
                const isFirst = part === metaParts[0]
                const label = (
                  <Text
                    fontSize="sm"
                    fontWeight={isBudget ? 800 : 500}
                    color={isBudget ? 'text.link' : 'text.muted'}
                    lineClamp={1}
                  >
                    {part}
                  </Text>
                )
                return (
                  <Fragment key={part}>
                    {isFirst ? null : (
                      <Text
                        as="span"
                        color="text.muted"
                        fontSize="xs"
                        aria-hidden
                      >
                        ·
                      </Text>
                    )}
                    {isBudget ? (
                      <ViewTransition
                        name={
                          morphing ? taskVtName('price', taskId) : undefined
                        }
                        share="vt-text"
                        default="none"
                      >
                        {label}
                      </ViewTransition>
                    ) : (
                      label
                    )}
                  </Fragment>
                )
              })}
            </HStack>
          ) : null}

          {trustLabel ? (
            <HStack gap={1} color="text.muted" minW={0}>
              <Box as="span" aria-hidden display="inline-flex" flexShrink={0}>
                <LuBadgeCheck size={14} strokeWidth={2.25} />
              </Box>
              <Text fontSize="xs" fontWeight={600} lineClamp={1}>
                {trustLabel}
              </Text>
            </HStack>
          ) : null}

          {showDetailsCta || handleToggleSave ? (
            <HStack gap={1} pt={0.5} justify="flex-end" flexShrink={0}>
              {showDetailsCta ? (
                <Button
                  asChild
                  size="sm"
                  minW={{ md: '106px' }}
                  h={9}
                  px={{ base: 3, md: 4 }}
                  borderRadius="lg"
                  whiteSpace="nowrap"
                  flexShrink={0}
                >
                  <Link
                    href={detailsHref}
                    onClick={(e) => {
                      e.stopPropagation()
                      armMorph()
                      onOpenDetails?.()
                    }}
                    _hover={{ textDecoration: 'none' }}
                  >
                    {detailsCtaLabel}
                  </Link>
                </Button>
              ) : null}
              {handleToggleSave ? (
                <IconButton
                  aria-label={formatMessage(
                    isSaved ? t.bookmarkRemove : t.bookmarkAdd,
                    { title },
                  )}
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
          ) : null}
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
          onClick={handleActivate}
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
        onClick={handleActivate}
        onKeyDown={(e) => {
          // Only card-level keypresses activate; inner controls (bookmark,
          // details CTA) handle their own Enter/Space.
          if (e.target !== e.currentTarget) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleActivate?.()
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
