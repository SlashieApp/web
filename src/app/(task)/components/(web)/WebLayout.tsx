'use client'

import { Badge, Box, HStack, Input, Stack } from '@chakra-ui/react'
import { Button, Text } from '@ui'

import { formatTaskCategoryLabel } from '@/utils/taskLocationDisplay'
import {
  useTaskBrowseData,
  useTaskBrowseFiltersProps,
  useTaskBrowseLayout,
  useTaskMapBindings,
} from '../../context/TaskBrowseProvider'
import { TaskBrowseFilters } from './TaskBrowseFilters'
import { TaskList } from './TaskList'
import { TaskMap } from './TaskMap'
import { SORT_OPTIONS } from './taskBrowseHelpers'

export function WebLayout() {
  const { isFilterOpen, setIsFilterOpen, windowOffsetWidth } =
    useTaskBrowseLayout()
  const mapBindings = useTaskMapBindings()
  const filterProps = useTaskBrowseFiltersProps('compact')
  const {
    sort,
    categories,
    selectedCategorySet,
    searchInput,
    setSearchInput,
    areaLocationInput,
    setAreaLocationInput,
    commitAreaLocationSearch,
    radiusMiles,
    minBudget,
    maxBudget,
    urgency,
    selectedTaskId,
    setSelectedTaskId,
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
    <Box w="full" h="full">
      <Box position="absolute" inset={0} zIndex={0}>
        <TaskMap
          {...mapBindings}
          leftViewportPadding={windowOffsetWidth}
          onSelectTask={(taskId) => {
            if (taskId) setIsFilterOpen(false)
            setSelectedTaskId(taskId)
          }}
        />
      </Box>

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
              <Box position="relative">
                <Box
                  position="absolute"
                  left={3}
                  top="50%"
                  transform="translateY(-50%)"
                  color="muted"
                  pointerEvents="none"
                  zIndex={1}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <title>Search</title>
                    <path
                      d="M11 19a8 8 0 1 1 5.3-14l5.1 5.1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="m20 20-3.3-3.3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </Box>
                <Input
                  value={areaLocationInput}
                  onChange={(e) => setAreaLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitAreaLocationSearch()
                  }}
                  type="search"
                  bg="surfaceContainerLowest"
                  onBlur={commitAreaLocationSearch}
                  placeholder="Find pros or jobs near you..."
                  borderRadius="xl"
                  h={11}
                  ps={10}
                />
              </Box>
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
        <Box flex={1} minH={0} mb={6}>
          {isFilterOpen ? (
            <Box h="full" overflowY="auto" pr={{ base: 1, md: 0 }}>
              <TaskBrowseFilters {...filterProps} />
            </Box>
          ) : (
            <TaskList />
          )}
        </Box>
      </Box>
    </Box>
  )
}
