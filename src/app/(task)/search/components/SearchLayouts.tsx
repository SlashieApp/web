'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'

import { MobileTaskBrowseFiltersDrawer } from '../../components/(mobile)/MobileTaskBrowseFiltersDrawer'
import { MobileTaskCarousel } from '../../components/(mobile)/MobileTaskCarousel'
import { WebTaskBrowseFiltersBlock } from '../../components/(web)/TaskBrowseFilters'
import { TaskBrowseListColumnScrim } from '../../components/(web)/TaskBrowseListColumnScrim'
import { TaskBrowseSearchThisAreaButton } from '../../components/TaskBrowseSearchThisAreaButton'
import { TaskSearch } from '../../components/TaskSearch'
import { TaskTag } from '../../components/TaskTag'
import { useTaskBrowseLayout } from '../../context/TaskBrowseProvider'
import { useSearchMode } from '../context/SearchModeProvider'
import { MobileWorkerCarousel } from './MobileWorkerCarousel'
import { SearchModeSelector } from './SearchModeSelector'
import { SearchResultsListTitle } from './SearchResultsListTitle'
import { WorkerFilterChips } from './WorkerFilterChips'
import { WorkerFiltersPanel } from './WorkerFiltersPanel'
import { WebWorkerSearchBlock } from './WorkerSearchPanel'

/**
 * Desktop split view for /search: mode selector above the location bar; the list/filters region swaps per mode.
 */
export function WebSearchLayout() {
  const { mode } = useSearchMode()

  return (
    <Box
      flex={1}
      minH={0}
      h="full"
      w="full"
      position="relative"
      overflow="hidden"
    >
      <TaskBrowseListColumnScrim />
      <Box
        position="absolute"
        zIndex={2}
        top={2}
        left={2}
        bottom={2}
        w={{ base: 'calc(100% - 24px)', md: '460px' }}
        maxW="460px"
        display="flex"
        flexDirection="column"
        pointerEvents="none"
      >
        <Box
          px={{ base: 1, md: 0 }}
          pb={2}
          flex={1}
          minH={0}
          display="flex"
          flexDirection="column"
          w="full"
        >
          <Stack gap={2} flexShrink={0}>
            <SearchModeSelector />
            <TaskSearch />
            <HStack gap={1.5} flexWrap="wrap">
              {mode === 'workers' ? <WorkerFilterChips /> : <TaskTag />}
            </HStack>
          </Stack>

          <Box
            flex={1}
            minH={0}
            w="full"
            pt={2}
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            {mode === 'workers' ? (
              <WebWorkerSearchBlock
                listHeader={<SearchResultsListTitle mode="workers" />}
              />
            ) : (
              <WebTaskBrowseFiltersBlock
                listHeader={<SearchResultsListTitle mode="tasks" />}
              />
            )}
          </Box>
        </Box>
      </Box>

      <TaskBrowseSearchThisAreaButton overlay />
    </Box>
  )
}

/** Mobile worker filters: same slot the task bottom-sheet uses, panel styling. */
function MobileWorkerFiltersOverlay() {
  const { isFilterOpen } = useTaskBrowseLayout()
  if (!isFilterOpen) return null
  return (
    <Box
      position="absolute"
      left={3}
      right={3}
      top={{ base: 36, sm: 40 }}
      zIndex={5}
      maxH="60dvh"
      overflowY="auto"
      pointerEvents="auto"
      borderRadius="2xl"
    >
      <WorkerFiltersPanel />
    </Box>
  )
}

/**
 * Mobile /search: map behind, mode selector + location bar on top, bottom
 * card strip per mode (task carousel or worker strip).
 */
export function MobileSearchLayout() {
  const { mode } = useSearchMode()

  return (
    <Box
      flex={1}
      minH={0}
      w="full"
      position="relative"
      minW={0}
      pointerEvents="none"
    >
      {/* White top fade (30% of height) so the mode toggle / search / chips
          read over the map — mobile twin of TaskBrowseListColumnScrim. */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="30%"
        zIndex={3}
        pointerEvents="none"
        aria-hidden
        css={{
          background:
            'linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.75) 45%, rgba(255, 255, 255, 0) 100%)',
        }}
      />

      <Box
        position="absolute"
        top={3}
        left={3}
        right={3}
        zIndex={4}
        pointerEvents="none"
      >
        <Stack gap={2} flexShrink={0} mr={12}>
          <SearchModeSelector />
          <TaskSearch />
          <HStack gap={1.5} flexWrap="wrap">
            {mode === 'workers' ? <WorkerFilterChips /> : <TaskTag />}
          </HStack>
        </Stack>
      </Box>

      <Box
        position="absolute"
        left={0}
        right={0}
        bottom={8}
        zIndex={3}
        display="flex"
        flexDirection="column"
        gap={2}
        pointerEvents="auto"
      >
        <TaskBrowseSearchThisAreaButton />
        {mode === 'workers' ? <MobileWorkerCarousel /> : <MobileTaskCarousel />}
      </Box>

      {mode === 'workers' ? (
        <MobileWorkerFiltersOverlay />
      ) : (
        <MobileTaskBrowseFiltersDrawer />
      )}
    </Box>
  )
}
