'use client'

import { Stack, Text } from '@chakra-ui/react'
import { OrderStatus, type ThreadFieldsFragment } from '@codegen/schema'
import { type ReactNode, useState } from 'react'

import { OrderDoneSlide } from '@/app/(task)/tasks/[slug]/components/overview/OrderCloseCard'
import {
  OrderRescheduleDialog,
  useOrderRequestOptions,
} from '@/app/(task)/tasks/[slug]/components/overview/OrderRequestDialogs'
import { useSummaryLines } from '@/app/(task)/tasks/[slug]/components/summary/TaskSummary'
import { useDateLocale } from '@/app/(task)/tasks/[slug]/components/summary/facts/TaskFacts'
import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { TASK_DETAIL_VIEWS } from '@/app/(task)/tasks/[slug]/views'
import { useDismissQuoteInvitation } from '@/content/quoteInvitations/useDismissQuoteInvitation'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { orderRequestView } from '@/utils/orderHelpers'
import { formatTimeSlotLabel, isTimeSlotPast } from '@/utils/timeSlots'
import { Button, Link, RadioButton } from '@ui'

import taskBag from '@/app/(task)/tasks/[slug]/i11n.json'

import { useMessagesOptional } from '../context/MessagesProvider'
import bag from '../i11n.json'
import {
  BOTTOM_PIN_VIEWS,
  type BottomPinViewName,
  getBottomPinView,
} from '../views'
import { SheetActions, SheetSection } from './ThreadSheetParts'

/** What needs the viewer now, and the line that says it. */
export type ThreadNeed = {
  name: BottomPinViewName
  headline: string
  subline: string | null
}

/**
 * The one thing that needs the viewer now (answer a reschedule or a
 * cancellation, mark the booking Done, confirm their Done, answer Failed,
 * open a conflict, or answer an invitation to quote), when the API's
 * `thread.attention` and task detail's view agree; null otherwise. It goes
 * the moment they answer (task detail updates first). Since FE-543 it is a
 * "Needs you" line on the booking card (or the top pin) and a section of the
 * thread's sheet, no longer a bar above the composer. Renders inside the
 * thread's `TaskDetailProvider`.
 */
export function useThreadNeed(
  attention: ThreadFieldsFragment['attention'],
): ThreadNeed | null {
  const { view, task } = useTaskDetail()
  const taskCopy = useI11n(taskBag)
  const lines = useSummaryLines(TASK_DETAIL_VIEWS[view])
  const name = getBottomPinView({ attention, view })
  if (!task || !name) return null
  const config = BOTTOM_PIN_VIEWS[name]
  const invitation = task.viewerQuoteInvitation ?? null
  // Asked to quote: it needs who asked, and goes the moment they say Not for
  // me, before the inbox has refreshed (FE-507).
  if (config.controls === 'invitation') {
    if (!invitation || invitation.dismissed) return null
    return {
      name,
      headline: formatMessage(taskCopy.cta.invitedBy, {
        customer: invitation.customerName.trim() || taskCopy.fallbackCustomer,
      }),
      subline: null,
    }
  }
  if (!lines.headline) return null
  return {
    name,
    headline: lines.headline,
    subline: config.subline ? lines.subline || null : null,
  }
}

/**
 * The "Needs you" part of a thread drawer (FE-543; flat since FE-569, like
 * the quote drawer): a warning label, the headline and its sub-line, what to
 * choose from (their proposed times as a pick list), then the answers as
 * full-width buttons at the foot, the main one first. `actions` follow them
 * in the same stack (the booking's Reschedule and Cancel booking), so every
 * action sits together at the bottom.
 */
export function ThreadNeedsYou({
  need,
  actions,
}: {
  need: ThreadNeed
  actions?: ReactNode
}) {
  const { task } = useTaskDetail()
  const t = useI11n(bag).pin
  if (!task) return null
  const config = BOTTOM_PIN_VIEWS[need.name]

  const head = (
    <Stack
      as="section"
      aria-label={t.needsYou}
      data-thread-need={need.name}
      gap={1}
      aria-live="polite"
    >
      <Text textStyle="label-sm" color="status.warning.fg">
        {t.needsYou}
      </Text>
      <Text fontSize="sm" fontWeight={500}>
        {need.headline}
      </Text>
      {need.subline ? (
        <Text fontSize="sm" color="text.muted">
          {need.subline}
        </Text>
      ) : null}
    </Stack>
  )

  if (config.controls === 'request') {
    return <RequestAnswer head={head} actions={actions} />
  }

  return (
    <>
      {head}
      <SheetActions>
        {config.controls === 'close' ? <OrderDoneSlide /> : null}
        {config.controls === 'invitation' ? <InvitationAnswer /> : null}
        {config.controls === 'openTask' ? (
          <Button asChild size="form" w="full" variant="primary">
            <Link
              href={`/tasks/${task.id}`}
              _hover={{ textDecoration: 'none' }}
            >
              {t.openTask}
            </Link>
          </Button>
        ) : null}
        {actions}
      </SheetActions>
    </>
  )
}

