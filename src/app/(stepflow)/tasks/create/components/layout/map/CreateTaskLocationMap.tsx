'use client'

import { Box, Text } from '@chakra-ui/react'
import { useEffect } from 'react'

import { marketplaceMapMotion } from '@/app/(task)/helpers/marketplaceMap/motion'
import {
  MAPBOX_CTRL_Z_INDEX,
  MAP_FADE_BOTTOM,
  MAP_FADE_Z_INDEX,
  mapFadeOverlayCss,
  mountMapFadeOverlay,
  overlayWatermarkCss,
} from '@/app/(task)/helpers/marketplaceMap/overlay/overlay'
import { useIsTouchMobileDevice } from '@/app/(task)/helpers/touchMobileDevice'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'

import {
  BELOW_TASK_LOCATION_SEARCH,
  TaskLocationAreaHalo,
  TaskLocationCentrePin,
  TaskLocationSearchBar,
} from './TaskLocationMapPicker'
import { useTaskLocationMap } from './useTaskLocationMap'

export type CreateTaskLocationMapProps = {
  accessToken: string | undefined
  location: string
  locationLat: string
  locationLng: string
  onLocationChange: (value: string) => void
  onLocationLatChange: (value: string) => void
  onLocationLngChange: (value: string) => void
  /** Later steps: a non-interactive band behind the form. */
  collapsed: boolean
  /** Locate-me couldn't tell where the poster is (denied, off, or too slow). */
  onLocateFailed?: () => void
}

/**
 * Create-task location map. Fills its parent (the layout animates the
 * parent between full screen and a top band), so the one Mapbox instance
 * survives every step. Full screen wears the `/search` look; collapsed
 * wears the task-detail fade and stops taking gestures. The style, pin,
 * halo, search bar and locate-me are shared with Edit task's map (FE-356).
 */
export function CreateTaskLocationMap({
  accessToken,
  location,
  locationLat,
  locationLng,
  onLocationChange,
  onLocationLatChange,
  onLocationLngChange,
  collapsed,
  onLocateFailed,
}: CreateTaskLocationMapProps) {
  const hideZoomControls = useIsTouchMobileDevice()

  const {
    attachMapContainer,
    mapRef,
    mapReady,
    onLocationInputChange,
    commitLocationQuery,
    locate,
    locating,
  } = useTaskLocationMap({
    accessToken,
    location,
    locationLat,
    locationLng,
    onLocationChange,
    onLocationLatChange,
    onLocationLngChange,
    onLocateFailed,
    onMapCreated: (map) => {
      mountMapFadeOverlay(map.getContainer())
    },
  })

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    for (const handler of [
      map.dragPan,
      map.scrollZoom,
      map.boxZoom,
      map.dragRotate,
      map.keyboard,
      map.doubleClickZoom,
      map.touchZoomRotate,
      map.touchPitch,
    ]) {
      if (collapsed) handler.disable()
      else handler.enable()
    }
  }, [collapsed, mapReady, mapRef])

  const token = accessToken?.trim()

  if (!token) {
    return (
      <Box
        position="relative"
        w="full"
        h="full"
        bg="bg.surface"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={6}
      >
        <Text color="text.muted" fontSize="sm" textAlign="center">
          Set{' '}
          <Text as="span" fontWeight={700} color="text.default">
            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          </Text>{' '}
          to pick a location on the map.
        </Text>
      </Box>
    )
  }

  return (
    <Box
      position="relative"
      w="full"
      h="full"
      overflow="hidden"
      isolation="isolate"
      bg="bg.subtle"
      css={{
        ...mapFadeOverlayCss(collapsed ? 'taskDetail' : 'search'),
        ...overlayWatermarkCss(),
        // Zoom buttons sit under the floating search field on phone/tablet.
        '& .mapboxgl-ctrl-top-right': {
          top: { base: BELOW_TASK_LOCATION_SEARCH, lg: 0 },
          display: collapsed || hideZoomControls ? 'none' : undefined,
        },
      }}
    >
      {/* `.mapboxgl-map` forces `position: relative`, so size explicitly. */}
      <Box
        ref={attachMapContainer}
        position="absolute"
        inset={0}
        w="full"
        h="full"
        aria-hidden
      />

      {/* Phone/tablet task-detail wash: the band fades into the form. */}
      <Box
        position="absolute"
        inset={0}
        zIndex={1}
        display={{ base: 'block', lg: 'none' }}
        pointerEvents="none"
        backgroundImage={MAP_FADE_BOTTOM}
        opacity={collapsed ? 1 : 0}
        transitionProperty="opacity"
        transitionDuration={marketplaceMapMotion.duration}
        transitionTimingFunction={marketplaceMapMotion.easing}
        aria-hidden
      />

      <Box
        position="absolute"
        inset={0}
        zIndex={MAP_FADE_Z_INDEX + 1}
        pointerEvents="none"
        aria-hidden
      >
        {collapsed ? null : <TaskLocationAreaHalo />}
        <TaskLocationCentrePin />
      </Box>

      {collapsed ? null : (
        <Box
          position="absolute"
          top={3}
          left={0}
          right={0}
          zIndex={MAPBOX_CTRL_Z_INDEX + 1}
          pointerEvents="none"
        >
          <Box
            maxW={PAGE_CONTAINER_MAX_W}
            mx="auto"
            px={{ base: 3, lg: PAGE_GUTTER_X.lg }}
          >
            <Box maxW={{ lg: '420px' }} pointerEvents="auto">
              <TaskLocationSearchBar
                value={location}
                onChange={onLocationInputChange}
                onSearch={commitLocationQuery}
                onLocate={() => void locate()}
                locating={locating}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
