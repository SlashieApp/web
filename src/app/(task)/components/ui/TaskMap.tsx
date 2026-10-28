'use client'

import { Box, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'
import { useColorMode } from '@/ui/color-mode'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
  useTaskMapBindings,
} from '../../context/TaskBrowseProvider'
import {
  MAX_SEARCH_RADIUS_MILES,
  type TaskMapController,
  type TaskMapPropsSnapshot,
  type TaskMapStack,
  type TaskMapTask,
  createTaskMapController,
  tasksMarkerSig,
} from '../../helpers/taskMap'
import { COMPASS_CONTROL_CLASS } from '../../helpers/taskMap/compass'
import { useIsTouchMobileDevice } from '../../helpers/touchMobileDevice'
import { useSelectBrowseTaskFromMap } from '../../helpers/useSelectBrowseTaskFromMap'

import type { SearchThisAreaButtonProps } from './SearchThisAreaButton'

export type { TaskMapStack, TaskMapTask } from '../../helpers/taskMap'

export type TaskMapProps = {
  accessToken: string | undefined
  centerLat: number
  centerLng: number
  radiusMiles: number
  /**
   * How far the loaded results reach from the centre (miles); "Search this
   * area" only offers beyond it. Infinity once everything is loaded, null
   * while the first page loads. Without it, `radiusMiles` is the threshold.
   */
  searchCoverageMiles?: number | null
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
  /** Live camera centre after load and every move (create-task hand-off). */
  onCenterChange?: (lat: number, lng: number) => void
  selectedTaskId?: string | null
  selectedTaskSelectionToken?: number
  /** Bumps to fly back to the search centre even when it has not changed. */
  recenterToken?: number
  /**
   * A standalone pin was tapped or clicked (its task id), or the bare map
   * (null). The page decides what a pin does: on /search the first tap selects
   * the task and a tap on the selected one opens it.
   */
  onSelectTask?: (taskId: string | null) => void
  /** Opens (or, with null, closes) the list for a cluster that cannot split. */
  onOpenTaskStack?: (stack: TaskMapStack | null) => void
  onSearchThisAreaUiChange?: (ui: SearchThisAreaButtonProps) => void
  onNavRoutePresentingChange?: (presenting: boolean) => void
  /** Draw a driving route to the selected pin (off for approximate worker pins). */
  navRouteEnabled?: boolean
  /** Accessible label for the map container. */
  mapAriaLabel?: string
  /**
   * Mapbox wordmark corner. Search uses `bottom-right` so the logo sits on the
   * visible map (not under the list column). Defaults to Mapbox `bottom-left`.
   */
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /**
   * Mobile-only CSS length that lifts Mapbox logo/attribution above overlays
   * (bottom nav + task carousel). Applied below `lg`; desktop is unchanged.
   */
  mobileCtrlBottomOffset?: string
  /**
   * Touch phones only: extra CSS length below the header for the top-right
   * controls (compass), so they clear an overlay such as the search bar.
   */
  touchCtrlTopOffset?: string
  /**
   * Below `lg`, on mouse devices: CSS top for the top-right controls, e.g.
   * level with a floating search bar. Defaults to the canvas edge.
   */
  compactCtrlTopOffset?: string
  /**
   * Extra CSS length that moves the top-right controls down at every width,
   * clear of a bar that floats over the map (task detail's page header).
   */
  ctrlTopClearance?: string
  /**
   * Browse keeps the search-center camera + list offset. Detail frames the
   * selected task with `viewPadding` (top-right on desktop).
   */
  cameraMode?: 'browse' | 'detail'
  /** Mapbox padding used when `cameraMode` is `detail`. */
  viewPadding?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  /** Hide the You / search-center marker (direct task-detail loads). */
  showReferenceMarker?: boolean
  /**
   * `all` — every task pin (browse).
   * `solo` — only the selected task pin.
   * `none` — no price pins (approximate zone-only).
   */
  taskPinMode?: 'all' | 'solo' | 'none'
  /**
   * When false, ignore map-background clicks and the search-this-area prompt
   * (task-detail handoff). Defaults to true.
   */
  mapInteractions?: boolean
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
  const hideZoomControls = useIsTouchMobileDevice()
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
    // Search remounts inside a layout-persistent map: `load` already fired.
    controllerRef.current?.flushReady()
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
    String(props.searchCoverageMiles),
    snapshot.themeMode,
    props.visible ?? true,
    props.tasksLoaded ?? true,
    props.leftViewportPadding ?? '',
    props.selectedTaskId ?? '',
    props.selectedTaskSelectionToken ?? 0,
    props.recenterToken ?? 0,
    props.searchAreaButtonLeftInset ?? '',
    props.searchAreaButtonPosition ?? '',
    props.searchAreaButtonOffsetX ?? '',
    Boolean(props.onSearchThisAreaConfirm),
    props.navRouteEnabled ?? true,
    props.cameraMode ?? 'browse',
    props.taskPinMode ?? 'all',
    props.showReferenceMarker ?? true,
    props.mapInteractions ?? true,
    props.viewPadding
      ? `${props.viewPadding.top ?? 0},${props.viewPadding.right ?? 0},${props.viewPadding.bottom ?? 0},${props.viewPadding.left ?? 0}`
      : '',
    tasksMarkerSig(props.tasks),
  ].join('\x1e')

  useEffect(() => {
    // `syncDriver` changing IS the signal — the controller reads fresh values
    // from the props ref, so the string itself is only a change detector.
    void syncDriver
    controllerRef.current?.scheduleSync()
  }, [syncDriver])

  const ctrlTopBase =
    hideZoomControls && props.touchCtrlTopOffset
      ? {
          base: props.touchCtrlTopOffset,
          lg: `calc(${HEADER_MIN_HEIGHT.md} + ${props.touchCtrlTopOffset})`,
        }
      : {
          base: props.compactCtrlTopOffset ?? '0px',
          lg: HEADER_MIN_HEIGHT.md,
        }
  const ctrlTop = props.ctrlTopClearance
    ? {
        base: `calc(${ctrlTopBase.base} + ${props.ctrlTopClearance})`,
        lg: `calc(${ctrlTopBase.lg} + ${props.ctrlTopClearance})`,
      }
    : ctrlTopBase

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
          <Text as="span" fontWeight={500} color="text.default">
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
      h="full"
      overflow="hidden"
      zIndex={0}
      css={{
        // The canvas fills the window, including under the app header (lg+;
        // there is no mobile header). Keep the controls below that header
        // and any touch overlay.
        '& .mapboxgl-ctrl-top-right': {
          top: ctrlTop,
        },
        // Touch phones pinch to zoom: hide the zoom buttons, keep the compass.
        ...(hideZoomControls
          ? {
              [`& .mapboxgl-ctrl-top-right .mapboxgl-ctrl-group:not(.${COMPASS_CONTROL_CLASS})`]:
                { display: 'none' },
            }
          : {}),
        ...(props.mobileCtrlBottomOffset
          ? {
              '& .mapboxgl-ctrl-bottom-left, & .mapboxgl-ctrl-bottom-right': {
                bottom: {
                  base: props.mobileCtrlBottomOffset,
                  lg: '0',
                },
              },
            }
          : {}),
      }}
    >
      <Box
        ref={mapContainerRef}
        w="full"
        h="full"
        aria-label={props.mapAriaLabel ?? 'Map of tasks near the search area'}
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
  const { windowOffsetWidth } = useTaskBrowseLayout()
  const { onNavRoutePresentingChange } = useTaskBrowseData()
  const selectFromMap = useSelectBrowseTaskFromMap()

  return (
    <Box position="absolute" inset={0} zIndex={isDesktop ? 1 : 0}>
      <TaskMap
        {...mapBindings}
        leftViewportPadding={isDesktop ? windowOffsetWidth : undefined}
        searchAreaButtonLeftInset={
          isDesktop ? SINGLE_PANEL_BUTTON_LEFT_INSET : undefined
        }
        onNavRoutePresentingChange={onNavRoutePresentingChange}
        onSelectTask={selectFromMap}
      />
    </Box>
  )
}
