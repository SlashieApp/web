'use client'

import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { sdlMotion } from '@/theme/styles'
import {
  type MapboxStaticMapVariant,
  buildMapboxStaticImageUrl,
} from '@/utils/mapboxStaticImageUrl'

type ResponsiveHeight = string | Record<string, string>

type TaskLocationHeroMapProps = {
  accessToken: string | undefined
  lat: number | null | undefined
  lng: number | null | undefined
  variant: MapboxStaticMapVariant
  /** Fade the map layer out (used when the mobile header collapses on scroll). */
  hideMap?: boolean
  minH?: ResponsiveHeight
  children: ReactNode
}

/**
 * Mobile task-detail hero: a NON-interactive static map image (Mapbox Static
 * Images API) with overlaid header text and a white bottom-up legibility scrim.
 * Desktop uses `TaskDetailMapBackground` + `OpenTaskHeader` instead.
 */
export function TaskLocationHeroMap({
  accessToken,
  lat,
  lng,
  variant,
  hideMap = false,
  minH = { base: '300px', md: '360px' },
  children,
}: TaskLocationHeroMapProps) {
  const token = accessToken?.trim()
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
  const mapImage =
    token && hasCoords && lat != null && lng != null
      ? buildMapboxStaticImageUrl({
          accessToken: token,
          lat,
          lng,
          width: 900,
          heightPx: 640,
          variant,
        })
      : null

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
      {mapImage ? (
        <img
          src={mapImage}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: hideMap ? 0 : 1,
            transition: `opacity ${sdlMotion.duration.map} ${sdlMotion.easing.standard}`,
          }}
          loading="lazy"
          decoding="async"
        />
      ) : null}

      {/* White fade from the bottom up — legibility scrim behind the anchored
          hero text. */}
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        css={{
          background:
            'linear-gradient(to top, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.72) 26%, rgba(255, 255, 255, 0.28) 48%, rgba(255, 255, 255, 0) 68%)',
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
