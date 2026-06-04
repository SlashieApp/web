'use client'

import { Box, Text } from '@chakra-ui/react'
import { useCallback, useRef, useState } from 'react'

import { useColorMode } from '@/ui/color-mode'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
  useTaskMapBindings,
} from '../context/TaskBrowseProvider'
import {
  MAX_SEARCH_RADIUS_MILES,
  type TaskMapPropsSnapshot,
  type TaskMapTask,
  createTaskMapController,
  taskLngLat,
} from '../helpers/taskMap'

import type { SearchThisAreaButtonProps } from './SearchThisAreaButton'

import 'mapbox-gl/dist/mapbox-gl.css'

export type { TaskMapTask } from '../helpers/taskMap'

export type TaskMapProps = {
  accessToken: string | undefined
  centerLat: number
  centerLng: number
  radiusMiles: number
  tasks: TaskMapTask[]
  /**
   * When false, the map may be `display:none` (e.g. mobile list tab). Toggle to
   * true so Mapbox can `resize()` after becoming visible.
   */
  visible?: boolean
  /** Wait for data before placing markers / centering on search (avoids empty-first sync). */
  tasksLoaded?: boolean
  /** Extra left padding (px) when centering the map in fullscreen (floating list panel). */
  leftViewportPadding?: number
  /** Called when the user taps “Search this area” after panning the map. */
  onSearchThisAreaConfirm?: (lat: number, lng: number, zoom: number) => void
  /**
   * Horizontal inset of the left task list (margin + width). When set, the
   * button is centered in the map pane: `calc(50% + ${inset} / 2)`.
   */
  searchAreaButtonLeftInset?: string
  /** Position of the “Search this area” button overlay. */
  searchAreaButtonPosition?: 'top' | 'bottom'
  /** Horizontal offset applied from the centered button anchor. */
  searchAreaButtonOffsetX?: string
  /** Called when the base map surface is clicked. */
  onMapClick?: () => void
  /** Emits map style readiness state for parent loading orchestration. */
  onReadyChange?: (ready: boolean) => void
  selectedTaskId?: string | null
  selectedTaskSelectionToken?: number
  onSelectTask?: (taskId: string | null) => void
  onSearchThisAreaUiChange?: (ui: SearchThisAreaButtonProps) => void
  onNavRoutePresentingChange?: (presenting: boolean) => void
}

