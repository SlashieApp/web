'use client'

import type { BoxProps } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_TAB } from '../../helpers/taskDetailTabs'
import bag from '../../i11n.json'
import { AnalyticsCards } from '../analytics/AnalyticsCards'
import { OverviewCards } from '../overview/OverviewCards'
import { QuotesCards } from '../quotes/QuotesCards'
import { TaskDetailMainCta } from './TaskDetailMainCta'
import {
  TaskDetailTabLayout,
  type TaskDetailTabSlot,
} from './TaskDetailTabLayout'
import { TaskHelpOverflowTrigger } from './TaskOverflowMenu'
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
  const copy =
    statusReady && task
      ? selectStatusHeaderCopy(
          { permissions, myQuote, isAuthenticated, task },
          t.statusHeader,
        )
      : null

  const tabIconButton = <TaskHelpOverflowTrigger />

  const tabs: TaskDetailTabSlot[] = [
    {
      key: TASK_DETAIL_TAB.overview,
      label: t.mobile.tabOverview,
      tabTitle: copy?.headline,
      tabDescription: copy?.subtext,
      tabIconButton,
      cards: <OverviewCards />,
    },
    {
      key: TASK_DETAIL_TAB.quotes,
      label: t.mobile.tabQuotes,
      badge: quoteCount,
      tabIconButton,
      cards: <QuotesCards />,
    },
    ...(showAnalytics
      ? [
          {
            key: TASK_DETAIL_TAB.analytics,
            label: t.mobile.tabAnalytics,
            tabIconButton,
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
      mainCta={<TaskDetailMainCta />}
    />
  )
}
