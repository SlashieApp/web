'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { ThreadFieldsFragment } from '@codegen/schema'

import { OrderCloseCard } from '@/app/(task)/tasks/[slug]/components/overview/OrderCloseCard'
import { useSummaryLines } from '@/app/(task)/tasks/[slug]/components/summary/TaskSummary'
import { RequestFact } from '@/app/(task)/tasks/[slug]/components/summary/facts/BookingActionFacts'
import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { TASK_DETAIL_VIEWS } from '@/app/(task)/tasks/[slug]/views'
import { useDismissQuoteInvitation } from '@/content/quoteInvitations/useDismissQuoteInvitation'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, Link } from '@ui'

import taskBag from '@/app/(task)/tasks/[slug]/i11n.json'

import { useMessagesOptional } from '../context/MessagesProvider'
import bag from '../i11n.json'
import {
  BOTTOM_PIN_VIEWS,
  type BottomPinViewName,
  getBottomPinView,
} from '../views'

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
 * The "Needs you" section of the thread's sheet (FE-543): the headline, its
 * sub-line where the view has one, and task detail's own controls: their
 * times (Use this time, or Propose other times: no rejecting a reschedule,
 * BE-125) or a cancel request to accept, the Done card's slide, the
 * invitation's Send a quote and Not for me, or Open task for a conflict.
 */
export function ThreadNeedsYou({ need }: { need: ThreadNeed }) {
  const { task, orderClose, permissions, refetch } = useTaskDetail()
  const t = useI11n(bag).pin
  const messages = useMessagesOptional()
  const { dismiss, loading: dismissing } = useDismissQuoteInvitation()
  if (!task) return null
  const config = BOTTOM_PIN_VIEWS[need.name]

  return (
    <Stack
      as="section"
      aria-label={t.needsYou}
      data-thread-need={need.name}
      gap={1}
      p={4}
      bg="status.warning.soft"
      borderWidth="1px"
      borderColor="status.warning.border"
      borderRadius="lg"
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
      {config.controls === 'request' ? <RequestFact /> : null}
      {/* The Done card only while this viewer can close the booking: without
          its slide it would only repeat the headline. */}
      {config.controls === 'close' &&
      orderClose?.canClose &&
      permissions.showOrderActions ? (
        <Box pt={2}>
          <OrderCloseCard inPin />
        </Box>
      ) : null}
      {config.controls === 'invitation' ? (
        <HStack gap={2} pt={2} flexWrap="wrap">
          <Button asChild size="sm" variant="primary">
            <Link
              href={`/tasks/${task.id}/quote`}
              _hover={{ textDecoration: 'none' }}
            >
              {t.sendQuote}
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            loading={dismissing}
            onClick={async () => {
              // Silent for the customer. The task and the inbox are read
              // again so the need goes (the view does not change).
              if (await dismiss(task.id)) {
                refetch()
                messages?.refetchThreads()
              }
            }}
          >
            {t.notForMe}
          </Button>
        </HStack>
      ) : null}
      {config.controls === 'openTask' ? (
        <Box pt={2}>
          <Button asChild size="sm" variant="primary">
            <Link
              href={`/tasks/${task.id}`}
              _hover={{ textDecoration: 'none' }}
            >
              {t.openTask}
            </Link>
          </Button>
        </Box>
      ) : null}
    </Stack>
  )
}