export function TaskMap({
  accessToken,
  centerLat,
  centerLng,
  radiusMiles,
  tasks,
  visible = true,
  tasksLoaded = true,
  leftViewportPadding = 48,
  onSearchThisAreaConfirm,
  searchAreaButtonLeftInset,
  searchAreaButtonPosition = 'bottom',
  searchAreaButtonOffsetX = '0px',
  onMapClick,
  onReadyChange,
  selectedTaskId = null,
  selectedTaskSelectionToken = 0,
  onSelectTask,
  onSearchThisAreaUiChange,
  onNavRoutePresentingChange,
}: TaskMapProps) {
  const { colorMode } = useColorMode()
  const effectiveSearchRadiusMiles = Math.max(
    0,
    Math.min(radiusMiles, MAX_SEARCH_RADIUS_MILES),
  )

  const [showSearchThisArea, setShowSearchThisAreaState] = useState(false)
  const controllerRef = useRef<ReturnType<
    typeof createTaskMapController
  > | null>(null)
  const setShowSearchThisArea = useCallback((visible: boolean) => {
    setShowSearchThisAreaState(visible)
    queueMicrotask(() => controllerRef.current?.scheduleSync())
  }, [])

  const propsRef = useRef<TaskMapPropsSnapshot>({
    accessToken,
    centerLat,
    centerLng,
    radiusMiles,
    tasks,
    visible,
    tasksLoaded,
    leftViewportPadding,
    onSearchThisAreaConfirm,
    searchAreaButtonLeftInset,
    searchAreaButtonPosition,
    searchAreaButtonOffsetX,
    onMapClick,
    onReadyChange,
    selectedTaskId,
    selectedTaskSelectionToken,
    onSelectTask,
    onSearchThisAreaUiChange,
    effectiveSearchRadiusMiles,
    themeMode: colorMode,
  })

  propsRef.current = {
    accessToken,
    centerLat,
    centerLng,
    radiusMiles,
    tasks,
    visible,
    tasksLoaded,
    leftViewportPadding,
    onSearchThisAreaConfirm,
    searchAreaButtonLeftInset,
    searchAreaButtonPosition,
    searchAreaButtonOffsetX,
    onMapClick,
    onReadyChange,
    selectedTaskId,
    selectedTaskSelectionToken,
    onSelectTask,
    onSearchThisAreaUiChange,
    effectiveSearchRadiusMiles,
    themeMode: colorMode,
  }

  const selectTaskRef = useRef(onSelectTask)
  selectTaskRef.current = onSelectTask
  const selectedTaskIdRef = useRef(selectedTaskId)
  selectedTaskIdRef.current = selectedTaskId
  const isNavRoutePresentingRef = useRef(false)
  const onNavRoutePresentingChangeRef = useRef(onNavRoutePresentingChange)
  onNavRoutePresentingChangeRef.current = onNavRoutePresentingChange

  const notifyNavRoutePresentingChangeRef = useRef((presenting: boolean) => {
    isNavRoutePresentingRef.current = presenting
    onNavRoutePresentingChangeRef.current?.(presenting)
  })
  notifyNavRoutePresentingChangeRef.current = (presenting: boolean) => {
    isNavRoutePresentingRef.current = presenting
    onNavRoutePresentingChangeRef.current?.(presenting)
  }

  const syncDriverRef = useRef<string | null>(null)
  const showSearchRef = useRef(false)
  showSearchRef.current = showSearchThisArea

  const mapContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      controllerRef.current?.destroy()
      controllerRef.current = null

      if (!node) {
        syncDriverRef.current = null
        return
      }

      const token = accessToken?.trim()
      if (!token) return

      controllerRef.current = createTaskMapController({
        container: node,
        accessToken: token,
        getProps: () => propsRef.current,
        getSelectTask: () => selectTaskRef.current,
        getSelectedTaskId: () => selectedTaskIdRef.current ?? null,
        getIsNavRoutePresenting: () => isNavRoutePresentingRef.current,
        onNavRoutePresentingChange: (presenting) => {
          notifyNavRoutePresentingChangeRef.current(presenting)
        },
        setShowSearchThisArea,
        getShowSearchThisArea: () => showSearchRef.current,
      })
      controllerRef.current.scheduleSync()
    },
    [accessToken, setShowSearchThisArea],
  )

  const tasksSig = tasks
    .map((t) => {
      const ll = taskLngLat(t)
      return ll ? `${t.id}:${ll.lat},${ll.lng}` : `${t.id}:`
    })
    .join('|')

  const syncDriver = [
    accessToken ?? '',
    centerLat,
    centerLng,
    radiusMiles,
    colorMode,
    visible,
    tasksLoaded,
    leftViewportPadding ?? '',
    selectedTaskId ?? '',
    selectedTaskSelectionToken,
    effectiveSearchRadiusMiles,
    searchAreaButtonLeftInset ?? '',
    searchAreaButtonPosition ?? '',
    searchAreaButtonOffsetX ?? '',
    tasksSig,
    Boolean(onSearchThisAreaConfirm),
  ].join('\x1e')

  if (controllerRef.current && syncDriverRef.current !== syncDriver) {
    syncDriverRef.current = syncDriver
    queueMicrotask(() => controllerRef.current?.scheduleSync())
  }

  if (!accessToken?.trim()) {
    return (
      <Box
        borderRadius="0"
        position="absolute"
        inset={0}
        top={0}
        h="full"
        bg="cardBg"
        boxShadow="none"
        borderWidth={0}
        borderColor="cardBorder"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={6}
        zIndex={0}
      >
        <Text color="formLabelMuted" fontSize="sm" textAlign="center">
          Set{' '}
          <Text as="span" fontWeight={700} color="cardFg">
            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          </Text>{' '}
          in your environment to load the map.
        </Text>
      </Box>
    )
  }

  return (
    <Box
      position="absolute"
      inset={0}
      top={0}
      h="full"
      overflow="hidden"
      borderRadius="0"
      boxShadow="none"
      borderWidth={0}
      borderColor="cardBorder"
      zIndex={0}
    >
      <Box
        ref={mapContainerRef}
        w="full"
        h="full"
        aria-label="Map of tasks near the search area"
      />
    </Box>
  )
}

const SINGLE_PANEL_BUTTON_LEFT_INSET = '1.25rem + min(420px, 38vw)'

export type TaskBrowseMapLayerProps = {
  /** When true, apply desktop map padding and search-area button inset. */
  isDesktop: boolean
}

/**
 * Single `TaskMap` instance for the task browse page so the map is not unmounted
 * when switching between web/mobile layouts on viewport resize.
 */
export function TaskBrowseMapLayer({ isDesktop }: TaskBrowseMapLayerProps) {
  const mapBindings = useTaskMapBindings()
  const { windowOffsetWidth, setIsFilterOpen } = useTaskBrowseLayout()
  const { setSelectedTaskId, onNavRoutePresentingChange } = useTaskBrowseData()

  return (
    <Box position="absolute" inset={0} zIndex={isDesktop ? 1 : 0}>
      <TaskMap
        {...mapBindings}
        leftViewportPadding={isDesktop ? windowOffsetWidth : undefined}
        searchAreaButtonLeftInset={
          isDesktop ? SINGLE_PANEL_BUTTON_LEFT_INSET : undefined
        }
        onNavRoutePresentingChange={onNavRoutePresentingChange}
        onSelectTask={(taskId) => {
          if (taskId) setIsFilterOpen(false)
          setSelectedTaskId(taskId)
        }}
      />
    </Box>
  )
}
