'use client'

import { formatTaskCategoryLabel } from '@/utils/taskLocationDisplay'
import { Box, HStack } from '@chakra-ui/react'
import { Button } from '@ui'
import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../../context/TaskBrowseProvider'
import { SearchThisAreaButton } from '../SearchThisAreaButton'
import { TaskBrowseAreaLocationInput } from '../TaskBrowseAreaLocationInput'
import { MobileTaskBrowseFiltersDrawer } from './MobileTaskBrowseFiltersDrawer'
import { MobileTaskCarousel } from './MobileTaskCarousel'

export function MobileLayout() {
  const { isFilterOpen, setIsFilterOpen, searchThisAreaUi } =
    useTaskBrowseLayout()
  const { selectedCategorySet, radiusMiles, urgency, categories } =
    useTaskBrowseData()

  const activeFilterTags: string[] = []
  if (
    selectedCategorySet.size > 0 &&
    selectedCategorySet.size < categories.length
  ) {
    activeFilterTags.push(
      ...[...selectedCategorySet]
        .slice(0, 3)
        .map((c) => formatTaskCategoryLabel(c)),
    )
  }
  if (urgency !== 'any') {
    activeFilterTags.push(
      urgency === 'emergency'
        ? 'Emergency'
        : urgency === 'today'
          ? 'Today'
          : 'This week',
    )
  }
  activeFilterTags.push(`${radiusMiles}mi`)

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
        top={3}
        left={3}
        right={3}
        zIndex={4}
        pointerEvents="none"
      >
        <Box mr={12}>
          <TaskBrowseAreaLocationInput />
          <HStack mt={2} gap={2} flexWrap="wrap">
            <Button
              type="button"
              size="sm"
              variant={isFilterOpen ? 'solid' : 'subtle'}
              borderRadius="full"
              px={2.5}
              py={1}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              pointerEvents="auto"
            >
              Filters
            </Button>
            {activeFilterTags.map((tag) => (
              <Box
                pointerEvents="auto"
                key={tag}
                px={2.5}
                py={1}
                borderRadius="full"
                bg="primary.600"
                color="white"
                fontSize="xs"
                fontWeight={700}
              >
                {tag}
              </Box>
            ))}
          </HStack>
        </Box>
      </Box>

      <Box
        position="absolute"
        left={0}
        right={0}
        bottom={20}
        zIndex={3}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <SearchThisAreaButton {...searchThisAreaUi} />

        <MobileTaskCarousel />
      </Box>

      <MobileTaskBrowseFiltersDrawer />
    </Box>
  )
}
