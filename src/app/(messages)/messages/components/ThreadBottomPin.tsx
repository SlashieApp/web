'use client'

import { Box, Stack, Text } from '@chakra-ui/react'
import type { ThreadFieldsFragment } from '@codegen/schema'

import { OrderCloseControls } from '@/app/(task)/tasks/[slug]/components/overview/OrderCloseControls'
import { useSummaryLines } from '@/app/(task)/tasks/[slug]/components/summary/TaskSummary'
import { RequestFact } from '@/app/(task)/tasks/[slug]/components/summary/facts/BookingActionFacts'
import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { TASK_DETAIL_VIEWS } from '@/app/(task)/tasks/[slug]/views'
import { useI11n } from '@/i18n/useI11n'
import { Button, Link } from '@ui'

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
  const { view, task } = useTaskDetail()
  const t = useI11n(bag).pin
  const lines = useSummaryLines(TASK_DETAIL_VIEWS[view])
  const name = getBottomPinView({ attention, view })
  if (!task || !name) return null
  const config = BOTTOM_PIN_VIEWS[name]

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
        {lines.headline}
      </Text>
      {config.subline && lines.subline ? (
        <Text fontSize="sm" color="text.muted">
          {lines.subline}
        </Text>
      ) : null}
      {config.controls === 'request' ? <RequestFact /> : null}
      {config.controls === 'close' ? (
        <Box py={2}>
          <OrderCloseControls />
        </Box>
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
