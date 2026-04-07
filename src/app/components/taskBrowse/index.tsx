'use client'

import { useQuery } from '@apollo/client/react'
import { Box, Grid, Stack, useBreakpointValue } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { TASKS_QUERY } from '@/graphql/tasks'
import type { TaskListItem, TasksQueryData } from '@/graphql/tasks-query.types'
import {
  mapboxForwardGeocode,
  mapboxReverseGeocode,
} from '@/utils/mapboxGeocode'
import {
  TASK_BROWSE_FILTER_CATEGORIES,
  TaskBrowseProvider,
  useTaskBrowseStore,
} from '@context/taskBrowse'
import {
  AppDrawer,
  AvailableJobsHeader,
  MAP_HERO_SEARCH_AREA_BUTTON_LEFT_INSET,
  TaskBrowseMapHeroBackdrop,
  TaskBrowseMapHeroDesktopSplit,
  TaskBrowseMapHeroFiltersIconButton,
  TaskBrowseMapHeroMobileColumn,
  TaskBrowseMapHeroSideRail,
  Text,
  ViewSwitch,
} from '@ui'
import { TaskBrowseFilters } from './TaskBrowseFilters/TaskBrowseFilters'
import type { UrgencyFilter } from './TaskBrowseFilters/TaskBrowseFilters'
import { TaskList } from './TaskList'
import { TaskMap } from './TaskMap'
import {
  PAGE_SIZE,
  SORT_OPTIONS,
  endOfLocalDay,
  formatBudget,
  matchesUrgency,
  startOfLocalDay,
  taskCreatedTime,
} from './taskBrowseHelpers'

export type TaskBrowseProps = {
  /**
   * `mapHero` — full-viewport map with a floating list panel (homepage default).
   * `classic` — filters + list in a grid, map panel below (no full bleed).
   */
  layout?: 'mapHero' | 'classic'
  headerTitle?: string
  headerSubtitle?: string
  initialTasks?: TaskListItem[]
}

