'use client'

import { Box } from '@chakra-ui/react'

import { TaskMap } from '../../components/TaskMap'
import {
  useTaskBrowseData,
  useTaskBrowseLayout,
  useTaskMapBindings,
} from '../../context/TaskBrowseProvider'
import { useSearchMode } from '../context/SearchModeProvider'
import { useWorkerSearch } from '../context/WorkerSearchProvider'

const SINGLE_PANEL_BUTTON_LEFT_INSET = '1.25rem + min(420px, 38vw)'

/**
 * Single map instance for /search, mode-switched between task price pins and
 * worker person pins. The map itself never remounts on mode change — only its
 * pin data, selection bindings, and nav-route policy swap. Worker pins sit at
 * approximate service-area locations, so the driving route is disabled there.
 */
export function SearchMapLayer({ isDesktop }: { isDesktop: boolean }) {
  const { mode } = useSearchMode()
  const mapBindings = useTaskMapBindings()
  const { windowOffsetWidth, setIsFilterOpen } = useTaskBrowseLayout()
  const { setSelectedTaskId, onNavRoutePresentingChange } = useTaskBrowseData()
  const workerSearch = useWorkerSearch()

  const workerModeBindings =
    mode === 'workers'
      ? {
          tasks: workerSearch.workerMapPoints,
          tasksLoaded: !workerSearch.loading && workerSearch.dataLoaded,
          selectedTaskId: workerSearch.selectedWorkerId,
          selectedTaskSelectionToken: workerSearch.selectedWorkerSelectionToken,
          navRouteEnabled: false,
          mapAriaLabel: 'Map of workers near the search area',
        }
      : null

  const selectFromMap = (id: string | null) => {
    if (id) setIsFilterOpen(false)
    if (mode === 'workers') {
      workerSearch.setSelectedWorkerId(id)
      return
    }
    setSelectedTaskId(id)
  }

  return (
    <Box position="absolute" inset={0} zIndex={isDesktop ? 1 : 0}>
      <TaskMap
        {...mapBindings}
        {...workerModeBindings}
        leftViewportPadding={isDesktop ? windowOffsetWidth : undefined}
        searchAreaButtonLeftInset={
          isDesktop ? SINGLE_PANEL_BUTTON_LEFT_INSET : undefined
        }
        onNavRoutePresentingChange={onNavRoutePresentingChange}
        onSelectTask={selectFromMap}
      />
    </Box>
  )
}
