'use client'

import {
  Box,
  Grid,
  HStack,
  Image,
  Popover,
  Portal,
  Skeleton,
  Stack,
  Text,
  Wrap,
  chakra,
} from '@chakra-ui/react'
import { useCallback, useState, useSyncExternalStore } from 'react'
import {
  LuCalendar,
  LuCalendarCheck,
  LuCalendarClock,
  LuCreditCard,
  LuInfo,
  LuMapPin,
  LuTag,
  LuUser,
} from 'react-icons/lu'

import { publicUserPath } from '@/app/user/[id]/helpers/publicUserHelpers'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing } from '@/theme/styles'
import { orderBookedDatetime } from '@/utils/orderHelpers'
import { formatPrice } from '@/utils/price'
import { formatTimeSlotLabel, isTimeSlotPast } from '@/utils/timeSlots'
import { Avatar, Badge, Button, DetailRow, Link } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { quoteBudgetComparison } from '../../../helpers/quoteBudgetComparison'
import {
  type TaskDetailTimeChip,
  taskDetailCategoryChips,
  taskDetailLocationTown,
  taskDetailTimeChip,
} from '../../../helpers/taskDetailMetaTags'
import {
  budgetKindLabel,
  formatTaskBudgetPaymentMethodLabel,
  taskBudgetDisplayLine,
  taskDetailLocationLabel,
  taskDetailShowsExactLocation,
} from '../../../helpers/taskDetailUtils'
import bag from '../../../i11n.json'

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

/** `Intl` locale for dates and times. */
export function useDateLocale(): string {
  return DATE_LOCALE[useLocale()]
}

function LineSkeleton({ width }: { width: string }) {
  return <Skeleton h={LINE_BOX} w={width} borderRadius="md" />
}

function paymentLabel(method: string | null | undefined): string | null {
  const value = method?.trim()
  return value ? formatTaskBudgetPaymentMethodLabel(value) : null
}

