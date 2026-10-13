'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import {
  Box,
  HStack,
  Popover,
  Portal,
  Skeleton,
  Stack,
  Text,
  Wrap,
  chakra,
} from '@chakra-ui/react'
import {
  type ReactNode,
  useCallback,
  useState,
  useSyncExternalStore,
} from 'react'
import { LuCalendar, LuInfo, LuMapPin, LuTag, LuUser } from 'react-icons/lu'

import { publicUserPath } from '@/app/user/[id]/helpers/publicUserHelpers'
import { sdlFocusRing } from '@/theme/styles'
import { Avatar, Badge, Button, Card, DetailRow, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import {
  taskDetailCategoryChips,
  taskDetailLocationTown,
  taskDetailTimeChip,
} from '../../helpers/taskDetailMetaTags'
import {
  taskDetailLocationLabel,
  taskDetailShowsExactLocation,
} from '../../helpers/taskDetailUtils'
import bag from '../../i11n.json'

const LINE_BOX = 'calc(0.875rem * 1.5)'
const DESCRIPTION_LINES = 6
const DATE_LOCALE = { en: 'en-GB', 'zh-hk': 'zh-HK' } as const
const MINUTE_MS = 60_000

const HintButton = chakra('button')

function subscribeMinute(onChange: () => void) {
  const id = window.setInterval(onChange, MINUTE_MS)
  return () => window.clearInterval(id)
}

/** Current minute on the client, null while server rendering. */
function useClientMinute(): number | null {
  return useSyncExternalStore(
    subscribeMinute,
    () => Math.floor(Date.now() / MINUTE_MS),
    () => null,
  )
}

function TextLineSkeleton({ width }: { width: string }) {
  return <Skeleton h={LINE_BOX} w={width} borderRadius="md" />
}

/** Info icon next to an approximate address: shows the note on hover or tap. */
function LocationHint({ label, note }: { label: string; note: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover.Root
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      positioning={{ placement: 'top', gutter: 6 }}
    >
      <Popover.Trigger asChild>
        <HintButton
          type="button"
          aria-label={label}
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          boxSize="28px"
          m="-4px"
          borderRadius="full"
          color="text.muted"
          cursor="pointer"
          verticalAlign="middle"
          _hover={{ color: 'text.default' }}
          _focusVisible={sdlFocusRing}
          onPointerEnter={(e) => {
            if (e.pointerType === 'mouse') setOpen(true)
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === 'mouse') setOpen(false)
          }}
        >
          <LuInfo size={16} aria-hidden />
        </HintButton>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content maxW="280px" borderRadius="md">
            <Popover.Body
              p={3}
              fontSize="sm"
              fontWeight={400}
              color="text.default"
            >
              {note}
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}

/** Description clamped to six lines, with Show more once it overflows. */
function Description({
  text,
  showMore,
  showLess,
}: {
  text: string
  showMore: string
  showLess: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const measure = useCallback((node: HTMLParagraphElement | null) => {
    if (!node) return
    const check = () => setOverflows(node.scrollHeight > node.clientHeight + 1)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Stack gap={1} align="flex-start" pb={2}>
      <Text
        ref={measure}
        fontSize="md"
        color="text.default"
        lineHeight="tall"
        whiteSpace="pre-line"
        lineClamp={expanded ? undefined : DESCRIPTION_LINES}
      >
        {text}
      </Text>
      {expanded || overflows ? (
        <Button
          variant="ghost"
          size="sm"
          px={0}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? showLess : showMore}
        </Button>
      ) : null}
    </Stack>
  )
}

/** First (primary) category in brand, the rest neutral; each links to search. */
function CategoryChip({
  label,
  href,
  primary,
}: {
  label: string
  href: string | null
  primary: boolean
}) {
  const chip = (
    <Badge variant={primary ? 'brand' : 'neutral'} shape="pill">
      {label}
    </Badge>
  )
  if (!href) return chip
  return (
    <Link
      href={href}
      display="inline-flex"
      borderRadius="full"
      _hover={{ textDecoration: 'none', opacity: 0.85 }}
    >
      {chip}
    </Link>
  )
}

function Row({
  icon,
  label,
  children,
  subLine,
  pending,
  skeletonWidth = '45%',
  last = false,
}: {
  icon: ReactNode
  label: string
  children?: ReactNode
  subLine?: string
  pending?: boolean
  skeletonWidth?: string
  last?: boolean
}) {
  if (!children && !pending) return null
  return (
    <DetailRow icon={icon} label={label} subLine={subLine} withDivider={!last}>
      {children ?? <TextLineSkeleton width={skeletonWidth} />}
    </DetailRow>
  )
}

/**
 * Task facts (FE-258): description first, then location (an info icon marks
 * an approximate address), every category, the time chip, and who posted it.
 * The title lives in the page header, not here.
 */
export function TaskDetailsCard() {
  const { task, seed, pending, myOrder, permissions } = useTaskDetail()
  const t = useI11n(bag)
  const locale = useLocale()
  const minute = useClientMinute()

  if (!task && !pending) return null

  const loading = pending && !task
  const description = task
    ? task.description?.trim()
    : seed?.description?.trim()
  const showExactLocation = taskDetailShowsExactLocation({
    myOrder,
    showFullAddress: permissions.showFullAddress,
  })
  const locationLabel = task
    ? taskDetailLocationLabel({ task, myOrder, showExactLocation })
    : seed?.location
  const categories = task ? taskDetailCategoryChips(task) : []
  // Day labels need a clock; the countdown waits for the client minute.
  const time = task
    ? taskDetailTimeChip(
        task,
        t.meta,
        minute == null ? new Date() : new Date(minute * MINUTE_MS),
        DATE_LOCALE[locale],
      )
    : null
  const countdown = minute == null ? null : time?.countdown
  const posterId = task?.poster?.id?.trim() || null
  const posterName =
    task?.poster?.profile?.name?.trim() || t.details.ownerFallback
  const showPoster = Boolean(task && posterId && !permissions.isOwner)

  const location = locationLabel ? (
    showExactLocation ? (
      locationLabel
    ) : (
      <HStack as="span" gap={1.5} display="inline-flex" flexWrap="wrap">
        <span>
          {formatMessage(t.details.nearTown, {
            town: taskDetailLocationTown(locationLabel),
          })}
        </span>
        <LocationHint
          label={t.details.locationHint}
          note={t.details.locationApproxNote}
        />
      </HStack>
    )
  ) : null
  // FE-70: the poster is told what workers see before acceptance.
  const locationNote =
    !myOrder && showExactLocation && permissions.isOwner
      ? t.details.locationOwnerNote
      : undefined

  const rows = (
    <Stack gap={0} minW={0}>
      <Row
        icon={<LuMapPin />}
        label={t.details.location}
        subLine={locationNote}
        pending={loading}
        skeletonWidth="55%"
      >
        {location}
      </Row>
      <Row
        icon={<LuTag />}
        label={t.details.categories}
        pending={loading}
        skeletonWidth="35%"
      >
        {categories.length > 0 ? (
          <Wrap gap={1.5}>
            {categories.map((category, index) => (
              <CategoryChip
                key={category.label.toLowerCase()}
                label={category.label}
                href={category.href}
                primary={index === 0}
              />
            ))}
          </Wrap>
        ) : null}
      </Row>
      <Row
        icon={<LuCalendar />}
        label={t.details.when}
        pending={loading}
        last={!showPoster}
      >
        {time ? (
          <Wrap gap={1.5}>
            <Badge variant={time.tone} shape="pill">
              {time.label}
            </Badge>
            {countdown ? (
              <Badge variant={time.tone} shape="pill" dot>
                {countdown}
              </Badge>
            ) : null}
          </Wrap>
        ) : null}
      </Row>
      {showPoster && posterId && task ? (
        <Row icon={<LuUser />} label={t.details.postedBy} last>
          <Link
            href={publicUserPath(posterId, task.id)}
            aria-label={formatMessage(t.details.viewProfile, {
              name: posterName,
            })}
            display="inline-flex"
            alignItems="center"
            gap={2}
            minW={0}
            maxW="full"
          >
            <Avatar
              size="xs"
              name={posterName}
              src={task.poster?.profile?.avatarUrl?.trim() || undefined}
            />
            <Text as="span" truncate>
              {posterName}
            </Text>
          </Link>
        </Row>
      ) : null}
    </Stack>
  )

  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      eyebrow={t.details.heading}
      aria-busy={loading ? true : undefined}
    >
      {description ? (
        <Description
          text={description}
          showMore={t.details.showMore}
          showLess={t.details.showLess}
        />
      ) : loading ? (
        <Stack gap={2} pb={2}>
          <TextLineSkeleton width="90%" />
          <TextLineSkeleton width="70%" />
        </Stack>
      ) : null}
      {rows}
    </Card>
  )
}
