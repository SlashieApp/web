'use client'

import { Box } from '@chakra-ui/react'

import {
  type MapboxStaticMapVariant,
  buildMapboxStaticImageUrl,
  parseMapHeightPx,
} from '@/utils/mapboxStaticImageUrl'
import { Button } from '../Button/Button'
import { Link } from '../Link/Link'

/**
 * SDL MapCard — a static map snapshot with a single brand pin and an
 * "Open in Maps" action. Exact pin when the full address is shared, otherwise an
 * approximate area circle (caller passes `variant`). SDL roles only.
 */
export type MapCardProps = {
  accessToken: string | undefined
  lat: number
  lng: number
  /** Map height (default 200px). */
  height?: string
  /** Exact pin vs approximate area circle. */
  variant?: MapboxStaticMapVariant
  /** Show the "Open in Maps" bar (only meaningful for an exact location). */
  showOpenInMaps?: boolean
}

function mapsSearchUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
}

export function MapCard({
  accessToken,
  lat,
  lng,
  height = '200px',
  variant = 'approximate',
  showOpenInMaps,
}: MapCardProps) {
  const token = accessToken?.trim()
  const heightPx = parseMapHeightPx(height)
  const openInMaps =
    (showOpenInMaps ?? variant === 'exact') &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)

  const mapImage =
    token &&
    buildMapboxStaticImageUrl({
      accessToken: token,
      lat,
      lng,
      heightPx,
      variant,
    })

  return (
    <Box
      w="full"
      borderRadius="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.surface"
    >
      {mapImage ? (
        <img
          src={mapImage}
          alt={
            variant === 'exact'
              ? 'Map showing task location'
              : 'Map showing approximate task area'
          }
          style={{
            width: '100%',
            height,
            objectFit: 'cover',
            display: 'block',
          }}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <Box
          w="full"
          h={height}
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
          fontSize="sm"
          color="text.muted"
          textAlign="center"
        >
          Map preview unavailable
        </Box>
      )}
      {openInMaps ? (
        <Link
          href={mapsSearchUrl(lat, lng)}
          target="_blank"
          rel="noopener noreferrer"
          display="block"
          w="full"
          borderTopWidth="1px"
          borderColor="border.default"
          bg="bg.surface"
          _hover={{ textDecoration: 'none', bg: 'bg.subtle' }}
        >
          <Button type="button" size="sm" variant="ghost" w="full">
            Open in Maps
          </Button>
        </Link>
      ) : null}
    </Box>
  )
}
