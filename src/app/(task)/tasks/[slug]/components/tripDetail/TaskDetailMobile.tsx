'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, Text } from '@chakra-ui/react'
import {
  type UIEvent,
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import bag from '../../i11n.json'

import { sdlMotion } from '@/theme/styles'
import { Tabs } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  type TaskDetailTab,
  defaultTaskDetailTab,
  parseTaskDetailTabHash,
  replaceTaskDetailTabHash,
} from '../../helpers/taskDetailTabs'
import { StatusHeader } from './StatusHeader'
import { TaskActivitySections } from './TaskActivitySections'
import { TaskDetailMobileActionBar } from './TaskDetailMobileActionBar'
import { TaskDetailMobileChips } from './TaskDetailMobileChips'
import { TaskDetailsSections, TaskQuoteSections } from './TaskDetailSections'
import { TaskHeaderControls } from './TaskHeaderControls'
import { TaskOverviewSections } from './TaskOverviewSections'

const MAP_COLLAPSE_AT = 80
const MAP_EXPAND_AT = 8
const MAP_HERO_MAX_H = '260px'

function subscribeHash(onStoreChange: () => void) {
  window.addEventListener('hashchange', onStoreChange)
  return () => window.removeEventListener('hashchange', onStoreChange)
}

function getHashTabSnapshot(): TaskDetailTab | null {
  return parseTaskDetailTabHash(window.location.hash)
}

function getServerHashTabSnapshot(): TaskDetailTab | null {
  return null
}

/**
 * Mobile (<lg) task detail: map hero can scroll away; header + chips + tabs
 * stay pinned; only the active panel scrolls; a fixed-in-flow action bar
 * keeps Share / primary / Messages void reachable.
 */
export function TaskDetailMobile() {
  const { task, permissions, statusReady } = useTaskDetail()
  const t = useI11n(bag)
  const quoteCount = task?.quotes.length ?? 0

  const hashTab = useSyncExternalStore(
    subscribeHash,
    getHashTabSnapshot,
    getServerHashTabSnapshot,
  )
  const [userTab, setUserTab] = useState<TaskDetailTab | null>(null)
  const defaultTab = defaultTaskDetailTab({
    isOwner: statusReady && permissions.isOwner,
    quoteCount,
  })
  const activeTab = userTab ?? hashTab ?? defaultTab

  const mapCollapsedRef = useRef(false)
  const [mapCollapsed, setMapCollapsed] = useState(false)

  const onPanelScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const y = event.currentTarget.scrollTop
    const next = mapCollapsedRef.current
      ? y > MAP_EXPAND_AT
      : y > MAP_COLLAPSE_AT
    if (next !== mapCollapsedRef.current) {
      mapCollapsedRef.current = next
      setMapCollapsed(next)
    }
  }, [])

  const onTabChange = useCallback((key: string) => {
    const tab = parseTaskDetailTabHash(key)
    if (!tab) return
    setUserTab(tab)
    replaceTaskDetailTabHash(tab)
  }, [])

  if (!task) return null

  const title = task.title?.trim() || t.fallbackTask

  return (
    <Box
      display="flex"
      flexDirection="column"
      h="100%"
      minH="100%"
      overflow="hidden"
      bg="bg.canvas"
    >
      <Box
        flexShrink={0}
        maxH={mapCollapsed ? '0' : MAP_HERO_MAX_H}
        overflow="hidden"
        transitionProperty="max-height"
        transitionDuration={sdlMotion.duration.moderate}
        transitionTimingFunction={sdlMotion.easing.standard}
      >
        <StatusHeader collapsed={mapCollapsed} />
      </Box>

      <Box flexShrink={0} bg="bg.canvas" px={4} pt={2} pb={1}>
        {mapCollapsed ? (
          <TaskHeaderControls showBackLabel={false}>
            <Text
              as="h1"
              flex="1"
              minW={0}
              fontWeight={600}
              fontSize="md"
              color="text.default"
              truncate
            >
              {title}
            </Text>
          </TaskHeaderControls>
        ) : (
          <Box py={1} pr={1}>
            <Text fontSize="xs" fontWeight={600} color="text.muted">
              {t.mobile.eyebrow}
            </Text>
            <Text
              as="h1"
              fontFamily="heading"
              fontWeight={600}
              fontSize="lg"
              lineHeight="1.3"
              color="text.default"
            >
              {title}
            </Text>
          </Box>
        )}
      </Box>

      <Box flexShrink={0}>
        <TaskDetailMobileChips />
      </Box>

      <Tabs
        fill
        aria-label={t.nav.taskSectionsAria}
        value={activeTab}
        onChange={onTabChange}
        px={4}
        flex="1"
        minH={0}
        tabs={[
          { key: 'overview', label: t.mobile.tabOverview },
          { key: 'details', label: t.mobile.tabDetails },
          { key: 'quotes', label: t.mobile.tabQuotes, badge: quoteCount },
          { key: 'activity', label: t.mobile.tabActivity },
        ]}
      >
        <Tabs.Panel value="overview" onScroll={onPanelScroll}>
          <Box px={0} pt={4} pb={6}>
            <TaskOverviewSections />
          </Box>
        </Tabs.Panel>
        <Tabs.Panel value="details" onScroll={onPanelScroll}>
          <Box px={0} pt={4} pb={6}>
            <TaskDetailsSections />
          </Box>
        </Tabs.Panel>
        <Tabs.Panel value="quotes" onScroll={onPanelScroll}>
          <Box px={0} pt={4} pb={6}>
            <TaskQuoteSections />
          </Box>
        </Tabs.Panel>
        <Tabs.Panel value="activity" onScroll={onPanelScroll}>
          <Box px={0} pt={4} pb={6}>
            <TaskActivitySections />
          </Box>
        </Tabs.Panel>
      </Tabs>

      <TaskDetailMobileActionBar onSelectTab={onTabChange} />
    </Box>
  )
}