function TaskBrowseInner({
  layout = 'mapHero',
  headerTitle = 'Find work near you',
  headerSubtitle,
  initialTasks = [],
}: TaskBrowseProps = {}) {
  const sort = useTaskBrowseStore((s) => s.sort)
  const setSort = useTaskBrowseStore((s) => s.setSort)
  const page = useTaskBrowseStore((s) => s.page)
  const setPage = useTaskBrowseStore((s) => s.setPage)
  const selectedCategories = useTaskBrowseStore((s) => s.selectedCategories)
  const toggleCategory = useTaskBrowseStore((s) => s.toggleCategory)
  const radiusMiles = useTaskBrowseStore((s) => s.radiusMiles)
  const setRadiusMiles = useTaskBrowseStore((s) => s.setRadiusMiles)
  const minBudget = useTaskBrowseStore((s) => s.minBudget)
  const setMinBudget = useTaskBrowseStore((s) => s.setMinBudget)
  const maxBudget = useTaskBrowseStore((s) => s.maxBudget)
  const setMaxBudget = useTaskBrowseStore((s) => s.setMaxBudget)
  const urgency = useTaskBrowseStore((s) => s.urgency)
  const setUrgency = useTaskBrowseStore((s) => s.setUrgency)
  const searchInput = useTaskBrowseStore((s) => s.searchInput)
  const setSearchInput = useTaskBrowseStore((s) => s.setSearchInput)
  const setDebouncedSearch = useTaskBrowseStore((s) => s.setDebouncedSearch)
  const selectedTaskId = useTaskBrowseStore((s) => s.selectedTaskId)
  const setSelectedTaskId = useTaskBrowseStore((s) => s.setSelectedTaskId)
  const filtersOpen = useTaskBrowseStore((s) => s.filtersOpen)
  const setFiltersOpen = useTaskBrowseStore((s) => s.setFiltersOpen)
  const mobileView = useTaskBrowseStore((s) => s.mobileView)
  const setMobileView = useTaskBrowseStore((s) => s.setMobileView)
  const searchCenterLat = useTaskBrowseStore((s) => s.searchCenterLat)
  const searchCenterLng = useTaskBrowseStore((s) => s.searchCenterLng)
  const setSearchCenter = useTaskBrowseStore((s) => s.setSearchCenter)
  const areaLocationInput = useTaskBrowseStore((s) => s.areaLocationInput)
  const setAreaLocationInput = useTaskBrowseStore((s) => s.setAreaLocationInput)

  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const prevSelectedTaskIdRef = useRef<string | null>(null)

  const isDesktopSplit =
    useBreakpointValue({ base: false, md: true }, { fallback: 'base' }) ?? false

  useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      300,
    )
    return () => window.clearTimeout(t)
  }, [searchInput, setDebouncedSearch])

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const confirmSearchThisAreaFromMap = useCallback(
    (lat: number, lng: number) => {
      setSearchCenter(lat, lng)
      const token = mapboxToken?.trim()
      if (token) {
        void mapboxReverseGeocode(lat, lng, token).then((name) => {
          if (name) setAreaLocationInput(name)
        })
      }
    },
    [mapboxToken, setSearchCenter, setAreaLocationInput],
  )

  const commitAreaLocationSearch = useCallback(() => {
    const q = areaLocationInput.trim()
    const token = mapboxToken?.trim()
    if (q.length < 2 || !token) return
    void mapboxForwardGeocode(q, token).then((hit) => {
      if (hit) {
        setSearchCenter(hit.lat, hit.lng)
        setAreaLocationInput(hit.placeName)
      }
    })
  }, [areaLocationInput, mapboxToken, setSearchCenter, setAreaLocationInput])

  useEffect(() => {
    const q = areaLocationInput.trim()
    const token = mapboxToken?.trim()
    if (q.length < 3 || !token) return
    const t = window.setTimeout(() => {
      void mapboxForwardGeocode(q, token).then((hit) => {
        if (hit) setSearchCenter(hit.lat, hit.lng)
      })
    }, 650)
    return () => window.clearTimeout(t)
  }, [areaLocationInput, mapboxToken, setSearchCenter])

  const {
    debouncedSearch,
    minBudget: minB,
    maxBudget: maxB,
  } = useTaskBrowseStore(
    useShallow((s) => ({
      debouncedSearch: s.debouncedSearch,
      minBudget: s.minBudget,
      maxBudget: s.maxBudget,
    })),
  )

  const queryVariables = useMemo(() => {
    const minStr = minB.trim()
    const maxStr = maxB.trim()
    const minP = minStr === '' ? undefined : Number.parseFloat(minStr) * 100
    const maxP = maxStr === '' ? undefined : Number.parseFloat(maxStr) * 100
    const radius = Math.min(500, Math.max(1, radiusMiles))
    const singleCategory =
      selectedCategories.length === 1 ? selectedCategories[0] : undefined

    let dateTimeFrom: string | undefined
    let dateTimeTo: string | undefined
    if (urgency === 'today') {
      dateTimeFrom = startOfLocalDay().toISOString()
      dateTimeTo = endOfLocalDay().toISOString()
    } else if (urgency === 'week') {
      const start = startOfLocalDay()
      start.setDate(start.getDate() - 6)
      dateTimeFrom = start.toISOString()
      dateTimeTo = endOfLocalDay().toISOString()
    }

    return {
      lat: searchCenterLat,
      lng: searchCenterLng,
      radiusMiles: radius,
      search: debouncedSearch || undefined,
      category: singleCategory,
      minPricePence:
        minP != null && Number.isFinite(minP) ? Math.round(minP) : undefined,
      maxPricePence:
        maxP != null && Number.isFinite(maxP) ? Math.round(maxP) : undefined,
      dateTimeFrom,
      dateTimeTo,
    }
  }, [
    debouncedSearch,
    minB,
    maxB,
    radiusMiles,
    searchCenterLat,
    searchCenterLng,
    selectedCategories,
    urgency,
  ])

  const { data, loading, error } = useQuery<TasksQueryData>(TASKS_QUERY, {
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
  })

  const selectedCategorySet = useMemo(
    () => new Set<string>(selectedCategories),
    [selectedCategories],
  )

  const filteredSorted = useMemo(() => {
    const items = data?.tasks ?? initialTasks

    let next = items.filter((task) => {
      if (selectedCategories.length > 0) {
        const cat = (task.category ?? '').trim()
        if (cat && !selectedCategorySet.has(cat)) return false
      }
      if (urgency === 'emergency' && !matchesUrgency(task, urgency)) {
        return false
      }
      return true
    })

    if (sort === 'newest' || sort === 'oldest') {
      next = [...next].sort((a, b) => {
        const ta = taskCreatedTime(a)
        const tb = taskCreatedTime(b)
        return sort === 'oldest' ? ta - tb : tb - ta
      })
    }
    return next
  }, [
    data,
    initialTasks,
    selectedCategorySet,
    selectedCategories,
    urgency,
    sort,
  ])

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE))

  useEffect(() => {
    setPage((p: number) => Math.min(p, Math.max(0, totalPages - 1)))
  }, [totalPages, setPage])

  const safePage = Math.min(page, totalPages - 1)
  const sliceStart = safePage * PAGE_SIZE
  const pageItems = filteredSorted.slice(sliceStart, sliceStart + PAGE_SIZE)

  useEffect(() => {
    if (!selectedTaskId) {
      prevSelectedTaskIdRef.current = null
      return
    }
    if (!filteredSorted.some((t) => t.id === selectedTaskId)) {
      setSelectedTaskId(null)
      prevSelectedTaskIdRef.current = null
      return
    }
  }, [filteredSorted, selectedTaskId, setSelectedTaskId])

  useEffect(() => {
    if (selectedTaskId === prevSelectedTaskIdRef.current) return
    prevSelectedTaskIdRef.current = selectedTaskId
    if (!selectedTaskId) return
    const idx = filteredSorted.findIndex((t) => t.id === selectedTaskId)
    if (idx < 0) return
    setPage(Math.floor(idx / PAGE_SIZE))
  }, [selectedTaskId, filteredSorted, setPage])

  useEffect(() => {
    if (!selectedTaskId) return
    if (!pageItems.some((t) => t.id === selectedTaskId)) return
    const el = cardRefs.current.get(selectedTaskId)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedTaskId, pageItems])

  const subtitle =
    headerSubtitle ??
    `Browse ${filteredSorted.length} open tasks. Details are read-only until you sign in to quote.`

  const filterBlock = (
    <TaskBrowseFilters
      categories={TASK_BROWSE_FILTER_CATEGORIES}
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
      showMapPromo={false}
    />
  )

  const mapTasksForBox = useMemo(
    () =>
      filteredSorted.map((task) => {
        const { main, sub } = formatBudget(task)
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          category: task.category,
          location: task.location,
          locationLat: task.locationLat,
          locationLng: task.locationLng,
          priceLabel: main,
          detailLine: `${main} · ${sub}`,
        }
      }),
    [filteredSorted],
  )

  const initialMapTasksForBox = useMemo(
    () =>
      initialTasks.map((task) => {
        const { main, sub } = formatBudget(task)
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          category: task.category,
          location: task.location,
          locationLat: task.locationLat,
          locationLng: task.locationLng,
          priceLabel: main,
          detailLine: `${main} · ${sub}`,
        }
      }),
    [initialTasks],
  )

  const effectiveMapTasksForBox =
    data?.tasks != null ? mapTasksForBox : initialMapTasksForBox

  const taskListSharedProps = {
    headerTitle,
    subtitle,
    sortValue: sort,
    sortOptions: SORT_OPTIONS,
    onSortChange: setSort,
    loading,
    hasQueryData: Boolean(data),
    error,
    pageItems,
    filteredSorted,
    safePage,
    totalPages,
    setPage,
    selectedTaskId,
    onSelectTask: setSelectedTaskId,
    cardRefs,
  }

  if (layout === 'mapHero') {
    const taskListColumnContent = (
      <TaskList variant="mapHeroColumn" {...taskListSharedProps} />
    )

    return (
      <>
        {!isDesktopSplit ? (
          <AppDrawer
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            title="Filters"
            description="Refine tasks by search, area, budget, and urgency."
            placement="bottom"
            size="md"
            primaryActionLabel="Apply"
          >
            {filterBlock}
          </AppDrawer>
        ) : null}

        <Box position="relative" w="full" minH="100dvh">
          <Box
            position="absolute"
            inset={0}
            display={
              isDesktopSplit ? 'block' : mobileView === 'map' ? 'block' : 'none'
            }
            zIndex={0}
          >
            <TaskMap
              accessToken={mapboxToken}
              centerLat={searchCenterLat}
              centerLng={searchCenterLng}
              radiusMiles={queryVariables.radiusMiles}
              tasks={effectiveMapTasksForBox}
              variant="fullscreen"
              visible={isDesktopSplit || mobileView === 'map'}
              tasksLoaded={Boolean(data) || initialTasks.length > 0}
              leftViewportPadding={isDesktopSplit ? 900 : 80}
              onSearchThisAreaConfirm={confirmSearchThisAreaFromMap}
              searchAreaButtonLeftInset={
                isDesktopSplit
                  ? MAP_HERO_SEARCH_AREA_BUTTON_LEFT_INSET
                  : undefined
              }
            />
          </Box>

          <TaskBrowseMapHeroBackdrop
            display={
              isDesktopSplit
                ? 'block'
                : mobileView === 'list'
                  ? 'block'
                  : 'none'
            }
          />

          <TaskBrowseMapHeroSideRail
            panelDisplay={
              isDesktopSplit ? 'flex' : mobileView === 'list' ? 'flex' : 'none'
            }
          >
            <TaskBrowseMapHeroDesktopSplit
              filters={filterBlock}
              taskList={taskListColumnContent}
            />
            <TaskBrowseMapHeroMobileColumn
              onOpenFilters={() => setFiltersOpen(true)}
              taskList={taskListColumnContent}
            />
          </TaskBrowseMapHeroSideRail>

          {!isDesktopSplit ? (
            <TaskBrowseMapHeroFiltersIconButton
              onOpenFilters={() => setFiltersOpen(true)}
            />
          ) : null}

          {!isDesktopSplit ? (
            <ViewSwitch value={mobileView} onChange={setMobileView} />
          ) : null}
        </Box>
      </>
    )
  }

  return (
    <Stack gap={{ base: 8, md: 10 }}>
      <AvailableJobsHeader
        title={headerTitle}
        subtitle={subtitle}
        sortValue={sort}
        sortOptions={SORT_OPTIONS}
        onSortChange={setSort}
      />

      <Grid
        templateColumns={{ base: '1fr', lg: 'minmax(260px,320px) 1fr' }}
        gap={{ base: 8, lg: 10 }}
        alignItems="start"
      >
        <Box position={{ lg: 'sticky' }} top={{ lg: 6 }}>
          {filterBlock}
        </Box>
        <TaskList variant="classic" {...taskListSharedProps} />
      </Grid>

      <TaskMap
        accessToken={mapboxToken}
        centerLat={searchCenterLat}
        centerLng={searchCenterLng}
        radiusMiles={queryVariables.radiusMiles}
        tasks={effectiveMapTasksForBox}
        variant="panel"
        tasksLoaded={Boolean(data) || initialTasks.length > 0}
        onSearchThisAreaConfirm={confirmSearchThisAreaFromMap}
      />
    </Stack>
  )
}

export function TaskBrowse(props: TaskBrowseProps = {}) {
  return (
    <TaskBrowseProvider>
      <TaskBrowseInner {...props} />
    </TaskBrowseProvider>
  )
}

export {
  TaskBrowseFilters,
  type TaskBrowseFiltersProps,
  type UrgencyFilter,
} from './TaskBrowseFilters/TaskBrowseFilters'
export {
  TaskLocationMapPicker,
  type TaskLocationMapPickerProps,
} from './TaskLocationMapPicker'
export { TaskList, type TaskListProps } from './TaskList'
export { TaskMap, type TaskMapProps, type TaskMapTask } from './TaskMap'
