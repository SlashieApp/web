'use client'

import { Box, useBreakpointValue } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

import { EVENTS, capture } from '@/utils/analytics'

import { BrowseGeolocationInit } from '../../components/BrowseGeolocationInit'
import { TaskBrowseMapLoader } from '../../components/TaskBrowseMapLoader'
import { TaskBrowseProvider } from '../../context/TaskBrowseProvider'
import {
  SearchModeProvider,
  useSearchMode,
} from '../context/SearchModeProvider'
import { WorkerSearchProvider } from '../context/WorkerSearchProvider'
import {
  type SearchUrlState,
  referenceFromSearchUrlState,
} from '../helpers/searchQueryParams'
import { MobileSearchLayout, WebSearchLayout } from './SearchLayouts'
import { SearchMapLayer } from './SearchMapLayer'
import { SearchUrlSync } from './SearchUrlSync'

/** Per-mode view analytics (tasks = browse_view, workers = workers_view). */
function SearchViewTracker() {
  const { mode } = useSearchMode()
  const trackedModesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (trackedModesRef.current.has(mode)) return
    trackedModesRef.current.add(mode)
    if (mode === 'workers') {
      capture(EVENTS.workers_view, { source: 'search_map' })
      return
    }
    capture(EVENTS.browse_view, { source: 'search_map' })
  }, [mode])

  return null
}

function WorkerSearchProviderWithMode({
  children,
  initialUrlState,
}: {
  children: React.ReactNode
  initialUrlState: SearchUrlState
}) {
  const { mode } = useSearchMode()
  return (
    <WorkerSearchProvider
      enabled={mode === 'workers'}
      initialState={{
        searchText: initialUrlState.workerSearchText,
        verifiedOnly: initialUrlState.workerVerifiedOnly,
      }}
    >
      {children}
    </WorkerSearchProvider>
  )
}

/**
 * Unified map-first search: one map + list shell, mode-switched between task
 * browse and worker discovery. Providers share the viewport so switching
 * modes keeps the map exactly where it was.
 */
export function SearchScreen({
  initialUrlState,
}: {
  initialUrlState: SearchUrlState
}) {
  const isDesktopSplit =
    useBreakpointValue({ base: false, lg: true }, { fallback: 'base' }) ?? false

  // Mount-only snapshot: URL updates after load flow the other way (SearchUrlSync).
  const initialRef = useRef(initialUrlState)
  const initial = initialRef.current
  const seededReference = referenceFromSearchUrlState(initial)

  return (
    <SearchModeProvider initialMode={initial.mode}>
      <TaskBrowseProvider
        initialTasks={[]}
        isDesktop={isDesktopSplit}
        initialState={{
          reference: seededReference,
          radiusMiles: initial.radiusMiles,
          category: initial.taskCategory,
          searchText: initial.taskSearchText,
        }}
      >
        <WorkerSearchProviderWithMode initialUrlState={initial}>
          {/* A shared URL pins the viewport — don't yank it to the visitor's GPS. */}
          {seededReference ? null : <BrowseGeolocationInit />}
          <SearchUrlSync />
          <SearchViewTracker />
          <Box
            flex={1}
            height="100%"
            w="full"
            minW={0}
            minH={0}
            position="relative"
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            <SearchMapLayer isDesktop={isDesktopSplit} />
            <TaskBrowseMapLoader />
            {isDesktopSplit ? <WebSearchLayout /> : <MobileSearchLayout />}
          </Box>
        </WorkerSearchProviderWithMode>
      </TaskBrowseProvider>
    </SearchModeProvider>
  )
}