/** Asked to quote: Send a quote, or Not for me (silent for the customer). */
function InvitationAnswer() {
  const { task, refetch } = useTaskDetail()
  const t = useI11n(bag).pin
  const messages = useMessagesOptional()
  const { dismiss, loading: dismissing } = useDismissQuoteInvitation()
  if (!task) return null
  return (
    <>
      <Button asChild size="form" w="full" variant="primary">
        <Link
          href={`/tasks/${task.id}/quote`}
          _hover={{ textDecoration: 'none' }}
        >
          {t.sendQuote}
        </Link>
      </Button>
      <Button
        type="button"
        size="form"
        w="full"
        variant="secondary"
        loading={dismissing}
        onClick={async () => {
          // The task and the inbox are read again so the need goes (the view
          // does not change).
          if (await dismiss(task.id)) {
            refetch()
            messages?.refetchThreads()
          }
        }}
      >
        {t.notForMe}
      </Button>
    </>
  )
}

/**
 * Their reschedule or cancel request. A reschedule: their times as a pick
 * list (the accept dialog's rows), its hint, then "Use this time" for the
 * picked one and "Propose other times" (no rejecting a reschedule, BE-125).
 * A cancel request: the lapse note, then Accept cancellation and Keep
 * booking. While the booking is frozen nobody can answer (BE-108).
 */
function RequestAnswer({
  head,
  actions,
}: {
  head: ReactNode
  actions?: ReactNode
}) {
  const { myOrder, me, permissions, runOrderAction, orderActionPending } =
    useTaskDetail()
  const t = useI11n(taskBag)
  const sheet = useI11n(bag).sheet
  const locale = useDateLocale()
  const options = useOrderRequestOptions()
  const [counterOpen, setCounterOpen] = useState(false)
  const request = myOrder ? orderRequestView(myOrder, me?.id) : null
  const future =
    request?.kind === 'RESCHEDULE'
      ? request.proposedSlots.filter((slot) => !isTimeSlotPast(slot))
      : []
  const [picked, setPicked] = useState<string | null>(null)
  const slotId = picked ?? future[0]?.id ?? null
  const r = t.requests
  const busy = orderActionPending != null
  const canAnswer =
    request != null && !request.mine && permissions.showOrderActions

  if (!myOrder || !request) {
    return (
      <>
        {head}
        <SheetActions>{actions}</SheetActions>
      </>
    )
  }

  if (request.kind === 'RESCHEDULE') {
    return (
      <>
        {head}
        <SheetSection label={sheet.proposedTimes}>
          <Stack gap={2} role="radiogroup" aria-label={sheet.proposedTimes}>
            {request.proposedSlots.map((slot) => {
              const past = isTimeSlotPast(slot)
              const label = formatTimeSlotLabel(slot, locale)
              return canAnswer ? (
                <RadioButton
                  key={slot.id}
                  role="radio"
                  checked={slotId === slot.id}
                  disabled={past || busy}
                  label={past ? `${label} · ${t.quotes.pastSlot}` : label}
                  onChange={() => setPicked(slot.id)}
                />
              ) : (
                <Text
                  key={slot.id}
                  fontSize="sm"
                  color={past ? 'text.muted' : 'text.default'}
                >
                  {past ? `${label} · ${t.quotes.pastSlot}` : label}
                </Text>
              )
            })}
          </Stack>
          {canAnswer && options ? (
            <Text fontSize="sm" color="text.muted">
              {formatMessage(r.answerHint, { name: options.counterpartName })}
            </Text>
          ) : null}
        </SheetSection>
        <SheetActions>
          {canAnswer ? (
            <Button
              type="button"
              size="form"
              w="full"
              variant="primary"
              disabled={busy || slotId == null}
              loading={orderActionPending === 'confirmReschedule'}
              onClick={() => {
                if (slotId) {
                  void runOrderAction({ type: 'confirmReschedule', slotId })
                }
              }}
            >
              {r.confirmSlot}
            </Button>
          ) : null}
          {canAnswer && options?.canCounterPropose ? (
            <Button
              type="button"
              size="form"
              w="full"
              variant="secondary"
              disabled={busy}
              onClick={() => setCounterOpen(true)}
            >
              {r.counterPropose}
            </Button>
          ) : null}
          {actions}
        </SheetActions>
        {canAnswer && options ? (
          <OrderRescheduleDialog
            open={counterOpen}
            onOpenChange={setCounterOpen}
            counterpartName={options.counterpartName}
            counter
          />
        ) : null}
      </>
    )
  }

  // A cancel request lapses at the booked time, except in CONFLICT and
  // while frozen (the lapse waits until the suspension is lifted).
  const lapse = myOrder.status !== OrderStatus.Conflict && !permissions.isFrozen
  return (
    <>
      {head}
      {lapse ? (
        <Text fontSize="sm" color="text.muted">
          {r.lapseNote}
        </Text>
      ) : null}
      <SheetActions>
        {canAnswer ? (
          <>
            <Button
              type="button"
              size="form"
              w="full"
              variant="primary"
              disabled={busy}
              loading={orderActionPending === 'acceptCancellation'}
              onClick={() =>
                void runOrderAction({ type: 'acceptCancellation' })
              }
            >
              {r.acceptCancel}
            </Button>
            <Button
              type="button"
              size="form"
              w="full"
              variant="secondary"
              disabled={busy}
              loading={orderActionPending === 'declineCancellation'}
              onClick={() =>
                void runOrderAction({ type: 'declineCancellation' })
              }
            >
              {r.declineCancel}
            </Button>
          </>
        ) : null}
        {actions}
      </SheetActions>
    </>
  )
}
