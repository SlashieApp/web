'use client'

import { Box, useBreakpointValue } from '@chakra-ui/react'
import { useRef } from 'react'

import { BrowseGeolocationInit } from '../../components/analytics/BrowseGeolocationInit'
import { TaskBrowseProvider } from '../../context/TaskBrowseProvider'
import {
  type SearchUrlState,
  referenceFromSearchUrlState,
} from '../helpers/searchQueryParams'
import { SearchUrlSync } from './SearchUrlSync'
import { MobileSearchLayout, WebSearchLayout } from './layout/SearchLayouts'
import { SearchMapLayer } from './map/SearchMapLayer'

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
      {/* Browse view capture: ./analytics/SearchViewTracker */}
      <Box
        flex={1}
        w="full"
        minW={0}
        minH={0}
        // Fill the shell main padding box on mobile so the map stays full-bleed
        // under the glass nav. The carousel is offset above the pill separately.
        pointerEvents="none"
        position={{ base: 'absolute', lg: 'relative' }}
        inset={{ base: 0, lg: 'auto' }}
        height={{ base: 'auto', lg: '100%' }}
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <SearchMapLayer isDesktop={isDesktopSplit} />
        {/* Both form factors stay mounted. CSS (not `useBreakpointValue`)
            picks the visible chrome so SSR/first paint matches the viewport
            instead of flashing the mobile carousel skeleton on desktop. */}
        <WebSearchLayout />
        <MobileSearchLayout />
      </Box>
    </TaskBrowseProvider>
  )
}
