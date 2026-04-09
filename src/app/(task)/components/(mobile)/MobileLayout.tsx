'use client'

import {
  formatTaskCategoryLabel,
  taskPublicLocationLabel,
} from '@/utils/taskLocationDisplay'
import { Box, HStack, IconButton, Input } from '@chakra-ui/react'
import { Button } from '@ui'
import { SearchThisAreaButton } from '../(web)/SearchThisAreaButton'
import { TaskBrowseFilters } from '../(web)/TaskBrowseFilters'
import { TaskMap } from '../(web)/TaskMap'
import { formatBudget, inferBadge } from '../(web)/taskBrowseHelpers'
import {
  useTaskBrowseData,
  useTaskBrowseFiltersProps,
  useTaskBrowseLayout,
  useTaskMapBindings,
} from '../../context/TaskBrowseProvider'
import { MobileTaskCarousel } from './MobileTaskCarousel'

export function MobileLayout() {
  const { isFilterOpen, setIsFilterOpen, searchThisAreaUi } =
    useTaskBrowseLayout()
  const mapBindings = useTaskMapBindings()
  const filterProps = useTaskBrowseFiltersProps('compact')
  const {
    selectedCategorySet,
    areaLocationInput,
    setAreaLocationInput,
    commitAreaLocationSearch,
    radiusMiles,
    urgency,
    selectedTaskId,
    setSelectedTaskId,
    pageItems,
    categories,
  } = useTaskBrowseData()

  const mobileCards = pageItems.map((task) => {
    const { main } = formatBudget(task)
    const badge = inferBadge(task)
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      location: taskPublicLocationLabel(task).trim() || 'Location on request',
      priceLabel: main,
      badgeText: badge.text,
      imageSeed: task.id,
    }
  })

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
    <>
      <TaskMap {...mapBindings} />

      <Box
        position="absolute"
        top={3}
        left={3}
        right={3}
        zIndex={4}
        pointerEvents="none"
      >
        <Box mr={12}>
          <Input
            pointerEvents="auto"
            value={areaLocationInput}
            onChange={(e) => setAreaLocationInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitAreaLocationSearch()
            }}
            onBlur={commitAreaLocationSearch}
            placeholder="Find pros or jobs near you..."
            borderRadius="lg"
            bg="surfaceContainerLowest"
            ps={10}
            type="search"
            h={10}
          />
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

      {isFilterOpen ? (
        <Box
          position="absolute"
          left={3}
          right={3}
          top={28}
          bottom={3}
          zIndex={4}
          overflowY="auto"
        >
          <TaskBrowseFilters {...filterProps} />
        </Box>
      ) : (
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

          <MobileTaskCarousel
            tasks={mobileCards}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
          />
        </Box>
      )}
    </>
  )
}
