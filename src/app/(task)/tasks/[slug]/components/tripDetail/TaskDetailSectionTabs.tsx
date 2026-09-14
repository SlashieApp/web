'use client'

import { Grid } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { Tabs } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_TAB } from '../../helpers/taskDetailTabs'
import bag from '../../i11n.json'
import { TaskDetailMoneyChrome } from './TaskDetailMoneyChrome'
import {
  TaskActivitySections,
  TaskInfoSections,
  TaskQuoteSections,
} from './TaskDetailSections'

type TaskDetailSectionTabsProps = {
  fitted?: boolean
  px?: number | string
  /**
   * Desktop Overview: two columns (details | quotes) at full container width.
   * Mobile stays a single stacked column.
   */
  splitOverview?: boolean
}

/**
 * Shared Overview · Quotes · Activity tabs with sticky money chrome.
 * Controlled from TaskDetailProvider so the role CTA can switch tabs.
 */
export function TaskDetailSectionTabs({
  fitted = false,
  px,
  splitOverview = false,
}: TaskDetailSectionTabsProps) {
  const t = useI11n(bag)
  const { task, activeTab, setActiveTab } = useTaskDetail()
  const quoteCount = task?.quotes.length ?? 0

  return (
    <Tabs
      fitted={fitted}
      sticky
      stickyTop={0}
      px={px}
      w="full"
      aria-label={t.nav.taskSectionsAria}
      value={activeTab}
      onChange={(key) => {
        if (
          key === TASK_DETAIL_TAB.overview ||
          key === TASK_DETAIL_TAB.quotes ||
          key === TASK_DETAIL_TAB.activity
        ) {
          setActiveTab(key)
        }
      }}
      stickyHeader={<TaskDetailMoneyChrome />}
      tabs={[
        { key: TASK_DETAIL_TAB.overview, label: t.mobile.tabOverview },
        {
          key: TASK_DETAIL_TAB.quotes,
          label: t.mobile.tabQuotes,
          badge: quoteCount,
        },
        { key: TASK_DETAIL_TAB.activity, label: t.mobile.tabActivity },
      ]}
    >
      <Tabs.Panel value={TASK_DETAIL_TAB.overview}>
        {splitOverview ? (
          <Grid
            w="full"
            templateColumns="minmax(0, 1fr) minmax(320px, 400px)"
            columnGap={8}
            rowGap={5}
            alignItems="start"
          >
            <TaskInfoSections />
            <TaskQuoteSections />
          </Grid>
        ) : (
          <TaskInfoSections />
        )}
      </Tabs.Panel>
      <Tabs.Panel value={TASK_DETAIL_TAB.quotes}>
        <TaskQuoteSections />
      </Tabs.Panel>
      <Tabs.Panel value={TASK_DETAIL_TAB.activity}>
        <TaskActivitySections />
      </Tabs.Panel>
    </Tabs>
  )
}