/** Date (and time) badge, plus a countdown badge once the client clock is known. */
function TimeBadges({
  chip,
  label,
  minute,
}: {
  chip: TaskDetailTimeChip
  label: string
  minute: number | null
}) {
  return (
    <Wrap gap={1.5}>
      <Badge variant={chip.tone} shape="pill">
        {label}
      </Badge>
      {minute != null && chip.countdown ? (
        <Badge variant={chip.tone} shape="pill" dot>
          {chip.countdown}
        </Badge>
      ) : null}
    </Wrap>
  )
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

/** One side of the budget-vs-quote comparison. */
function PriceColumn({
  label,
  value,
  detail,
  detailColor = 'text.muted',
  highlight = false,
}: {
  label: string
  value: string
  detail?: string
  detailColor?: string
  highlight?: boolean
}) {
  return (
    <Stack
      gap={1}
      minW={0}
      p={4}
      justify="center"
      textAlign="center"
      borderRadius="lg"
      borderWidth="1px"
      borderColor={highlight ? 'status.success.solid' : 'border.default'}
      bg={highlight ? 'status.success.soft' : 'bg.subtle'}
    >
      <Text
        fontSize="xs"
        fontWeight={500}
        color="text.muted"
        letterSpacing="0.06em"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text
        fontSize="xl"
        fontWeight={700}
        color="text.default"
        lineHeight="short"
      >
        {value}
      </Text>
      {detail ? (
        <Box fontSize="sm" color={detailColor} lineHeight="short">
          {detail}
        </Box>
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

/** Description clamped to six lines, with Show more once it overflows. */
function Description({ text }: { text: string }) {
  const t = useI11n(bag)
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
    <Stack gap={1} align="flex-start">
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
          {expanded ? t.details.showLess : t.details.showMore}
        </Button>
      ) : null}
    </Stack>
  )
}

/** The posted budget, big, with its type and payment method. */
export function BudgetFact() {
  const { task, seed } = useTaskDetail()
  const t = useI11n(bag)
  const line = task ? taskBudgetDisplayLine(task, 'visitor') : seed?.priceLabel
  const kind = budgetKindLabel(task?.budget?.type)
  const payment = paymentLabel(task?.budget?.paymentMethod)

  return (
    <Stack gap={2} py={3}>
      <Text
        fontSize="xs"
        fontWeight={500}
        color="text.muted"
        letterSpacing="0.06em"
        textTransform="uppercase"
      >
        {t.details.budget}
      </Text>
      {line ? (
        <Text
          fontSize={{ base: '4xl', lg: '5xl' }}
          fontWeight={800}
          lineHeight="1"
          letterSpacing="-0.02em"
          color="status.success.fg"
          fontVariantNumeric="tabular-nums"
        >
          {line}
        </Text>
      ) : (
        <Skeleton h="40px" w="42%" borderRadius="md" />
      )}
      {kind || payment ? (
        <Wrap gap={1.5}>
          {kind ? (
            <Badge variant="brand" shape="pill">
              {kind}
            </Badge>
          ) : null}
          {payment ? (
            <Badge variant="neutral" shape="pill">
              <LuCreditCard aria-hidden />
              {payment}
            </Badge>
          ) : null}
        </Wrap>
      ) : null}
    </Stack>
  )
}

/** Payment method alone, when the headline already gives the amount. */
export function PaymentFact() {
  const { task } = useTaskDetail()
  const t = useI11n(bag)
  const payment = paymentLabel(task?.budget?.paymentMethod)
  if (!payment) return null
  return (
    <DetailRow icon={<LuCreditCard />} label={t.details.payment}>
      {payment}
    </DetailRow>
  )
}

/** The worker's pending quote against the budget, and the times they offered. */
export function MyQuoteFact() {
  const { task, myQuote } = useTaskDetail()
  const t = useI11n(bag)
  const locale = useDateLocale()
  if (!task || !myQuote?.price) return null

  const comparison =
    task.budget?.amount != null
      ? quoteBudgetComparison(task.budget.amount, myQuote.price.amount)
      : null
  const versus =
    comparison?.kind === 'match'
      ? { text: t.cta.matchesBudget, color: 'text.muted' }
      : comparison
        ? {
            text: formatMessage(
              comparison.kind === 'under'
                ? t.cta.underBudget
                : t.cta.overBudget,
              {
                amount: formatPrice({
                  amount: comparison.difference,
                  currency: myQuote.price.currency,
                }),
              },
            ),
            color:
              comparison.kind === 'under'
                ? 'status.success.fg'
                : 'status.warning.fg',
          }
        : null

  return (
    <Stack gap={0} pt={3}>
      <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={3}>
        <PriceColumn
          label={t.cta.clientBudget}
          value={taskBudgetDisplayLine(task, 'visitor')}
          detail={[
            budgetKindLabel(task.budget?.type),
            paymentLabel(task.budget?.paymentMethod),
          ]
            .filter(Boolean)
            .join(' · ')}
        />
        <PriceColumn
          label={t.cta.askingPrice}
          value={formatPrice(myQuote.price)}
          detail={versus?.text}
          detailColor={versus?.color}
          highlight
        />
      </Grid>
      {myQuote.proposedSlots.length > 0 ? (
        <DetailRow icon={<LuCalendarClock />} label={t.quotes.proposedTimes}>
          <Stack gap={1}>
            {myQuote.proposedSlots.map((slot) => {
              const past = isTimeSlotPast(slot)
              return (
                <Text key={slot.id} color={past ? 'text.muted' : undefined}>
                  {formatTimeSlotLabel(slot, locale)}
                  {past ? ` · ${t.quotes.pastSlot}` : ''}
                </Text>
              )
            })}
          </Stack>
        </DetailRow>
      ) : null}
    </Stack>
  )
}

/** The poster's preferred time, with a countdown when it's close. */
export function PreferredTimeFact() {
  const { task } = useTaskDetail()
  const t = useI11n(bag)
  const locale = useDateLocale()
  const minute = useClientMinute()
  // Day labels need a clock; the countdown waits for the client minute.
  const now = minute == null ? new Date() : new Date(minute * MINUTE_MS)
  const chip = task ? taskDetailTimeChip(task, t.meta, now, locale) : null

  return (
    <DetailRow icon={<LuCalendar />} label={t.details.when}>
      {chip ? (
        <TimeBadges chip={chip} label={chip.label} minute={minute} />
      ) : (
        <LineSkeleton width="45%" />
      )}
    </DetailRow>
  )
}

/** The booked slot, with a countdown before it starts. */
export function BookedTimeFact() {
  const { myOrder } = useTaskDetail()
  const t = useI11n(bag)
  const locale = useDateLocale()
  const minute = useClientMinute()
  if (!myOrder) return null
  const now = minute == null ? new Date() : new Date(minute * MINUTE_MS)
  const chip = taskDetailTimeChip(
    { datetime: orderBookedDatetime(myOrder) },
    t.meta,
    now,
    locale,
  )

  return (
    <DetailRow icon={<LuCalendarCheck />} label={t.booking.schedule}>
      <TimeBadges
        chip={chip}
        label={formatTimeSlotLabel(
          { start: myOrder.bookedStart, end: myOrder.bookedEnd },
          locale,
        )}
        minute={minute}
      />
    </DetailRow>
  )
}

function mapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
}

/**
 * "Near {town}" with an info icon for everyone else; the exact address for
 * the poster and the booked worker (who also gets Open in Maps).
 */
export function LocationFact() {
  const { task, seed, myOrder, permissions } = useTaskDetail()
  const t = useI11n(bag)
  const exact = taskDetailShowsExactLocation({
    myOrder,
    showFullAddress: permissions.showFullAddress,
  })
  const label = task
    ? taskDetailLocationLabel({ task, myOrder, showExactLocation: exact })
    : seed?.location
  const lat = myOrder?.snapshot.location?.lat
  const lng = myOrder?.snapshot.location?.lng
  const mapsHref =
    typeof lat === 'number' && typeof lng === 'number'
      ? mapsDirectionsUrl(lat, lng)
      : null
  // FE-70: the poster is told what workers see before acceptance.
  const note =
    !myOrder && exact && permissions.isOwner
      ? t.details.locationOwnerNote
      : undefined

  return (
    <DetailRow icon={<LuMapPin />} label={t.details.location} subLine={note}>
      {!label ? (
        <LineSkeleton width="55%" />
      ) : exact ? (
        <Stack gap={1} align="flex-start">
          <Text as="span">{label}</Text>
          {mapsHref ? (
            <Link
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              fontSize="sm"
            >
              {t.booking.openMaps}
            </Link>
          ) : null}
        </Stack>
      ) : (
        <HStack as="span" gap={1.5} display="inline-flex" flexWrap="wrap">
          <span>
            {formatMessage(t.details.nearTown, {
              town: taskDetailLocationTown(label),
            })}
          </span>
          <LocationHint
            label={t.details.locationHint}
            note={t.details.locationApproxNote}
          />
        </HStack>
      )}
    </DetailRow>
  )
}

export function CategoriesFact() {
  const { task } = useTaskDetail()
  const t = useI11n(bag)
  const categories = task ? taskDetailCategoryChips(task) : null
  if (categories?.length === 0) return null

  return (
    <DetailRow icon={<LuTag />} label={t.details.categories}>
      {categories ? (
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
      ) : (
        <LineSkeleton width="35%" />
      )}
    </DetailRow>
  )
}

export function PostedByFact() {
  const { task, permissions } = useTaskDetail()
  const t = useI11n(bag)
  const posterId = task?.poster?.id?.trim()
  if (!task || !posterId || permissions.isOwner) return null
  const name = task.poster?.profile?.name?.trim() || t.details.ownerFallback

  return (
    <DetailRow icon={<LuUser />} label={t.details.postedBy}>
      <Link
        href={publicUserPath(posterId, task.id)}
        aria-label={formatMessage(t.details.viewProfile, { name })}
        display="inline-flex"
        alignItems="center"
        gap={2}
        minW={0}
        maxW="full"
      >
        <Avatar
          size="xs"
          name={name}
          src={task.poster?.profile?.avatarUrl?.trim() || undefined}
        />
        <Text as="span" truncate>
          {name}
        </Text>
      </Link>
    </DetailRow>
  )
}

export function DescriptionFact() {
  const { task, seed } = useTaskDetail()
  const text = (task ?? seed)?.description?.trim()
  if (task && !text) return null

  return (
    <Box py={3} data-fact="description">
      {text ? (
        <Description text={text} />
      ) : (
        <Stack gap={2}>
          <LineSkeleton width="90%" />
          <LineSkeleton width="70%" />
        </Stack>
      )}
    </Box>
  )
}

/** Square thumbnails under the description; no title. */
export function PhotosFact() {
  const { task, seed } = useTaskDetail()
  const t = useI11n(bag)
  const seedImage = seed?.thumbnailSrc?.trim()
  const images = task
    ? task.images.filter((src): src is string => Boolean(src?.trim()))
    : seedImage
      ? [seedImage]
      : []
  if (images.length === 0) return null
  const title = (task ?? seed)?.title?.trim() || t.fallbackTask

  return (
    <Wrap gap={2} py={3} data-fact="photos">
      {images.map((src, index) => (
        <Box
          key={src}
          boxSize={{ base: '84px', md: '96px' }}
          borderRadius="lg"
          overflow="hidden"
          borderWidth="1px"
          borderColor="border.default"
          bg="bg.subtle"
          flexShrink={0}
        >
          <Image
            src={src}
            alt={formatMessage(t.details.photoAlt, { title, n: index + 1 })}
            w="full"
            h="full"
            objectFit="cover"
          />
        </Box>
      ))}
    </Wrap>
  )
}
