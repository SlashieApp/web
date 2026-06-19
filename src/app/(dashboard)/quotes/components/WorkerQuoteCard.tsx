'use client'

import { Box, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useState } from 'react'

import { formatPounds, formatRelativePosted } from '@/utils/dashboardHelpers'
import { isOrderClosed, taskOrderSectionHref } from '@/utils/orderHelpers'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { Badge, Button, Card, Thumbnail } from '@ui'

import {
  type WorkerQuoteRow,
  type WorkerQuoteStage,
  workerQuotePricePence,
  workerQuoteStage,
  workerQuoteStageLabel,
  workerQuoteTimelineSteps,
} from '../../helpers/workerQuoteJobs'
import { PostedTaskTimeline } from '../../requests/components/PostedTaskTimeline'

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <Box
      as="span"
      display="inline-flex"
      color="formLabelMuted"
      transform={expanded ? 'rotate(180deg)' : 'rotate(0deg)'}
      transition="transform 0.15s ease"
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <title>Expand</title>
        <path
          d="m6 9 6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

type WorkerQuoteCardProps = WorkerQuoteRow & {
  /** Storybook / tests: start with timeline and details visible. */
  initialExpanded?: boolean
}

export function WorkerQuoteCard({
  task,
  quote,
  workerOrder,
  initialExpanded = false,
}: WorkerQuoteCardProps) {
  const [expanded, setExpanded] = useState(initialExpanded)
  const stage = workerQuoteStage(task, quote, workerOrder)
  const thumbnailSrc = task.images?.[0] ?? undefined
  const timelineSteps = workerQuoteTimelineSteps(task, quote, workerOrder)
  const quotePence = workerQuotePricePence(quote, workerOrder)
  const orderClosed = workerOrder ? isOrderClosed(workerOrder.status) : false
  const taskHref = `/tasks/${task.id}`

  const primaryCta =
    stage === 'booked' && workerOrder && !orderClosed
      ? {
          label: 'Manage job',
          href: taskOrderSectionHref(task.id),
          variant: 'primary' as const,
        }
      : stage === 'closed' || (stage === 'booked' && orderClosed)
        ? {
            label: 'View job',
            href: taskOrderSectionHref(task.id),
            variant: 'secondary' as const,
          }
        : stage === 'pending'
          ? {
              label: 'Open task',
              href: taskHref,
              variant: 'primary' as const,
            }
          : {
              label: 'Open task',
              href: taskHref,
              variant: 'ghost' as const,
            }

  const sentLabel = formatRelativePosted(quote.createdAt).replace(
    /^Posted /,
    'Sent ',
  )
  const summaryMeta =
    quotePence != null && quotePence > 0
      ? `${formatPounds(quotePence)} · ${sentLabel}`
      : sentLabel

  const showSecondaryCta =
    expanded && primaryCta.href !== taskHref && primaryCta.label !== 'Open task'

  return (
    <Card layout="section" p={0} overflow="hidden">
      <Box
        as="button"
        w="full"
        textAlign="left"
        p={5}
        cursor="pointer"
        bg="transparent"
        border="none"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
      >
        <HStack justify="space-between" align="flex-start" gap={3}>
          <HStack align="flex-start" gap={3} flex={1} minW={0}>
            <Thumbnail alt={`${task.title} thumbnail`} src={thumbnailSrc} />
            <Stack gap={1} minW={0}>
              <Heading size="sm" lineClamp={2}>
                {task.title}
              </Heading>
              <Text fontSize="sm" color="formLabelMuted">
                {taskPublicLocationLabel(task) || 'Location TBC'}
              </Text>
              <Text fontSize="sm" fontWeight={600} color="cardFg">
                {summaryMeta}
              </Text>
            </Stack>
          </HStack>
          <Stack align="flex-end" gap={2} flexShrink={0}>
            <StageBadge stage={stage} />
            <ChevronIcon expanded={expanded} />
          </Stack>
        </HStack>
      </Box>

      <HStack
        px={5}
        pb={4}
        pt={2}
        gap={2}
        justify="flex-end"
        flexWrap="wrap"
        borderTopWidth="1px"
        borderColor="cardBorder"
      >
        <Link as={NextLink} href={taskHref} _hover={{ textDecoration: 'none' }}>
          <Button size="sm" variant="primary">
            Open task
          </Button>
        </Link>
      </HStack>

      {expanded ? (
        <Stack
          gap={4}
          px={5}
          pb={5}
          pt={0}
          borderTopWidth="1px"
          borderColor="cardBorder"
        >
          {quote.message ? (
            <Text fontSize="sm" color="formLabelMuted" fontStyle="italic">
              “{quote.message}”
            </Text>
          ) : null}

          <PostedTaskTimeline steps={timelineSteps} />

          {showSecondaryCta ? (
            <HStack justify="flex-end" flexWrap="wrap" gap={2}>
              <Link
                as={NextLink}
                href={primaryCta.href}
                _hover={{ textDecoration: 'none' }}
              >
                <Button size="sm" variant={primaryCta.variant}>
                  {primaryCta.label}
                </Button>
              </Link>
            </HStack>
          ) : null}
        </Stack>
      ) : null}
    </Card>
  )
}

function StageBadge({ stage }: { stage: WorkerQuoteStage }) {
  const tone =
    stage === 'booked'
      ? { bg: 'primary.100', color: 'primary.800' }
      : stage === 'closed'
        ? { bg: 'badgeBg', color: 'cardFg' }
        : stage === 'ended'
          ? { bg: 'neutral.200', color: 'formLabelMuted' }
          : { bg: 'badgeBg', color: 'cardFg' }

  return (
    <Badge bg={tone.bg} color={tone.color} flexShrink={0}>
      {workerQuoteStageLabel(stage)}
    </Badge>
  )
}
