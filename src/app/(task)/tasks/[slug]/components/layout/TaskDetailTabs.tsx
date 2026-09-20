'use client'

import type { BoxProps } from '@chakra-ui/react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_TAB } from '../../helpers/taskDetailTabs'
import { taskOwnerAnalytics } from '../../helpers/taskOwnerAnalytics'
import bag from '../../i11n.json'
import { AnalyticsCards } from '../analytics/AnalyticsCards'
import { OverviewCards } from '../overview/OverviewCards'
import { QuotesCards } from '../quotes/QuotesCards'
import {
  TaskDetailTabLayout,
  type TaskDetailTabSlot,
} from './TaskDetailTabLayout'
import { TaskTitle } from './TaskTitle'
import { selectStatusHeaderCopy } from './statusHeaderCopy'

type TaskDetailTabsProps = {
  fitted?: boolean
  fittedBelowLg?: boolean
  px?: BoxProps['px']
}

/**
 * Connected tab layout: builds per-tab slots from the viewer + task state.
 */
export function TaskDetailTabs({
  fitted = false,
  fittedBelowLg = false,
  px,
}: TaskDetailTabsProps) {
  const t = useI11n(bag)
  const {
    task,
    activeTab,
    setActiveTab,
    permissions,
    statusReady,
    myQuote,
    isAuthenticated,
  } = useTaskDetail()
  const quoteCount = task?.quotes.length ?? 0
  const showAnalytics = permissions.isOwner
  const analytics = task ? taskOwnerAnalytics(task) : null
  const analyticsTitle = analytics
    ? formatMessage(t.analytics.overallTitle, {
        level: t.analytics.interestLevel[analytics.interest],
      })
    : t.analytics.interest
  const analyticsDescription = analytics
    ? t.analytics.interestHint[analytics.interest]
    : undefined
  const copy =
    statusReady && task
      ? selectStatusHeaderCopy(
          { permissions, myQuote, isAuthenticated, task },
          t.statusHeader,
        )
      : null

  const tabs: TaskDetailTabSlot[] = [
    {
      key: TASK_DETAIL_TAB.overview,
      label: t.mobile.tabOverview,
      tabTitle: copy?.headline,
      tabDescription: copy?.subtext,
      cards: <OverviewCards />,
    },
    {
      key: TASK_DETAIL_TAB.quotes,
      label: t.mobile.tabQuotes,
      badge: quoteCount,
      tabTitle: permissions.isOwner
        ? t.trust.ownerHeading
        : t.trust.workerHeading,
      tabDescription: <SafetyNotice variant="inline" />,
      cards: <QuotesCards />,
    },
    ...(showAnalytics
      ? [
          {
            key: TASK_DETAIL_TAB.analytics,
            label: t.mobile.tabAnalytics,
            tabTitle: analyticsTitle,
            tabDescription: analyticsDescription,
            cards: <AnalyticsCards />,
          } satisfies TaskDetailTabSlot,
        ]
      : []),
  ]

  return (
    <TaskDetailTabLayout
      fitted={fitted}
      fittedBelowLg={fittedBelowLg}
      px={px}
      value={activeTab}
      onChange={setActiveTab}
      ariaLabel={t.nav.taskSectionsAria}
      title={({ isStuck }) => <TaskTitle isStuck={isStuck} />}
      tabs={tabs}
    />
  )
}
