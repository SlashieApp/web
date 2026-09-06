'use client'

import { Box, useBreakpointValue } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

import { EVENTS, capture } from '@/utils/analytics'

import { BrowseGeolocationInit } from '../../components/BrowseGeolocationInit'
import { TaskBrowseMapLoader } from '../../components/TaskBrowseMapLoader'
import { TaskBrowseProvider } from '../../context/TaskBrowseProvider'
import {
  type SearchUrlState,
  referenceFromSearchUrlState,
} from '../helpers/searchQueryParams'
import { MobileSearchLayout, WebSearchLayout } from './SearchLayouts'
import { SearchUrlSync } from './SearchUrlSync'
import { SearchMapLayer } from './map/SearchMapLayer'

function SearchViewTracker() {
  const trackedRef = useRef(false)

  useEffect(() => {
    if (trackedRef.current) return
    trackedRef.current = true
    capture(EVENTS.browse_view, { source: 'search_map' })
  }, [])

  return null
}

/**
 * Map-first task search: map + list shell with location and category filters.
 */
export function SearchScreen({
  initialUrlState,
}: {
  initialUrlState: SearchUrlState
}) {
  const isDesktopSplit =
    useBreakpointValue({ base: false, lg: true }, { fallback: 'base' }) ?? false

  const initialRef = useRef(initialUrlState)
  const initial = initialRef.current
  const seededReference = referenceFromSearchUrlState(initial)

  return (
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
    </TaskBrowseProvider>
  )
}
