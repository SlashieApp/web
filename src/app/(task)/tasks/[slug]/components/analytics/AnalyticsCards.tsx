'use client'

import { Box, HStack, Skeleton, Stack, Text, chakra } from '@chakra-ui/react'
import { useState } from 'react'
import {
  LuChartColumn,
  LuChevronRight,
  LuEye,
  LuFlame,
  LuMessageSquareText,
  LuTimer,
} from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { WEB_MQ } from '@/theme/breakpoints'
import { sdlFocusRing } from '@/theme/styles'
import { Badge, Card, DetailRow, Drawer } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import {
  TASK_ANALYTICS_HASHES,
  readTaskDetailHash,
} from '../../helpers/taskDetailTabs'
import { taskOwnerAnalytics } from '../../helpers/taskOwnerAnalytics'
import bag from '../../i11n.json'

const INTEREST_BADGE = {
  low: 'neutral',
  medium: 'info',
  high: 'success',
} as const

const TriggerButton = chakra('button')

function hoursToQuoteLabel(
  hours: number | null,
  copy: {
    waiting: string
    underOneHour: string
    oneHour: string
    manyHours: string
  },
): string {
  if (hours == null) return copy.waiting
  if (hours < 1) return copy.underOneHour
  const rounded = Math.max(1, Math.round(hours))
  if (rounded === 1) return copy.oneHour
  return formatMessage(copy.manyHours, { count: rounded })
}

/** Owner snapshot: views, quotes, interest, time to quote (FE-258). */
function AnalyticsRows() {
  const { task } = useTaskDetail()
  const a = useI11n(bag).analytics

  if (!task) {
    return (
      <Stack gap={3} py={2} aria-busy>
        {[0, 1, 2, 3].map((row) => (
          <Skeleton key={row} h="calc(0.875rem * 1.5)" w="70%" />
        ))}
      </Stack>
    )
  }

  const stats = taskOwnerAnalytics(task)
  const rows = [
    {
      icon: <LuEye />,
      label: a.views,
      value: stats.views == null ? a.viewsColdStart : String(stats.views),
    },
    {
      icon: <LuMessageSquareText />,
      label: a.quotes,
      value: String(stats.quoteCount),
    },
    {
      icon: <LuFlame />,
      label: a.interest,
      value: (
        <Badge variant={INTEREST_BADGE[stats.interest]} size="sm" shape="pill">
          {a.interestLevel[stats.interest]}
        </Badge>
      ),
      subLine: a.interestHint[stats.interest],
    },
    {
      icon: <LuTimer />,
      label: a.timeToQuote.heading,
      value: hoursToQuoteLabel(stats.averageHoursToQuote, a.timeToQuote),
      subLine: a.timeToQuote.hint,
    },
  ]

  return (
    <Stack gap={0}>
      {rows.map((row, index) => (
        <DetailRow
          key={row.label}
          icon={row.icon}
          label={row.label}
          subLine={row.subLine}
          withDivider={index < rows.length - 1}
        >
          {row.value}
        </DetailRow>
      ))}
    </Stack>
  )
}

/** Desktop rail card. Owner-only; the rail is hidden on phones. */
export function AnalyticsCards() {
  const { task, pending, permissions } = useTaskDetail()
  const a = useI11n(bag).analytics

  if (!permissions.isOwner || (!task && !pending)) return null

  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      id="owner-task-performance"
      eyebrow={a.heading}
    >
      <AnalyticsRows />
    </Card>
  )
}

/**
 * Phones: an Analytics button in Overview opens the same snapshot in a
 * bottom sheet. Old `#analytics` links open it straight away.
 */
export function TaskAnalyticsTrigger() {
  const { task, permissions } = useTaskDetail()
  const a = useI11n(bag).analytics
  const [open, setOpen] = useState(
    () =>
      TASK_ANALYTICS_HASHES.has(readTaskDetailHash()) &&
      !window.matchMedia(`screen and ${WEB_MQ}`).matches,
  )

  if (!permissions.isOwner || !task) return null

  const stats = taskOwnerAnalytics(task)

  return (
    <Box display={{ base: 'block', lg: 'none' }}>
      <TriggerButton
        type="button"
        onClick={() => setOpen(true)}
        display="flex"
        alignItems="center"
        gap={3}
        w="full"
        minH="56px"
        px={4}
        py={3}
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
        textAlign="start"
        cursor="pointer"
        _hover={{ bg: 'bg.subtle' }}
        _focusVisible={sdlFocusRing}
      >
        <Box
          aria-hidden
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          boxSize="36px"
          flexShrink={0}
          borderRadius="lg"
          bg="status.success.soft"
          color="status.success.fg"
        >
          <LuChartColumn size={18} />
        </Box>
        <Stack gap={0} flex={1} minW={0}>
          <Text fontWeight={600} color="text.default">
            {a.heading}
          </Text>
          <Text fontSize="sm" color="text.muted" truncate>
            {formatMessage(a.overallTitle, {
              level: a.interestLevel[stats.interest],
            })}
          </Text>
        </Stack>
        <HStack color="text.muted" aria-hidden>
          <LuChevronRight size={18} />
        </HStack>
      </TriggerButton>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title={a.heading}
        placement="bottom"
      >
        <AnalyticsRows />
      </Drawer>
    </Box>
  )
}
