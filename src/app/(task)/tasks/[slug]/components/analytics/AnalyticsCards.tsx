'use client'

import { Skeleton, Stack } from '@chakra-ui/react'
import {
  LuChartColumn,
  LuEye,
  LuFlame,
  LuMessageSquareText,
  LuTimer,
} from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { WEB_MQ } from '@/theme/breakpoints'
import { Badge, Card, DetailRow } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import {
  TASK_ANALYTICS_HASHES,
  readTaskDetailHash,
} from '../../helpers/taskDetailTabs'
import { taskOwnerAnalytics } from '../../helpers/taskOwnerAnalytics'
import bag from '../../i11n.json'
import { TaskSectionSheet } from '../ui/TaskSectionSheet'

const INTEREST_BADGE = {
  low: 'neutral',
  medium: 'info',
  high: 'success',
} as const

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
 * Phones: an Analytics section card in Overview opens the same snapshot in a
 * bottom sheet. Old `#analytics` links open it straight away.
 */
export function TaskAnalyticsTrigger() {
  const { task, permissions } = useTaskDetail()
  const a = useI11n(bag).analytics

  if (!permissions.isOwner || !task) return null

  const stats = taskOwnerAnalytics(task)

  return (
    <TaskSectionSheet
      icon={<LuChartColumn size={18} />}
      title={a.heading}
      summary={formatMessage(a.overallTitle, {
        level: a.interestLevel[stats.interest],
      })}
      defaultOpen={
        TASK_ANALYTICS_HASHES.has(readTaskDetailHash()) &&
        !window.matchMedia(`screen and ${WEB_MQ}`).matches
      }
    >
      <AnalyticsRows />
    </TaskSectionSheet>
  )
}
