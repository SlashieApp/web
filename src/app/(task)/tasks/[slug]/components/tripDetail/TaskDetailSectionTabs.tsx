'use client'

import { Box, type BoxProps, Grid } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { Tabs } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_OVERVIEW_COLUMNS } from '../../helpers/taskDetailLayout'
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
  fittedBelowLg?: boolean
  px?: BoxProps['px']
}

/**
 * Shared Overview · Quotes · Activity tabs with sticky money chrome.
 * Controlled from TaskDetailProvider so the role CTA can switch tabs.
 */
export function TaskDetailSectionTabs({
  fitted = false,
  fittedBelowLg = false,
  px,
}: TaskDetailSectionTabsProps) {
  const t = useI11n(bag)
  const { task, activeTab, setActiveTab } = useTaskDetail()
  const quoteCount = task?.quotes.length ?? 0

  return (
    <Tabs
      fitted={fitted}
      fittedBelowLg={fittedBelowLg}
      sticky
      stickyTop={0}
      w="full"
      px={px}
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
        <Grid
          w="full"
          templateColumns={TASK_DETAIL_OVERVIEW_COLUMNS}
          columnGap={{ lg: 8 }}
          rowGap={5}
          alignItems="start"
        >
          <TaskInfoSections />
          <Box display={{ base: 'none', lg: 'block' }} minW={0}>
            <TaskQuoteSections />
          </Box>
        </Grid>
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
