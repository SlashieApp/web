'use client'

import { Box, IconButton } from '@chakra-ui/react'
import { Text } from '@ui'

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
    }
  })

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
        searchAreaButtonPosition="top"
        searchAreaButtonOffsetX="-40px"
        onMapClick={() => setIsFilterOpen(false)}
        onReadyChange={markMapReadyForQuery}
        selectedTaskId={selectedTaskId}
        onSelectTask={setSelectedTaskId}
      />

      <Box position="absolute" top={3} right={3} zIndex={4}>
        <IconButton
          aria-label={isFilterOpen ? 'Show tasks' : 'Open filters'}
          size="sm"
          variant={isFilterOpen ? 'solid' : 'surface'}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <title>Filters</title>
            <path
              d="M4 7H20M7 12H17M10 17H14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </IconButton>
      </Box>

      {isFilterOpen ? (
        <Box
          position="absolute"
          left={3}
          right={3}
          top={14}
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
        <Box position="absolute" left={0} right={0} bottom={0} zIndex={4}>
          <Text mb={2} px={3} fontWeight={700} color="block">
            Find work near you
          </Text>
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
