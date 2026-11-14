'use client'

import {
  Box,
  type BoxProps,
  HStack,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react'
import type { ThreadFieldsFragment } from '@codegen/schema'
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { IconType } from 'react-icons'
import {
  LuCalendar,
  LuCalendarClock,
  LuCalendarX,
  LuChevronRight,
  LuHandCoins,
  LuMessageCircle,
} from 'react-icons/lu'

import { useUserStore } from '@/app/(auth)/store/user'
import { OrderCloseCard } from '@/app/(task)/tasks/[slug]/components/overview/OrderCloseCard'
import {
  OrderCancelDialog,
  OrderRescheduleDialog,
  useOrderRequestOptions,
} from '@/app/(task)/tasks/[slug]/components/overview/OrderRequestDialogs'
import { useDateLocale } from '@/app/(task)/tasks/[slug]/components/summary/facts/TaskFacts'
import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import {
  formatTaskBudgetPaymentMethodLabel,
  orderCounterpart,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailUtils'
import taskBag from '@/app/(task)/tasks/[slug]/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFigure, sdlFocusRing } from '@/theme/styles'
import { formatOrderAgreedPrice } from '@/utils/orderHelpers'
import { formatTimeSlotLabel } from '@/utils/timeSlots'
import { Avatar, Drawer } from '@ui'

import bag from '../i11n.json'
import { BOTTOM_PIN_VIEWS } from '../views'
import {
  type ThreadNeed,
  ThreadNeedsYou,
  useThreadNeed,
} from './ThreadBottomPin'
import { QuoteSheetBody } from './ThreadQuote'
import {
  ThreadSheetContext,
  type ThreadSheetControls,
  type ThreadSheetTarget,
  useThreadSheet,
} from './ThreadSheetContext'

const CardButton = chakra('button')

/** Where the composer's text box is, to hand it focus (`ThreadView`). */
export const THREAD_COMPOSER_ATTR = 'data-thread-composer'

/** The booking as a card shows it: who, the agreed price, when, how to pay. */
function useBookingSummary() {
  const { task, myOrder, permissions } = useTaskDetail()
  const taskCopy = useI11n(taskBag)
  const locale = useDateLocale()
  if (!task || !myOrder) return null
  const person = orderCounterpart(task, myOrder, permissions.isOwner, taskCopy)
  const payment = myOrder.snapshot.paymentMethod?.trim()
  return {
    name: person.name,
    avatarUrl: person.avatarUrl,
    price: formatOrderAgreedPrice(myOrder),
    time: formatTimeSlotLabel(
      { start: myOrder.bookedStart, end: myOrder.bookedEnd },
      locale,
    ),
    payment: payment ? formatTaskBudgetPaymentMethodLabel(payment) : null,
  }
}

type BookingSummary = NonNullable<ReturnType<typeof useBookingSummary>>

/**
 * The booking in the Home "Hire and pay directly" language (FE-543): the
 * other person and the agreed price, then, under a hairline, the booked time
 * and how they pay, in the booking's sheet. The pin under the header shows
 * only the status and the time (`ThreadBookingPin`, FE-567).
 */
function BookingFacts({
  summary,
}: {
  summary: BookingSummary
}) {
  const head = (
    <HStack gap={3} align="center">
      <Avatar
        size="lg"
        name={summary.name}
        src={summary.avatarUrl ?? undefined}
      />
      <Stack gap={0.5} flex={1} minW={0}>
        <Text
          fontSize="15px"
          lineHeight="20px"
          fontWeight={500}
          letterSpacing="-0.01em"
          truncate
        >
          {summary.name}
        </Text>
      </Stack>
      <Text
        as="span"
        flexShrink={0}
        fontSize="18px"
        lineHeight="24px"
        color="text.default"
        {...sdlFigure}
      >
        {summary.price}
      </Text>
    </HStack>
  )
  return (
    <>
      {head}
      <Stack
        gap={2}
        mt={3}
        pt={3}
        borderTopWidth="1px"
        borderColor="border.default"
        fontSize="sm"
      >
        <HStack gap={2} align="flex-start">
          <Box as="span" display="inline-flex" mt="3px" color="text.muted">
            <LuCalendar size={14} aria-hidden />
          </Box>
          <Text as="span" fontWeight={500}>
            {summary.time}
          </Text>
        </HStack>
        {summary.payment ? (
          <HStack gap={2} align="flex-start" color="text.muted">
            <Box as="span" display="inline-flex" mt="3px">
              <LuHandCoins size={14} aria-hidden />
            </Box>
            <Text as="span">{summary.payment}</Text>
          </HStack>
        ) : null}
      </Stack>
    </>
  )
}

/** A card's frame: white, a hairline, 12px corners. */
const CARD_FRAME = {
  display: 'block',
  w: 'full',
  p: 4,
  textAlign: 'start',
  bg: 'bg.surface',
  borderRadius: 'lg',
  borderWidth: '1px',
  borderColor: 'border.default',
} as const

/**
 * "Needs you" and the headline, in the warning colour, with a chevron unless
 * the row it sits in has one (the booked pin's).
 */
function NeedsLine({
  need,
  chevron = true,
}: {
  need: ThreadNeed
  chevron?: boolean
}) {
  const t = useI11n(bag)
  return (
    <HStack gap={2} align="center">
      <Box
        as="span"
        aria-hidden
        boxSize="8px"
        flexShrink={0}
        borderRadius="full"
        bg="status.warning.solid"
      />
      <Text flex={1} minW={0} fontSize="sm" lineClamp={2}>
        <Text as="span" fontWeight={500} color="status.warning.fg">
          {t.pin.needsYou}
        </Text>
        {' · '}
        {need.headline}
      </Text>
      {chevron ? <PinChevron /> : null}
    </HStack>
  )
}

function PinChevron() {
  return (
    <Box
      as="span"
      display="inline-flex"
      flexShrink={0}
      color="text.subtle"
      aria-hidden
    >
      <LuChevronRight size={16} />
    </Box>
  )
}

/**
 * The top pin as one flat band (FE-567): no card inside it. When it opens the
 * sheet the whole band is the button, with a hover fill and the focus ring.
 */
const PIN_BAND_BUTTON = {
  display: 'block',
  w: 'full',
  textAlign: 'start',
  bg: 'transparent',
  cursor: 'pointer',
  css: {
    touchAction: 'manipulation',
    '&:hover': { bg: 'bg.subtle' },
    '&:focus-visible': { ...sdlFocusRing, outlineOffset: '-2px' },
  },
} as const

/**
 * The booked pin under the thread's header (FE-543, flat since FE-567): the
 * status pill and when the job is, then, when something needs the viewer, a
 * "Needs you" line with what it is. Nothing the header or the thread already
 * shows (who, the price). The whole band opens the booking in the thread's
 * sheet: what needs them, Mark done, Reschedule and Cancel booking. The pin
 * draws the band and its padding; this is the row inside it.
 */
export function ThreadBookingPin({
  attention,
  pill,
  px,
  py,
}: {
  attention: ThreadFieldsFragment['attention']
  /** The task's status pill (Booked), from the pin. */
  pill: ReactNode
  px: BoxProps['px']
  py: BoxProps['py']
}) {
  const t = useI11n(bag)
  const sheet = useThreadSheet()
  const need = useThreadNeed(attention)
  const summary = useBookingSummary()
  if (!summary) return null
  const label = need
    ? formatMessage(t.sheet.openBookingNeeds, {
        name: summary.name,
        need: need.headline,
      })
    : formatMessage(t.sheet.openBooking, { name: summary.name })
  const row = (
    <HStack gap={3} align="center">
      <Stack gap={1.5} flex={1} minW={0}>
        <HStack columnGap={2} rowGap={1} flexWrap="wrap">
          {pill}
          <HStack gap={1.5} fontSize="sm" fontWeight={500} minW={0}>
            <Box
              as="span"
              display="inline-flex"
              flexShrink={0}
              color="text.muted"
            >
              <LuCalendar size={14} aria-hidden />
            </Box>
            <Text as="span">{summary.time}</Text>
          </HStack>
        </HStack>
        {need ? <NeedsLine need={need} chevron={false} /> : null}
      </Stack>
      {sheet ? <PinChevron /> : null}
    </HStack>
  )
  if (!sheet) {
    return (
      <Box data-thread-booking="" px={px} py={py}>
        {row}
      </Box>
    )
  }
  return (
    <CardButton
      type="button"
      data-thread-booking=""
      data-needs={need?.name}
      aria-label={label}
      onClick={() => sheet.open({ kind: 'booking' })}
      {...PIN_BAND_BUTTON}
      px={px}
      py={py}
    >
      {row}
    </CardButton>
  )
}

/**
 * Before a booking, what needs the viewer (an invitation to quote) as one
 * plain line under the top pin's status, no box (FE-567); it opens the sheet
 * with its answers.
 */
export function ThreadNeedsButton({
  attention,
}: {
  attention: ThreadFieldsFragment['attention']
}) {
  const t = useI11n(bag)
  const sheet = useThreadSheet()
  const need = useThreadNeed(attention)
  if (!need || !sheet) return null
  return (
    <CardButton
      type="button"
      data-thread-needs={need.name}
      aria-label={formatMessage(t.sheet.openNeeds, { need: need.headline })}
      onClick={() => sheet.open({ kind: 'needs' })}
      {...PIN_BAND_BUTTON}
      minH="44px"
      borderRadius="md"
    >
      <NeedsLine need={need} />
    </CardButton>
  )
}

/** One of the booking's actions, as a row: an icon and its label. */
function ActionRow({
  icon: Icon,
  label,
  danger = false,
  onClick,
}: {
  icon: IconType
  label: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <CardButton
      type="button"
      onClick={onClick}
      display="flex"
      alignItems="center"
      gap={3}
      w="full"
      minH="48px"
      px={1}
      bg="transparent"
      color={danger ? 'status.danger.fg' : 'text.default'}
      fontSize="sm"
      fontWeight={500}
      textAlign="start"
      cursor="pointer"
      borderRadius="md"
      css={{
        touchAction: 'manipulation',
        '&:hover': { bg: 'bg.subtle' },
        '&:focus-visible': sdlFocusRing,
      }}
    >
      <Box as="span" display="inline-flex" aria-hidden>
        <Icon size={18} />
      </Box>
      {label}
    </CardButton>
  )
}

/**
 * The booking in the sheet: the booking card, what needs the viewer (their
 * times to use or answer with other times, a cancel request, the Done
 * slide), then Message, Reschedule and Cancel booking. Cancel is one-sided
 * until 24 hours before the start, behind its warning (BE-125). The sheet
 * closes once an action goes through.
 */
function BookingSheetBody({
  attention,
  onClose,
  onMessage,
}: {
  attention: ThreadFieldsFragment['attention']
  onClose: () => void
  onMessage: () => void
}) {
  const t = useI11n(bag)
  const taskCopy = useI11n(taskBag)
  const { orderActionPending, jobActionError, orderClose, permissions } =
    useTaskDetail()
  const need = useThreadNeed(attention)
  const summary = useBookingSummary()
  const options = useOrderRequestOptions()
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  // An order action that went through (no error) closes the sheet.
  const pending = useRef(orderActionPending)
  useEffect(() => {
    if (pending.current && !orderActionPending && !jobActionError) onClose()
    pending.current = orderActionPending
  }, [orderActionPending, jobActionError, onClose])

  if (!summary) return null
  const closeInNeed = need
    ? BOTTOM_PIN_VIEWS[need.name].controls === 'close'
    : false
  const showClose =
    !closeInNeed &&
    Boolean(orderClose?.canClose && permissions.showOrderActions)

  return (
    <Stack gap={4} pb={2} data-booking-sheet="">
      <Box {...CARD_FRAME}>
        <BookingFacts summary={summary} />
      </Box>
      {need ? <ThreadNeedsYou need={need} /> : null}
      {showClose ? <OrderCloseCard inPin /> : null}
      <Stack as="section" aria-label={t.sheet.actions} gap={0}>
        <ActionRow
          icon={LuMessageCircle}
          label={formatMessage(t.composerLabel, { name: summary.name })}
          onClick={onMessage}
        />
        {options?.canReschedule ? (
          <ActionRow
            icon={LuCalendarClock}
            label={taskCopy.requests.reschedule}
            onClick={() => setRescheduleOpen(true)}
          />
        ) : null}
        {options?.canCancel ? (
          <ActionRow
            icon={LuCalendarX}
            label={taskCopy.requests.cancelBooking}
            danger
            onClick={() => setCancelOpen(true)}
          />
        ) : null}
      </Stack>
      {options ? (
        <>
          <OrderRescheduleDialog
            open={rescheduleOpen}
            onOpenChange={setRescheduleOpen}
            counterpartName={options.counterpartName}
          />
          <OrderCancelDialog
            open={cancelOpen}
            onOpenChange={setCancelOpen}
            counterpartName={options.counterpartName}
          />
        </>
      ) : null}
    </Stack>
  )
}

/** Before a booking: what needs the viewer, with its answers. */
function NeedsSheetBody({
  attention,
}: {
  attention: ThreadFieldsFragment['attention']
}) {
  const need = useThreadNeed(attention)
  if (!need) return null
  return (
    <Stack gap={4} pb={2}>
      <ThreadNeedsYou need={need} />
    </Stack>
  )
}

/** Hands the composer focus once the sheet has closed. */
function focusComposer(container: RefObject<HTMLElement | null>) {
  window.setTimeout(() => {
    container.current
      ?.querySelector<HTMLTextAreaElement>(`[${THREAD_COMPOSER_ATTR}]`)
      ?.focus()
  }, 320)
}

/**
 * The thread's sheet (FE-543): a bottom sheet that rises from the foot of the
 * conversation (the `@ui` Drawer, placed in `container`), over the composer,
 * with the detail and the actions of what was tapped: a quote, the booking,
 * or what needs the viewer. It closes with its X, the scrim, Escape or a
 * drag, and on its own once an action goes through; Message hands the
 * composer focus. Renders inside the thread's `TaskDetailProvider`.
 */
export function ThreadSheetProvider({
  container,
  attention,
  locale,
  children,
}: {
  container: RefObject<HTMLElement | null>
  attention: ThreadFieldsFragment['attention']
  locale: string
  children: ReactNode
}) {
  const t = useI11n(bag)
  const meId = useUserStore((s) => s.me?.id ?? null)
  const [target, setTarget] = useState<ThreadSheetTarget | null>(null)
  const [open, setOpen] = useState(false)
  const need = useThreadNeed(attention)
  const requestPending =
    need != null && BOTTOM_PIN_VIEWS[need.name].controls === 'request'
  const controls = useMemo<ThreadSheetControls>(
    () => ({
      open: (next) => {
        setTarget(next)
        setOpen(true)
      },
      close: () => setOpen(false),
      requestPending,
    }),
    [requestPending],
  )
  const close = controls.close

  let title = t.sheet.needsTitle
  let body: ReactNode = null
  if (target?.kind === 'booking') {
    title = t.sheet.bookingTitle
    body = (
      <BookingSheetBody
        attention={attention}
        onClose={close}
        onMessage={() => {
          close()
          focusComposer(container)
        }}
      />
    )
  } else if (target?.kind === 'quote') {
    const name =
      target.quote.worker?.profile.name?.trim() || t.quote.workerFallback
    title =
      meId != null && target.quote.workerUserId === meId
        ? t.sheet.myQuoteTitle
        : formatMessage(t.sheet.quoteTitle, { name })
    body = (
      <QuoteSheetBody quote={target.quote} locale={locale} onDone={close} />
    )
  } else if (target?.kind === 'needs') {
    body = <NeedsSheetBody attention={attention} />
  }

  return (
    <ThreadSheetContext.Provider value={controls}>
      {children}
      {target ? (
        <Drawer
          open={open}
          onOpenChange={setOpen}
          title={title}
          placement="bottom"
          container={container}
        >
          {body}
        </Drawer>
      ) : null}
    </ThreadSheetContext.Provider>
  )
}
