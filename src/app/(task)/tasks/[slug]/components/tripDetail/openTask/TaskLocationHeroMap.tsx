'use client'

import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useCallback, useRef } from 'react'

import { sdlMotion } from '@/theme/styles'
import { useColorMode } from '@/ui/color-mode'
import { whenElementHasLayout } from '@/utils/whenElementHasLayout'

import type { TaskMapTask } from '@/app/(task)/helpers/taskMap'
import {
  type TaskLocationMapController,
  type TaskLocationMapVariant,
  createTaskLocationMapController,
} from '../../../helpers/taskLocationMap'

type ResponsiveHeight = string | Record<string, string>

type TaskLocationHeroMapProps = {
  accessToken: string | undefined
  lat: number | null | undefined
  lng: number | null | undefined
  variant: TaskLocationMapVariant
  /** Auto-draw a route from the viewer's current location (exact address only). */
  enableRoute?: boolean
  /** Expanded price pin for the destination (exact variant), as on desktop. */
  pinTask?: TaskMapTask
  /** Fade the map layer out (used when the mobile header collapses on scroll). */
  hideMap?: boolean
  minH?: ResponsiveHeight
  children: ReactNode
}

/**
 * Mobile task-detail hero: the same INTERACTIVE Mapbox layer as the desktop
 * background (live map, route-from-viewer, price pin) in document flow, with
 * overlaid header text on a white bottom-up legibility scrim.
 */
export function TaskLocationHeroMap({
  accessToken,
  lat,
  lng,
  variant,
  enableRoute = false,
  pinTask,
  hideMap = false,
  minH = { base: '300px', md: '360px' },
  children,
}: TaskLocationHeroMapProps) {
  const { colorMode } = useColorMode()
  const colorModeRef = useRef(colorMode)
  colorModeRef.current = colorMode

  const controllerRef = useRef<TaskLocationMapController | null>(null)
  const routeRequestedRef = useRef(false)
  const layoutCleanupRef = useRef<(() => void) | null>(null)

  const token = accessToken?.trim()
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
  const canMountMap = Boolean(token) && hasCoords

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

  const mapContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      routeRequestedRef.current = false
      layoutCleanupRef.current?.()
      layoutCleanupRef.current = null
      controllerRef.current?.destroy()
      controllerRef.current = null
      if (!node || !token || lat == null || lng == null) return

      // Both form-factor views mount (CSS display gating) — only build the
      // map (WebGL, tiles, geolocation, Directions) once this one has layout.
      layoutCleanupRef.current = whenElementHasLayout(node, () => {
        controllerRef.current = createTaskLocationMapController({
          container: node,
          accessToken: token,
          lat,
          lng,
          variant,
          themeMode: colorModeRef.current === 'dark' ? 'dark' : 'light',
          onMapReady: requestRouteFromViewer,
          pinTask,
        })
      })
    },
    [token, lat, lng, variant, pinTask, requestRouteFromViewer],
  )

  return (
    <Box
      position="relative"
      w="full"
      minH={minH}
      overflow="hidden"
      display="flex"
      css={{
        background: 'linear-gradient(135deg, #EEF3F0 0%, #DCE6E0 50%)',
      }}
    >
      {canMountMap ? (
        <Box
          ref={mapContainerRef}
          position="absolute"
          inset={0}
          opacity={hideMap ? 0 : 1}
          pointerEvents={hideMap ? 'none' : 'auto'}
          transitionProperty="opacity"
          transitionDuration={sdlMotion.duration.map}
          transitionTimingFunction={sdlMotion.easing.standard}
        />
      ) : null}

      {/* White fade from the bottom up — legibility scrim behind the anchored
          hero text. Pointer-transparent so the map stays interactive. */}
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        css={{
          background:
            'linear-gradient(to top, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.72) 26%, rgba(255, 255, 255, 0.28) 48%, rgba(255, 255, 255, 0) 68%)',
        }}
      />

      {/* White fade from the left edge — matches the desktop map background's
          horizontal scrim so the left-aligned copy stays legible.
          TODO(sdl-dark-mode): the hero scrims (here + TaskDetailMapBackground)
          are fixed light-mode white; rework alongside the dark map style when
          dark mode is re-enabled. */}
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        css={{
          background:
            'linear-gradient(to right, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.55) 32%, rgba(255, 255, 255, 0.18) 55%, rgba(255, 255, 255, 0) 75%)',
        }}
      />

      <Box
        position="relative"
        zIndex={1}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        gap={5}
        w="full"
        maxW="6xl"
        mx="auto"
        minH={minH}
        px={{ base: 4, md: 6 }}
        pt={{ base: 4, md: 5 }}
        pb={{ base: 10, md: 14 }}
        pointerEvents="none"
      >
        {children}
      </Box>
    </Box>
  )
}
