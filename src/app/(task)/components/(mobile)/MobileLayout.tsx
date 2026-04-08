'use client'

import { Box, HStack, IconButton, Input } from '@chakra-ui/react'
import { Button } from '@ui'

import { TaskBrowseFilters } from '../(web)/TaskBrowseFilters'
import { TaskMap } from '../(web)/TaskMap'
import {
  SORT_OPTIONS,
  formatBudget,
  inferBadge,
} from '../(web)/taskBrowseHelpers'
import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../../context/TaskBrowseProvider'
import { MobileTaskCarousel } from './MobileTaskCarousel'

export function MobileLayout() {
  const { isFilterOpen, setIsFilterOpen } = useTaskBrowseLayout()
  const {
    sort,
    setSort,
    categories,
    selectedCategorySet,
    toggleCategory,
    searchInput,
    setSearchInput,
    areaLocationInput,
    setAreaLocationInput,
    commitAreaLocationSearch,
    radiusMiles,
    setRadiusMiles,
    minBudget,
    setMinBudget,
    maxBudget,
    setMaxBudget,
    urgency,
    setUrgency,
    searchCenterLat,
    searchCenterLng,
    effectiveMapTasksForBox,
    confirmSearchThisAreaFromMap,
    markMapReadyForQuery,
    selectedTaskId,
    setSelectedTaskId,
    pageItems,
  } = useTaskBrowseData()

  const mobileCards = pageItems.map((task) => {
    const { main } = formatBudget(task)
    const badge = inferBadge(task)
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      location: task.location?.trim() || 'Location on request',
      priceLabel: main,
      badgeText: badge.text,
      imageSeed: task.id,
    }
  })

  const activeFilterTags: string[] = []
  if (areaLocationInput.trim()) activeFilterTags.push(areaLocationInput.trim())
  if (
    selectedCategorySet.size > 0 &&
    selectedCategorySet.size < categories.length
  ) {
    activeFilterTags.push(...[...selectedCategorySet].slice(0, 3))
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
    <Box w="full" h="full" borderRadius="2xl" overflow="hidden">
      <TaskMap
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        centerLat={searchCenterLat}
        centerLng={searchCenterLng}
        radiusMiles={radiusMiles}
        tasks={effectiveMapTasksForBox}
        variant="fullscreen"
        visible
        tasksLoaded
        leftViewportPadding={0}
        onSearchThisAreaConfirm={confirmSearchThisAreaFromMap}
        searchAreaButtonPosition="bottom"
        onMapClick={() => setIsFilterOpen(false)}
        onReadyChange={markMapReadyForQuery}
        selectedTaskId={selectedTaskId}
        onSelectTask={setSelectedTaskId}
      />

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
          <TaskBrowseFilters
            categories={categories}
            selectedCategories={selectedCategorySet}
            onToggleCategory={toggleCategory}
            searchQuery={searchInput}
            onSearchChange={setSearchInput}
            areaLocationInput={areaLocationInput}
            onAreaLocationChange={setAreaLocationInput}
            onAreaLocationCommit={commitAreaLocationSearch}
            radiusMiles={radiusMiles}
            onRadiusChange={setRadiusMiles}
            minBudgetPounds={minBudget}
            maxBudgetPounds={maxBudget}
            onMinBudgetChange={setMinBudget}
            onMaxBudgetChange={setMaxBudget}
            urgency={urgency}
            onUrgencyChange={setUrgency}
            sortValue={sort}
            sortOptions={SORT_OPTIONS}
            onSortChange={setSort}
            showMapPromo={false}
            variant="compact"
          />
        </Box>
      ) : (
        <Box position="absolute" left={0} right={0} bottom={0} zIndex={3}>
          <MobileTaskCarousel
            tasks={mobileCards}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
          />
        </Box>
      )}
    </Box>
  )
}
