'use client'

import { Box, Grid, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import type { MouseEvent, ReactNode } from 'react'
import { useState } from 'react'
import {
  LuCalendar,
  LuCheck,
  LuClock,
  LuMap,
  LuMapPin,
  LuMessageCircle,
  LuWallet,
} from 'react-icons/lu'

import {
  type WorkerQuoteCardProgressStep,
  type WorkerQuoteStage,
  workerQuoteCardProgressSteps,
  workerQuotePricePence,
  workerQuoteStage,
  workerQuoteStageLabel,
} from '@/app/(dashboard)/helpers/workerQuoteJobs'
import {
  workerQuoteOnsiteCountdown,
  workerQuoteOnsiteScheduleLabel,
} from '@/app/(dashboard)/quotes/helpers/workerQuoteSchedule'
import { taskCategoryDisplayLabel } from '@/app/(task)/helpers/taskCategories'
import { budgetKindLabel } from '@/app/(task)/tasks/[slug]/helpers/taskDetailUtils'
import { sdlMotion } from '@/theme/styles'
import { formatPounds, formatRelativePosted } from '@/utils/dashboardHelpers'
import { isOrderClosed, taskOrderSectionHref } from '@/utils/orderHelpers'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { Badge, Button, Card, Link, Thumbnail } from '@ui'

import type { TaskCardWorkerQuoteProps } from './TaskCard'

function mapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
}

function stopCardToggle(event: MouseEvent) {
  event.stopPropagation()
}

export function TaskCardWorkerQuote({
  task,
  quote,
  workerOrder,
  initialExpanded = false,
}: TaskCardWorkerQuoteProps) {
  const [expanded, setExpanded] = useState(initialExpanded)
  const stage = workerQuoteStage(task, quote, workerOrder)
  const thumbnailSrc = task.images?.[0] ?? undefined
  const progressSteps = workerQuoteCardProgressSteps(task, quote, workerOrder)
  const quotePence = workerQuotePricePence(quote, workerOrder)
  const orderClosed = workerOrder ? isOrderClosed(workerOrder.status) : false
  const taskHref = `/tasks/${task.id}`
  const jobHref = taskOrderSectionHref(task.id)
  const categoryLabel = taskCategoryDisplayLabel(task.category)
  const priceKindLabel = budgetKindLabel(task.budget?.type)
  const locationLabel = taskPublicLocationLabel(task) || 'Location TBC'
  const sentLabel = formatRelativePosted(quote.createdAt).replace(
    /^Posted /,
    'Sent ',
  )
  const scheduleLabel = workerQuoteOnsiteScheduleLabel(task)
  const onsiteCountdown = workerQuoteOnsiteCountdown(task)
  const lat = task.location?.lat
  const lng = task.location?.lng
  const hasCoords =
    typeof lat === 'number' &&
    Number.isFinite(lat) &&
    typeof lng === 'number' &&
    Number.isFinite(lng)
  const showJobFooter =
    stage === 'booked' && !orderClosed && (scheduleLabel != null || hasCoords)

  const toggleExpanded = () => setExpanded((open) => !open)

  return (
    <Card layout="section" p={0} overflow="hidden">
      <Box p={5}>
        <HStack align="flex-start" gap={3}>
          <Box
            as="button"
            flex={1}
            minW={0}
            textAlign="left"
            bg="transparent"
            border="none"
            cursor="pointer"
            p={0}
            onClick={toggleExpanded}
            aria-expanded={expanded}
          >
            <HStack align="flex-start" gap={3}>
              <Thumbnail alt={`${task.title} thumbnail`} src={thumbnailSrc} />
              <Stack gap={2} minW={0} flex={1}>
                {categoryLabel ? (
                  <Badge variant="blue" size="sm" alignSelf="flex-start">
                    {categoryLabel}
                  </Badge>
                ) : null}
                <Heading size="sm" lineClamp={2}>
                  {task.title}
                </Heading>
                <HStack gap={2} flexWrap="wrap" align="center">
                  <MetaItem icon={<LuMapPin size={14} />}>
                    {locationLabel}
                  </MetaItem>
                  <Text fontSize="sm" color="text.muted" aria-hidden>
                    ·
                  </Text>
                  <MetaItem icon={<LuCalendar size={14} />}>
                    {sentLabel}
                  </MetaItem>
                </HStack>
                <HStack gap={2} flexWrap="wrap" align="center">
                  <MetaItem icon={<LuWallet size={14} />}>
                    Your quote{' '}
                    <Text as="span" fontWeight={700} color="text.default">
                      {quotePence != null && quotePence > 0
                        ? formatPounds(quotePence)
                        : '—'}
                    </Text>
                  </MetaItem>
                  {priceKindLabel ? (
                    <Badge variant="success" size="sm">
                      {priceKindLabel}
                    </Badge>
                  ) : null}
                </HStack>
              </Stack>
            </HStack>
          </Box>

          <Stack align="flex-end" gap={2} flexShrink={0}>
            <WorkerQuoteStageBadge stage={stage} />
            <HStack gap={1} align="center">
              <Box
                as="button"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                w={8}
                h={8}
                borderRadius="md"
                bg="transparent"
                border="none"
                cursor="pointer"
                color="text.muted"
                aria-expanded={expanded}
                aria-label={
                  expanded ? 'Collapse quote details' : 'Expand quote details'
                }
                onClick={(event) => {
                  event.stopPropagation()
                  toggleExpanded()
                }}
              >
                <WorkerQuoteChevronIcon expanded={expanded} />
              </Box>
            </HStack>
          </Stack>
        </HStack>
      </Box>

      {expanded ? (
        <Stack gap={4} px={5} pb={5}>
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'minmax(0, 1fr) minmax(0, 1fr)',
            }}
            gap={4}
            alignItems="stretch"
          >
            <WorkerQuoteMessagePanel message={quote.message} />
            <WorkerQuoteProgressTimeline steps={progressSteps} />
          </Grid>

          {showJobFooter ? (
            <Box
              borderRadius="lg"
              borderWidth="1px"
              borderColor="border.default"
              bg="bg.surface"
              px={4}
              py={3}
            >
              <HStack
                justify="space-between"
                align={{ base: 'flex-start', sm: 'center' }}
                gap={3}
                flexWrap="wrap"
              >
                <HStack gap={3} align="flex-start" minW={0}>
                  <Box
                    as="span"
                    display="inline-flex"
                    color="text.muted"
                    mt={0.5}
                    aria-hidden
                  >
                    <LuClock size={18} />
                  </Box>
                  <Stack gap={0} minW={0}>
                    {scheduleLabel ? (
                      <Text fontSize="sm" fontWeight={700} color="text.default">
                        {scheduleLabel}
                      </Text>
                    ) : null}
                    {onsiteCountdown ? (
                      <Text fontSize="sm" color="text.muted">
                        {onsiteCountdown}
                      </Text>
                    ) : null}
                  </Stack>
                </HStack>

                <HStack gap={2} flexWrap="wrap">
                  {hasCoords ? (
                    <Link
                      href={mapsDirectionsUrl(lat, lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={stopCardToggle}
                      _hover={{ textDecoration: 'none' }}
                    >
                      <Button size="sm" variant="outline">
                        <LuMap size={16} />
                        Open in Maps
                      </Button>
                    </Link>
                  ) : null}
                  <Link
                    href={jobHref}
                    onClick={stopCardToggle}
                    _hover={{ textDecoration: 'none' }}
                  >
                    <Button size="sm" variant="outline">
                      <LuMessageCircle size={16} />
                      Contact customer
                    </Button>
                  </Link>
                </HStack>
              </HStack>
            </Box>
          ) : null}
        </Stack>
      ) : null}
    </Card>
  )
}

