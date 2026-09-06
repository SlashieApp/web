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
import { SearchResultsListTitle } from './results/SearchResultsListTitle'

/** Desktop split view for /search: location bar + task list over the map. */
export function WebSearchLayout() {
  return (
    <Box
      flex={1}
      minH={0}
      h="full"
      w="full"
      position="relative"
      overflow="hidden"
    >
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
              <TaskSearch />
              <HStack gap={1.5} flexWrap="wrap">
                <TaskTag />
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
              <WebTaskBrowseFiltersBlock
                listHeader={<SearchResultsListTitle />}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      <TaskBrowseSearchThisAreaButton overlay />
    </Box>
  )
}

/** Mobile /search: map behind, location bar on top, task carousel at the bottom. */
export function MobileSearchLayout() {
  return (
    <Box
      flex={1}
      minH={0}
      w="full"
      position="relative"
      minW={0}
      pointerEvents="none"
    >
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
            <TaskSearch />
            <HStack gap={1.5} flexWrap="wrap">
              <TaskTag />
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
        <MobileTaskCarousel />
      </Box>

      <MobileTaskBrowseFiltersDrawer />
    </Box>
  )
}
