'use client'

import { Box, Text } from '@chakra-ui/react'
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react'
import { useEffect } from 'react'
import { LuLocateFixed, LuSearch } from 'react-icons/lu'

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
import { useI11n } from '@/i18n/useI11n'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { sdlFocusRing } from '@/theme/styles'
import { useColorMode } from '@/ui/color-mode'
import { Button, Input } from '@ui'

import bag from '../../../i11n.json'
import {
  TaskLocationAreaHalo,
  TaskLocationCentrePin,
} from './TaskLocationMapPicker'
import { useTaskLocationMap } from './useTaskLocationMap'

const DEFAULT_STYLE = 'mapbox://styles/mapbox/streets-v12'

/** Same light/dark Mapbox styles as the `/search` marketplace map. */
function styleUrlForMode(mode: 'light' | 'dark'): string {
  const light = process.env.NEXT_PUBLIC_MAPBOX_STYLE_LIGHT?.trim()
  const dark = process.env.NEXT_PUBLIC_MAPBOX_STYLE_DARK?.trim()
  return (mode === 'dark' ? dark : light) || DEFAULT_STYLE
}

/** Zoom buttons sit under the floating search field on phone/tablet. */
const CTRL_TOP_BELOW_SEARCH = '64px'

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
  /** Locate-me: move the pin to the poster's current location. */
  onLocate: () => void
  locating?: boolean
}

/**
 * Create-task location map. Fills its parent (the layout animates the
 * parent between full screen and a top band), so the one Mapbox instance
 * survives every step. Full screen wears the `/search` look; collapsed
 * wears the task-detail fade and stops taking gestures.
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
  onLocate,
  locating = false,
}: CreateTaskLocationMapProps) {
  const t = useI11n(bag).location
  const { colorMode } = useColorMode()
  const hideZoomControls = useIsTouchMobileDevice()

  const {
    attachMapContainer,
    mapRef,
    mapReady,
    onLocationInputChange,
    commitLocationQuery,
  } = useTaskLocationMap({
    accessToken,
    location,
    locationLat,
    locationLng,
    onLocationChange,
    onLocationLatChange,
    onLocationLngChange,
    mapOptions: {
      style: styleUrlForMode(colorMode === 'dark' ? 'dark' : 'light'),
      logoPosition: 'bottom-right',
    },
    onMapCreated: (map, mapboxgl) => {
      map.addControl(new mapboxgl.NavigationControl(), 'top-right')
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
        '& .mapboxgl-ctrl-top-right': {
          top: { base: CTRL_TOP_BELOW_SEARCH, lg: 0 },
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
              <Input
                value={location}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onLocationInputChange(e.target.value)
                }
                onBlur={commitLocationQuery}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  e.currentTarget.blur()
                }}
                type="text"
                inputMode="search"
                autoComplete="off"
                placeholder={t.searchPlaceholder}
                aria-label={t.searchLabel}
                rootProps={{ bg: 'bg.surface', boxShadow: 'e2' }}
                startElement={
                  <Box as="span" aria-hidden display="inline-flex">
                    <LuSearch size={18} strokeWidth={2} />
                  </Box>
                }
                endElement={
                  <Button
                    type="button"
                    aria-label={t.locateLabel}
                    title={t.locateLabel}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    minW={0}
                    w={8}
                    h={8}
                    px={0}
                    py={0}
                    borderRadius="lg"
                    variant="ghost"
                    color="text.muted"
                    loading={locating}
                    _hover={{ bg: 'bg.subtle', color: 'text.default' }}
                    _focusVisible={sdlFocusRing}
                    // Keep focus in the field so blur does not geocode the
                    // half-typed query before the locate result lands.
                    onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault()
                    }}
                    onClick={onLocate}
                  >
                    <LuLocateFixed size={18} strokeWidth={2} aria-hidden />
                  </Button>
                }
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
