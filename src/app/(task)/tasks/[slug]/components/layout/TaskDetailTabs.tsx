'use client'

import type { BoxProps } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_TAB } from '../../helpers/taskDetailTabs'
import bag from '../../i11n.json'
import { OverviewCards } from '../overview/OverviewCards'
import { TaskDetailSideRail } from './TaskDetailSideRail'
import {
  TaskDetailTabLayout,
  type TaskDetailTabSlot,
} from './TaskDetailTabLayout'
import { TaskTitle } from './TaskTitle'

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
  const { activeTab, setActiveTab } = useTaskDetail()

  const tabs: TaskDetailTabSlot[] = [
    {
      key: TASK_DETAIL_TAB.overview,
      label: t.mobile.tabOverview,
      cards: <OverviewCards />,
    },
  ]

  return (
    <TaskDetailTabLayout
      fitted={fitted}
      fittedBelowLg={fittedBelowLg}
      px={px}
      onChange={setActiveTab}
      ariaLabel={t.nav.taskSectionsAria}
      title={({ isStuck }) => <TaskTitle isStuck={isStuck} />}
      tabs={tabs}
      value={
        tabs.some((tab) => tab.key === activeTab)
          ? activeTab
          : TASK_DETAIL_TAB.overview
      }
      rail={<TaskDetailSideRail />}
    />
  )
}
