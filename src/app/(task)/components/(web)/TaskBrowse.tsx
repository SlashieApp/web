'use client'

import type { TaskListItem } from '@/graphql/tasks-query.types'
import { useBreakpointValue } from '@chakra-ui/react'
import { MobileLayout, WebLayout } from '../../layout'
import { TaskBrowseDataProvider } from './taskBrowseDataContext'
import { TaskBrowseLayoutProvider } from './taskBrowseLayoutContext'

export type TaskBrowseProps = {
  headerTitle?: string
  headerSubtitle?: string
  initialTasks?: TaskListItem[]
}

export function TaskBrowse(props: TaskBrowseProps = {}) {
  const {
    headerTitle = 'Find work near you',
    headerSubtitle,
    initialTasks = [],
  } = props
  const isDesktopSplit =
    useBreakpointValue({ base: false, md: true }, { fallback: 'base' }) ?? false

  return (
    <TaskBrowseLayoutProvider isDesktop={isDesktopSplit}>
      <TaskBrowseDataProvider
        headerSubtitle={headerSubtitle}
        initialTasks={initialTasks}
      >
        {isDesktopSplit ? (
          <WebLayout headerTitle={headerTitle} />
        ) : (
          <MobileLayout headerTitle={headerTitle} />
        )}
      </TaskBrowseDataProvider>
    </TaskBrowseLayoutProvider>
  )
}

export {
  TaskBrowseFilters,
  type TaskBrowseFiltersProps,
  type UrgencyFilter,
} from './TaskBrowseFilters/TaskBrowseFilters'
export {
  TaskLocationMapPicker,
  type TaskLocationMapPickerProps,
} from './TaskLocationMapPicker'
export { TaskList, type TaskListProps } from './TaskList'
export { TaskMap, type TaskMapProps, type TaskMapTask } from './TaskMap'
