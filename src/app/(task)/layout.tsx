'use client'

import { Badge, Box, HStack, IconButton, Stack } from '@chakra-ui/react'
import { MobileActionDock, Text } from '@ui'

import { MobileTaskCarousel } from './components/(mobile)/MobileTaskCarousel'
import { TaskBrowseFilters } from './components/(web)/TaskBrowseFilters/TaskBrowseFilters'
import { TaskList } from './components/(web)/TaskList'
import { TaskMap } from './components/(web)/TaskMap'
import { useTaskBrowseData } from './components/(web)/taskBrowseDataContext'
import {
  SORT_OPTIONS,
  formatBudget,
  inferBadge,
} from './components/(web)/taskBrowseHelpers'
import { useTaskBrowseLayout } from './components/(web)/taskBrowseLayoutContext'

const SINGLE_PANEL_BUTTON_LEFT_INSET = '1.25rem + min(420px, 38vw)'

export function WebLayout({ headerTitle }: { headerTitle: string }) {
  const { isFilterOpen, setIsFilterOpen, windowOffsetWidth } =
    useTaskBrowseLayout()
  const {
    sort,
    setSort,
    subtitle,
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
  } = useTaskBrowseData()

  const activeFilterTags: string[] = []
  if (searchInput.trim()) activeFilterTags.push(`Search: ${searchInput.trim()}`)
  if (areaLocationInput.trim())
    activeFilterTags.push(`Area: ${areaLocationInput.trim()}`)
  if (radiusMiles !== 10) activeFilterTags.push(`Radius: ${radiusMiles}mi`)
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
      ...[...selectedCategorySet].map((cat) => `Category: ${cat}`),
    )
  }
  if (sort !== 'nearest') {
    const sortLabel =
      SORT_OPTIONS.find((opt) => opt.value === sort)?.label ?? 'Custom'
    activeFilterTags.push(`Sort: ${sortLabel}`)
  }

  return (
    <Box position="relative" w="full" minH={{ base: '70dvh', md: '78dvh' }}>
      <Box position="absolute" inset={0} zIndex={0}>
        <TaskMap
          accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          centerLat={searchCenterLat}
          centerLng={searchCenterLng}
          radiusMiles={radiusMiles}
          tasks={effectiveMapTasksForBox}
          variant="fullscreen"
          visible
          tasksLoaded
          leftViewportPadding={windowOffsetWidth}
          onSearchThisAreaConfirm={confirmSearchThisAreaFromMap}
          searchAreaButtonLeftInset={SINGLE_PANEL_BUTTON_LEFT_INSET}
          onMapClick={() => setIsFilterOpen(false)}
          onReadyChange={markMapReadyForQuery}
          selectedTaskId={selectedTaskId}
          onSelectTask={(taskId) => {
            setIsFilterOpen(false)
            setSelectedTaskId(taskId)
          }}
        />
      </Box>

      <Box
        position="absolute"
        zIndex={2}
        top={{ base: 74, md: 20 }}
        left={{ base: 3, md: 5 }}
        bottom={{ base: 3, md: 5 }}
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
          <Box
            bg="surfaceContainerLowest/92"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border"
            boxShadow="0 6px 20px rgba(15,23,42,0.16)"
            px={2}
            py={1.5}
            w="full"
          >
            <Stack gap={2}>
              <HStack justify="space-between" align="flex-start" gap={3}>
                <Box>
                  <Text
                    fontWeight={700}
                    fontSize={{ base: 'xl', md: '2xl' }}
                    lineHeight="1.1"
                  >
                    {headerTitle}
                  </Text>
                  <Text fontSize="sm" color="muted">
                    {subtitle}
                  </Text>
                </Box>
                <IconButton
                  aria-label={isFilterOpen ? 'Show results' : 'Open filters'}
                  size="sm"
                  variant={isFilterOpen ? 'solid' : 'subtle'}
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
              </HStack>
              {activeFilterTags.length > 0 ? (
                <HStack gap={1.5} flexWrap="wrap">
                  {activeFilterTags.map((tag) => (
                    <Badge key={tag} borderRadius="full" px={2} py={0.5}>
                      {tag}
                    </Badge>
                  ))}
                </HStack>
              ) : null}
            </Stack>
          </Box>
        </Box>
        <Box flex={1} minH={0}>
          {isFilterOpen ? (
            <Box h="full" overflowY="auto" pr={{ base: 1, md: 0 }}>
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
            <TaskList
              variant="classic"
              headerTitle={headerTitle}
              subtitle={subtitle}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}

export function MobileLayout({ headerTitle }: { headerTitle: string }) {
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
    <Box
      position="relative"
      w="full"
      h="78dvh"
      borderRadius="2xl"
      overflow="hidden"
    >
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
        <Box position="absolute" left={0} right={0} bottom={24} zIndex={4}>
          <Text mb={2} fontWeight={700} color="white">
            {headerTitle}
          </Text>
          <MobileTaskCarousel
            tasks={mobileCards}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
          />
        </Box>
      )}

      <MobileActionDock />
    </Box>
  )
}

export default function TaskSegmentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>
}
