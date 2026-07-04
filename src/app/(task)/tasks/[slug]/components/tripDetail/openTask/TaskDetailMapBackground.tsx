'use client'

import { Box } from '@chakra-ui/react'
import { useCallback, useMemo, useRef } from 'react'

import { sdlMotion } from '@/theme/styles'
import { useColorMode } from '@/ui/color-mode'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { useTaskDetailHeaderCollapsed } from '../../../helpers/taskDetailHeaderCollapse'
import {
  taskDetailMapCoordinates,
  taskDetailShowsExactLocation,
} from '../../../helpers/taskDetailUtils'
import {
  type TaskLocationMapController,
  type TaskLocationMapViewPadding,
  buildTaskDetailMapPinTask,
  createTaskLocationMapController,
} from '../../../helpers/taskLocationMap'

const HORIZONTAL_SCRIM =
  'linear-gradient(to right, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.88) 38%, rgba(255, 255, 255, 0.4) 58%, rgba(255, 255, 255, 0) 78%)'

/** White fade from the bottom edge up — softens the map behind scrolling cards. */
const BOTTOM_SCRIM =
  'linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.75) 18%, rgba(255, 255, 255, 0.25) 42%, rgba(255, 255, 255, 0) 68%)'

/** Frame the task pin in the header's right column (slightly past center). */
function desktopPinPadding(
  width: number,
  height: number,
): TaskLocationMapViewPadding {
  return {
    top: 88,
    left: Math.round(width * 0.5),
    right: 20,
    bottom: Math.round(height * 0.58),
  }
}

/**
 * Desktop task-detail map layer: fixed to the viewport, zero document flow
 * height. Route + pin render behind the scrolling header and content cards.
 */
export function TaskDetailMapBackground() {
  const { task, permissions, myOrder, me } = useTaskDetail()
  const collapsed = useTaskDetailHeaderCollapsed()
  const { colorMode } = useColorMode()
  const colorModeRef = useRef(colorMode)
  colorModeRef.current = colorMode

  const controllerRef = useRef<TaskLocationMapController | null>(null)
  const mapNodeRef = useRef<HTMLDivElement | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const routeRequestedRef = useRef(false)

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim()
  const coords = task ? taskDetailMapCoordinates(task, myOrder) : null
  const lat = coords?.lat
  const lng = coords?.lng
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
  const canMountMap = Boolean(token) && hasCoords

  const showExact = task
    ? taskDetailShowsExactLocation({
        myOrder,
        showFullAddress: permissions.showFullAddress,
      })
    : false
  const variant = showExact ? 'exact' : 'approximate'
  const enableRoute = showExact

  const pinTask = useMemo(() => {
    if (!task || !showExact || lat == null || lng == null) return undefined
    return buildTaskDetailMapPinTask(
      task,
      { lat, lng },
      permissions.isOwner ? 'owner' : 'visitor',
      me?.id,
    )
  }, [task, showExact, lat, lng, permissions.isOwner, me?.id])

  const requestRouteFromViewer = useCallback(() => {
    if (
      !enableRoute ||
      routeRequestedRef.current ||
      typeof navigator === 'undefined' ||
      !navigator.geolocation
    ) {
      return
    }
    routeRequestedRef.current = true
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void controllerRef.current?.showRouteFrom({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [enableRoute])

  const syncPinPadding = useCallback(() => {
    const node = mapNodeRef.current
    const controller = controllerRef.current
    if (!node || !controller) return
    controller.setViewPadding(
      desktopPinPadding(node.offsetWidth, node.offsetHeight),
    )
    controller.resize()
  }, [])

  const mapContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
      mapNodeRef.current = node
      routeRequestedRef.current = false

      controllerRef.current?.destroy()
      controllerRef.current = null
      if (!node || !token || lat == null || lng == null) return

      controllerRef.current = createTaskLocationMapController({
        container: node,
        accessToken: token,
        lat,
        lng,
        variant,
        themeMode: colorModeRef.current === 'dark' ? 'dark' : 'light',
        viewPadding: desktopPinPadding(node.offsetWidth, node.offsetHeight),
        onMapReady: requestRouteFromViewer,
        pinTask,
      })

      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => syncPinPadding())
        observer.observe(node)
        resizeObserverRef.current = observer
      }
    },
    [token, lat, lng, variant, pinTask, syncPinPadding, requestRouteFromViewer],
  )

  if (!task) return null

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={0}
      h="100vh"
      w="full"
      overflow="hidden"
      display={{ base: 'none', lg: 'block' }}
      aria-hidden
      opacity={collapsed ? 0 : 1}
      pointerEvents={collapsed ? 'none' : 'auto'}
      transitionProperty="opacity"
      transitionDuration={sdlMotion.duration.map}
      transitionTimingFunction={sdlMotion.easing.standard}
      css={{
        background: 'linear-gradient(135deg, #EEF3F0 0%, #DCE6E0 100%)',
      }}
    >
      {canMountMap ? (
        <Box ref={mapContainerRef} position="absolute" inset={0} />
      ) : null}
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        css={{ background: HORIZONTAL_SCRIM }}
      />
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        css={{ background: BOTTOM_SCRIM }}
      />
    </Box>
  )
}
