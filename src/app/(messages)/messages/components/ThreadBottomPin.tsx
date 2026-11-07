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
import { BOTTOM_PIN_VIEWS, getBottomPinView } from '../views'

/**
 * The bottom pin above the composer (Thread screen v2): the one thing that
 * needs the viewer now, with task detail's own controls (answer a reschedule
 * or cancellation, slide to mark Done, confirm their Done, answer Failed, or
 * open a conflict). Shown when `thread.attention` and task detail's view
 * agree; hidden otherwise. It sits in the column's flow, so it never covers
 * the composer or the timeline, and scrolls itself on short phones.
 * Renders inside the thread's `TaskDetailProvider`.
 */
export function ThreadBottomPin({
  attention,
}: {
  attention: ThreadFieldsFragment['attention']
}) {
  const { view, task, orderClose, permissions, refetch } = useTaskDetail()
  const t = useI11n(bag).pin
  const taskCopy = useI11n(taskBag)
  const messages = useMessagesOptional()
  const { dismiss, loading: dismissing } = useDismissQuoteInvitation()
  const lines = useSummaryLines(TASK_DETAIL_VIEWS[view])
  const name = getBottomPinView({ attention, view })
  if (!task || !name) return null
  const config = BOTTOM_PIN_VIEWS[name]
  const invitation = task.viewerQuoteInvitation ?? null
  // Asked to quote: the pin needs who asked, and goes the moment they say Not
  // for me, before the inbox has refreshed (FE-507).
  if (config.controls === 'invitation' && (!invitation || invitation.dismissed))
    return null
  const headline =
    config.controls === 'invitation' && invitation
      ? formatMessage(taskCopy.cta.invitedBy, {
          customer: invitation.customerName.trim() || taskCopy.fallbackCustomer,
        })
      : lines.headline

  return (
    <Stack
      as="section"
      aria-label={t.needsYou}
      data-bottom-pin={name}
      flexShrink={0}
      gap={1}
      px={{ base: 4, lg: 5 }}
      pt={3}
      pb={config.controls === 'openTask' ? 3 : 1}
      maxH="45dvh"
      overflowY="auto"
      bg="status.warning.soft"
      borderTopWidth="1px"
      borderColor="border.default"
      aria-live="polite"
    >
      <Text fontSize="sm" fontWeight={500}>
        {headline}
      </Text>
      {config.subline && lines.subline ? (
        <Text fontSize="sm" color="text.muted">
          {lines.subline}
        </Text>
      ) : null}
      {config.controls === 'request' ? <RequestFact /> : null}
      {/* The Done card only while this viewer can close the booking, as on
          Expo: without its slide it would only repeat the headline. */}
      {config.controls === 'close' &&
      orderClose?.canClose &&
      permissions.showOrderActions ? (
        <Box py={2}>
          <OrderCloseCard inPin />
        </Box>
      ) : null}
      {config.controls === 'invitation' ? (
        <HStack gap={2} pt={1} pb={2} flexWrap="wrap">
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
              // again so the pin goes (the view does not change).
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
        <Box pt={1}>
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
