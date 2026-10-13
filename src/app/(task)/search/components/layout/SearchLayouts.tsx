'use client'

import { Box, Container, HStack, Stack } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import {
  PAGE_CONTAINER_MAX_W,
  PAGE_GUTTER_X,
  SEARCH_LIST_COLUMN_W,
} from '@/theme/pageContainer'
import { Logo } from '@ui'

import { useTaskBrowseData } from '../../../context/TaskBrowseProvider'
import { SEARCH_BOTTOM_CHROME_VAR } from '../../../helpers/marketplaceMap/overlay/config'
import searchBag from '../../i11n.json'

import { MobileTaskCarousel } from '../../../components/(mobile)/layout/MobileTaskCarousel'
import { MobileTaskSearchSheet } from '../../../components/(mobile)/layout/MobileTaskSearchSheet'
import { TaskList } from '../../../components/(web)/layout/TaskList'
import { TaskBrowseSearchThisAreaButton } from '../../../components/ui/TaskBrowseSearchThisAreaButton'
import { TaskSearch } from '../../../components/ui/TaskSearch'
import { TaskSearchFilters } from '../../../components/ui/TaskSearchFilters'
import { TaskTag } from '../../../components/ui/TaskTag'
import { useIsTouchMobileDevice } from '../../../helpers/touchMobileDevice'
import {
  SEARCH_CHROME_TOP_PX,
  SEARCH_LOGO_BAND_PX,
  SEARCH_LOGO_PX,
} from '../../helpers/searchChrome'
import { SearchResultsListTitle } from '../results/SearchResultsListTitle'

/** Desktop split view for /search: search panel (field, chips, results) over the map. */
export function WebSearchLayout() {
  return (
    <Box
      flex={1}
      minH={0}
      h="full"
      w="full"
      position="relative"
      overflow="hidden"
      display={{ base: 'none', lg: 'block' }}
    >
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
            pointerEvents="auto"
            display="flex"
            flexDirection="column"
          >
            <Stack gap={2} flexShrink={0}>
              <TaskSearch mode="input" />
              <TaskSearchFilters />
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
              <TaskList header={<SearchResultsListTitle />} />
            </Box>
          </Box>
        </Container>
      </Box>

      <TaskBrowseSearchThisAreaButton overlay />
    </Box>
  )
}

/** Mobile /search: map behind, search bar on top (opens the search sheet), task carousel at the bottom. */
/**
 * Publish the card stack's height so the Mapbox mark always sits just above
 * it, whether or not Search this area shows or a title wraps.
 */
function trackBottomChrome(node: HTMLDivElement | null) {
  if (!node || typeof ResizeObserver === 'undefined') return
  const root = document.documentElement
  const observer = new ResizeObserver(() => {
    root.style.setProperty(
      SEARCH_BOTTOM_CHROME_VAR,
      `${Math.ceil(node.getBoundingClientRect().height)}px`,
    )
  })
  observer.observe(node)
  return () => {
    observer.disconnect()
    root.style.removeProperty(SEARCH_BOTTOM_CHROME_VAR)
  }
}

export function MobileSearchLayout() {
  const touchPhone = useIsTouchMobileDevice()
  const t = useI11n(searchBag)
  const { retryTasks } = useTaskBrowseData()

  return (
    <Box
      flex={1}
      minH={0}
      w="full"
      position="relative"
      minW={0}
      pointerEvents="none"
      display={{ base: 'block', lg: 'none' }}
    >
      <Box
        position="absolute"
        top={`${SEARCH_CHROME_TOP_PX}px`}
        left={0}
        right={0}
        zIndex={4}
        pointerEvents="none"
        display="flex"
        justifyContent="center"
      >
        <Container maxW={PAGE_CONTAINER_MAX_W} px={PAGE_GUTTER_X} w="full">
          {/* Brand above the search bar on phones and tablets (FE-208). The box
              holds the height so the bar doesn't jump when the logo mounts;
              it sits outside the stack's map-control margin to stay centred. */}
          <Box
            h={`${SEARCH_LOGO_BAND_PX}px`}
            pb={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {/* Tapping the brand refreshes the results (it doesn't navigate).
                The chrome is click-through for the map; only the logo isn't. */}
            <Box pointerEvents="auto" display="inline-flex">
              <Logo
                h={`${SEARCH_LOGO_PX}px`}
                label={t.refreshLabel}
                onClick={retryTasks}
              />
            </Box>
          </Box>
          <Stack gap={2} flexShrink={0} mr={touchPhone ? 0 : 12}>
            <TaskSearch mode="trigger" />
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
        // Search chrome fills main's content box (above CLEARANCE). Keep the
        // strip inside that box — a negative bottom clips cards.
        bottom={0}
        zIndex={3}
        display="flex"
        flexDirection="column"
        gap={2}
        pointerEvents="auto"
        ref={trackBottomChrome}
      >
        <TaskBrowseSearchThisAreaButton />
        <MobileTaskCarousel />
      </Box>

      <MobileTaskSearchSheet listHeader={<SearchResultsListTitle />} />
    </Box>
  )
}
