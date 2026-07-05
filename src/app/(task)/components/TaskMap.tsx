'use client'

import { Box, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

import { useColorMode } from '@/ui/color-mode'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
  useTaskMapBindings,
} from '../context/TaskBrowseProvider'
import {
  MAX_SEARCH_RADIUS_MILES,
  type TaskMapController,
  type TaskMapPropsSnapshot,
  type TaskMapTask,
  createTaskMapController,
  tasksMarkerSig,
} from '../helpers/taskMap'

import type { SearchThisAreaButtonProps } from './SearchThisAreaButton'

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

/**
 * React shell around the imperative task-map controller. The component's only
 * jobs: (1) keep the latest props snapshot readable via a ref, (2) create /
 * destroy the controller with the container, (3) schedule a controller sync
 * from an effect whenever a sync-relevant prop actually changes. No syncing
 * happens during render — the previous render-phase microtasks were the source
 * of missed/duplicated first syncs on page load.
 */
export function TaskMap(props: TaskMapProps) {
  const { colorMode } = useColorMode()
  const effectiveSearchRadiusMiles = Math.max(
    0,
    Math.min(props.radiusMiles, MAX_SEARCH_RADIUS_MILES),
  )

  const snapshot: TaskMapPropsSnapshot = {
    ...props,
    effectiveSearchRadiusMiles,
    themeMode: colorMode === 'dark' ? 'dark' : 'light',
  }

  const propsRef = useRef<TaskMapPropsSnapshot>(snapshot)
  const controllerRef = useRef<TaskMapController | null>(null)

  // Commit the snapshot before the sync effect below reads it.
  useLayoutEffect(() => {
    propsRef.current = snapshot
  })

  const accessToken = props.accessToken?.trim() || null

  const mapContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      controllerRef.current?.destroy()
      controllerRef.current = null
      if (!node || !accessToken) return

      controllerRef.current = createTaskMapController({
        container: node,
        accessToken,
        getProps: () => propsRef.current,
      })
    },
    [accessToken],
  )

  // Everything the controller pipeline keys on. Content is included via
  // tasksMarkerSig so pin label changes (not just coordinates) re-sync.
  const syncDriver = [
    accessToken ?? '',
    props.centerLat,
    props.centerLng,
    effectiveSearchRadiusMiles,
    snapshot.themeMode,
    props.visible ?? true,
    props.tasksLoaded ?? true,
    props.leftViewportPadding ?? '',
    props.selectedTaskId ?? '',
    props.selectedTaskSelectionToken ?? 0,
    props.searchAreaButtonLeftInset ?? '',
    props.searchAreaButtonPosition ?? '',
    props.searchAreaButtonOffsetX ?? '',
    Boolean(props.onSearchThisAreaConfirm),
    tasksMarkerSig(props.tasks),
  ].join('\x1e')

  useEffect(() => {
    // `syncDriver` changing IS the signal — the controller reads fresh values
    // from the props ref, so the string itself is only a change detector.
    void syncDriver
    controllerRef.current?.scheduleSync()
  }, [syncDriver])

  if (!accessToken) {
    return (
      <Box
        position="absolute"
        inset={0}
        h="full"
        bg="bg.surface"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={6}
        zIndex={0}
      >
        <Text color="text.muted" fontSize="sm" textAlign="center">
          Set{' '}
          <Text as="span" fontWeight={700} color="text.default">
            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          </Text>{' '}
          in your environment to load the map.
        </Text>
      </Box>
    )
  }

  return (
    <Box position="absolute" inset={0} h="full" overflow="hidden" zIndex={0}>
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