function MetaItem({
  icon,
  children,
}: {
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <HStack gap={1.5} color="text.muted" fontSize="sm" minW={0}>
      <Box as="span" display="inline-flex" flexShrink={0} aria-hidden>
        {icon}
      </Box>
      <Text truncate>{children}</Text>
    </HStack>
  )
}

function WorkerQuoteMessagePanel({
  message,
}: {
  message: string | null | undefined
}) {
  const body = message?.trim()

  return (
    <Box
      borderRadius="lg"
      bg="status.success.soft"
      px={4}
      py={3}
      h="full"
      minH={{ md: '120px' }}
    >
      <Text fontSize="sm" fontWeight={700} color="text.default" mb={2}>
        Your message
      </Text>
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        {body || 'No message included with this quote.'}
      </Text>
    </Box>
  )
}

function WorkerQuoteProgressTimeline({
  steps,
}: {
  steps: WorkerQuoteCardProgressStep[]
}) {
  return (
    <Stack gap={3} justify="center" h="full" minH={{ md: '120px' }}>
      <HStack gap={0} align="flex-start" w="full">
        {steps.map((step, index) => (
          <HStack key={step.key} gap={0} flex={1} minW={0} align="flex-start">
            <Stack align="center" gap={1.5} flex={1} minW={0}>
              <ProgressStepDot done={step.done} />
              <Text
                fontSize="xs"
                fontWeight={700}
                color={step.done ? 'text.default' : 'text.muted'}
                textAlign="center"
              >
                {step.label}
              </Text>
              <Text
                fontSize="xs"
                color="text.muted"
                textAlign="center"
                lineClamp={1}
              >
                {step.detail}
              </Text>
            </Stack>
            {index < steps.length - 1 ? (
              <ProgressConnector done={steps[index + 1]?.done ?? false} />
            ) : null}
          </HStack>
        ))}
      </HStack>
    </Stack>
  )
}

function ProgressStepDot({ done }: { done: boolean }) {
  return (
    <Box
      boxSize="28px"
      borderRadius="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      bg={done ? 'action.primary' : 'transparent'}
      borderWidth={done ? '0' : '2px'}
      borderColor="neutral.300"
      color="text.onGreen"
    >
      {done ? <LuCheck size={16} strokeWidth={3} aria-hidden /> : null}
    </Box>
  )
}

function ProgressConnector({ done }: { done: boolean }) {
  return (
    <Box
      flex={1}
      minW={2}
      maxW="48px"
      mt="13px"
      mx={-1}
      borderTopWidth="2px"
      borderTopStyle={done ? 'solid' : 'dashed'}
      borderTopColor={done ? 'action.primary' : 'neutral.300'}
      aria-hidden
    />
  )
}

function WorkerQuoteChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <Box
      as="span"
      display="inline-flex"
      transform={expanded ? 'rotate(180deg)' : 'rotate(0deg)'}
      transitionProperty="transform"
      transitionDuration={sdlMotion.duration.base}
      transitionTimingFunction={sdlMotion.easing.standard}
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

function WorkerQuoteStageBadge({ stage }: { stage: WorkerQuoteStage }) {
  if (stage === 'booked') {
    return (
      <Badge variant="success" size="sm" flexShrink={0}>
        {workerQuoteStageLabel(stage)}
      </Badge>
    )
  }

  const tone =
    stage === 'closed'
      ? { variant: 'gray' as const }
      : stage === 'ended'
        ? { variant: 'gray' as const }
        : { variant: 'brand' as const }

  return (
    <Badge variant={tone.variant} size="sm" flexShrink={0}>
      {workerQuoteStageLabel(stage)}
    </Badge>
  )
}
