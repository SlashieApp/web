'use client'

import { Box, HStack, Skeleton, Stack, Text } from '@chakra-ui/react'
import type { ThreadFieldsFragment } from '@codegen/schema'
import type { ReactNode } from 'react'
import { LuChevronRight } from 'react-icons/lu'

import { MainCtaButton } from '@/app/(task)/tasks/[slug]/components/layout/TaskDetailMainCta'
import { OrderCloseControls } from '@/app/(task)/tasks/[slug]/components/overview/OrderCloseControls'
import { useSummaryLines } from '@/app/(task)/tasks/[slug]/components/summary/TaskSummary'
import { RequestFact } from '@/app/(task)/tasks/[slug]/components/summary/facts/BookingActionFacts'
import { useDateLocale } from '@/app/(task)/tasks/[slug]/components/summary/facts/TaskFacts'
import { TaskStatusPill } from '@/app/(task)/tasks/[slug]/components/ui/TaskStatusPill'
import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { TASK_DETAIL_VIEWS } from '@/app/(task)/tasks/[slug]/views'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { formatOrderAgreedPrice } from '@/utils/orderHelpers'
import { formatPrice } from '@/utils/price'
import { formatTimeSlotLabel } from '@/utils/timeSlots'
import { Avatar, Button, Link } from '@ui'

import { type PinPerson, pinPerson } from '../helpers/messagesThread'
import bag from '../i11n.json'
import { PIN_VIEWS, type ThreadPinViewConfig, getThreadPinView } from '../views'

const PIN_PX = { base: 4, lg: 5 } as const

/** Photo, name and Worker or Customer; the row opens their profile. */
function PersonRow({ person }: { person: PinPerson }) {
  const t = useI11n(bag).pin
  const who = (
    <>
      <Avatar
        name={person.name}
        src={person.avatarUrl ?? undefined}
        size="sm"
      />
      <Text fontSize="sm" fontWeight={700} lineClamp={1}>
        {person.name}
      </Text>
      <Text fontSize="xs" color="text.muted" flexShrink={0}>
        {t[person.role]}
      </Text>
    </>
  )
  if (!person.href) {
    return (
      <HStack gap={2} minW={0}>
        {who}
      </HStack>
    )
  }
  return (
    <Link
      href={person.href}
      display="flex"
      alignItems="center"
      gap={2}
      minW={0}
      minH="32px"
      color="text.default"
      borderRadius="md"
      _hover={{ textDecoration: 'none' }}
    >
      {who}
      <HStack
        as="span"
        gap={0.5}
        ml="auto"
        flexShrink={0}
        fontSize="sm"
        fontWeight={600}
        color="text.link"
      >
        <Box as="span" display={{ base: 'none', lg: 'inline' }}>
          {t.viewProfile}
        </Box>
        <LuChevronRight aria-hidden />
      </HStack>
    </Link>
  )
}

/** The agreed price, with the booked time first for `booking`. */
function useFactLine(facts: ThreadPinViewConfig['facts']): string | null {
  const { myOrder, myQuote } = useTaskDetail()
  const t = useI11n(bag).pin
  const locale = useDateLocale()
  if (facts === 'quote') {
    return myQuote?.price ? formatPrice(myQuote.price) : null
  }
  if (!facts || !myOrder) return null
  const agreed = formatMessage(t.agreed, {
    price: formatOrderAgreedPrice(myOrder),
  })
  if (facts === 'price') return agreed
  const when = formatTimeSlotLabel(
    { start: myOrder.bookedStart, end: myOrder.bookedEnd },
    locale,
  )
  return when ? `${when} · ${agreed}` : agreed
}

/** A link styled as a small button (Compare quotes, Open task). */
function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button asChild size="sm" variant="primary">
      <Link href={href} _hover={{ textDecoration: 'none' }}>
        {children}
      </Link>
    </Button>
  )
}

function PinSkeleton() {
  return (
    <HStack
      gap={2}
      px={PIN_PX}
      py={3}
      borderBottomWidth="1px"
      borderColor="border.default"
      aria-hidden
    >
      <Skeleton boxSize="32px" borderRadius="full" />
      <Skeleton h="16px" w="40%" borderRadius="md" />
    </HStack>
  )
}

/**
 * The card pinned under a task thread's header (FE-291): the other person,
 * then where the task stands and the next step, from task detail's own view.
 * Tinted when something needs the viewer, with task detail's own controls.
 * Renders inside the header's `TaskDetailProvider`.
 */
export function ThreadPin({
  party,
}: {
  party: ThreadFieldsFragment['otherParty']
}) {
  const { view, task, error, mainCta, permissions } = useTaskDetail()
  const t = useI11n(bag)
  const taskView = TASK_DETAIL_VIEWS[view]
  const lines = useSummaryLines(taskView)
  const pinView = getThreadPinView(view)
  const config = pinView ? PIN_VIEWS[pinView] : null
  const facts = useFactLine(config?.facts ?? null)

  if (view === 'loading') return error ? null : <PinSkeleton />
  if (!task || !config) return null

  const person = pinPerson(party, permissions.isOwner)
  const headline = config.headline ? lines.headline : null
  const subline = config.subline ? lines.subline : null
  const pill =
    config.pill && taskView.pill ? (
      <TaskStatusPill
        status={taskView.pill}
        label={
          config.pill === 'notSelected' ? t.quote.status.notSelected : undefined
        }
        size="sm"
      />
    ) : null
  const inlineControl =
    config.controls === 'compareQuotes' ? (
      <LinkButton href={`/tasks/${task.id}#task-quotes`}>
        {t.pin.compareQuotes}
      </LinkButton>
    ) : config.controls === 'openTask' ? (
      <LinkButton href={`/tasks/${task.id}`}>{t.pin.openTask}</LinkButton>
    ) : config.controls === 'mainCta' && mainCta ? (
      <MainCtaButton model={mainCta} />
    ) : null
  const hasStatus = Boolean(pill || headline || facts || inlineControl)

  return (
    <Stack
      data-thread-pin={pinView}
      gap={2}
      px={PIN_PX}
      py={3}
      // An ask with its answer buttons must not crowd out the conversation.
      maxH={{ base: '45dvh', lg: 'none' }}
      overflowY="auto"
      bg={config.ask ? 'status.warning.soft' : 'bg.surface'}
      borderBottomWidth="1px"
      borderColor="border.default"
      aria-live="polite"
    >
      {person ? <PersonRow person={person} /> : null}
      {hasStatus ? (
        <HStack columnGap={2} rowGap={1} flexWrap="wrap" minH="32px">
          {pill}
          {headline ? (
            <Text fontSize="sm" fontWeight={config.ask ? 700 : 600}>
              {headline}
            </Text>
          ) : null}
          {facts ? (
            <Text fontSize="sm" color="text.muted">
              {facts}
            </Text>
          ) : null}
          {inlineControl ? <Box ml="auto">{inlineControl}</Box> : null}
        </HStack>
      ) : null}
      {subline ? (
        <Text fontSize="sm" color="text.muted">
          {subline}
        </Text>
      ) : null}
      {config.controls === 'request' ? <RequestFact /> : null}
      {config.controls === 'close' ? <OrderCloseControls /> : null}
    </Stack>
  )
}
