'use client'

import { Badge, Box, HStack, Stack } from '@chakra-ui/react'
import { Button, Text } from '@ui'

import { formatTaskCategoryLabel } from '@/utils/taskLocationDisplay'
import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../../context/TaskBrowseProvider'
import { SearchThisAreaButton } from '../SearchThisAreaButton'
import { TaskBrowseAreaLocationInput } from '../TaskBrowseAreaLocationInput'
import { SORT_OPTIONS } from '../taskBrowseHelpers'
import { WebTaskBrowseFiltersBlock } from './WebTaskBrowseFiltersBlock'

export function WebLayout() {
  const { isFilterOpen, setIsFilterOpen, searchThisAreaUi } =
    useTaskBrowseLayout()
  const {
    sort,
    categories,
    selectedCategorySet,
    searchInput,
    setSearchInput,
    radiusMiles,
    minBudget,
    maxBudget,
    urgency,
  } = useTaskBrowseData()

  const activeFilterTags: string[] = []
  if (searchInput.trim()) activeFilterTags.push(`Search: ${searchInput.trim()}`)

  activeFilterTags.push(`Radius: ${radiusMiles}mi`)
  if (minBudget.trim()) activeFilterTags.push(`Min £${minBudget.trim()}`)
  if (maxBudget.trim()) activeFilterTags.push(`Max £${maxBudget.trim()}`)
  if (urgency !== 'any') {
    activeFilterTags.push(
      urgency === 'emergency'
        ? 'Emergency'
        : urgency === 'today'
          ? 'Today'
          : 'This week',
    )
  }
  if (
    selectedCategorySet.size > 0 &&
    selectedCategorySet.size < categories.length
  ) {
    activeFilterTags.push(
      ...[...selectedCategorySet].map(
        (cat) => `Category: ${formatTaskCategoryLabel(cat)}`,
      ),
    )
  }
  if (sort !== 'nearest') {
    const sortLabel =
      SORT_OPTIONS.find((opt) => opt.value === sort)?.label ?? 'Custom'
    activeFilterTags.push(`Sort: ${sortLabel}`)
  }

  return (
    <Box flex={1} minH={0} w="full" position="relative">
      <Box
        position="absolute"
        zIndex={2}
        top={2}
        left={2}
        bottom={2}
        w={{ base: 'calc(100% - 24px)', md: 'min(420px, 38vw)' }}
        maxW="440px"
        display="flex"
        flexDirection="column"
        pointerEvents="auto"
      >
        <Box
          px={{ base: 1, md: 0 }}
          pb={2}
          display="flex"
          justifyContent="flex-start"
        >
          <Box borderRadius="xl" px={2} py={1.5} w="full">
            <Stack gap={2}>
              <TaskBrowseAreaLocationInput />
              <HStack gap={1.5} flexWrap="wrap">
                <Button
                  type="button"
                  size="sm"
                  variant={isFilterOpen ? 'solid' : 'subtle'}
                  borderRadius="full"
                  px={3}
                  py={1.5}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  Filters
                </Button>
                {activeFilterTags.map((tag) => (
                  <Badge
                    key={tag}
                    borderRadius="full"
                    px={3}
                    py={1.5}
                    bg="primary.600"
                    color="white"
                    fontWeight={600}
                    fontSize="xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </HStack>
            </Stack>
          </Box>
        </Box>
        <WebTaskBrowseFiltersBlock />
      </Box>

      <Box
        position="absolute"
        bottom={6}
        left={0}
        right={0}
        zIndex={3}
        display="flex"
        justifyContent="center"
        pointerEvents="none"
      >
        <Box pointerEvents="auto">
          <SearchThisAreaButton {...searchThisAreaUi} />
        </Box>
      </Box>
    </Box>
  )
}
