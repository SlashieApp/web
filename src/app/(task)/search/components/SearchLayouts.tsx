'use client'

import { Box, Container, HStack, Stack } from '@chakra-ui/react'

import {
  PAGE_CONTAINER_MAX_W,
  PAGE_GUTTER_X,
  SEARCH_LIST_COLUMN_W,
  SEARCH_LIST_SCRIM_W,
} from '@/theme/pageContainer'

import { MobileTaskBrowseFiltersDrawer } from '../../components/(mobile)/MobileTaskBrowseFiltersDrawer'
import { MobileTaskCarousel } from '../../components/(mobile)/MobileTaskCarousel'
import { WebTaskBrowseFiltersBlock } from '../../components/(web)/TaskBrowseFilters'
import { TaskBrowseListColumnScrim } from '../../components/(web)/TaskBrowseListColumnScrim'
import { TaskBrowseSearchThisAreaButton } from '../../components/TaskBrowseSearchThisAreaButton'
import { TaskSearch } from '../../components/TaskSearch'
import { TaskTag } from '../../components/TaskTag'
import { useTaskBrowseLayout } from '../../context/TaskBrowseProvider'
import { useSearchMode } from '../context/SearchModeProvider'
import { SearchModeSelector } from './filters/SearchModeSelector'
import { WorkerFilterChips } from './filters/WorkerFilterChips'
import { WorkerFiltersPanel } from './filters/WorkerFiltersPanel'
import { MobileWorkerCarousel } from './results/MobileWorkerCarousel'
import { SearchResultsListTitle } from './results/SearchResultsListTitle'
import { WebWorkerSearchBlock } from './results/WorkerSearchPanel'

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
      {/* Map wash: viewport left → task list right edge. */}
      <TaskBrowseListColumnScrim w={SEARCH_LIST_SCRIM_W} fadeToEnd />
      <Box
        position="absolute"
        inset={0}
        zIndex={2}
        display="flex"
        justifyContent="center"
        pointerEvents="none"
      >
        <Container
          maxW={PAGE_CONTAINER_MAX_W}
          px={PAGE_GUTTER_X}
          h="full"
          w="full"
        >
          <Box
            py={2}
            w={{ base: 'full', md: SEARCH_LIST_COLUMN_W }}
            maxW={SEARCH_LIST_COLUMN_W}
            h="full"
            display="flex"
            flexDirection="column"
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
        </Container>
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
        left={0}
        right={0}
        zIndex={4}
        pointerEvents="none"
        display="flex"
        justifyContent="center"
      >
        <Container maxW={PAGE_CONTAINER_MAX_W} px={PAGE_GUTTER_X} w="full">
          <Stack gap={2} flexShrink={0} mr={12}>
            <SearchModeSelector />
            <TaskSearch />
            <HStack gap={1.5} flexWrap="wrap">
              {mode === 'workers' ? <WorkerFilterChips /> : <TaskTag />}
            </HStack>
          </Stack>
        </Container>
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
