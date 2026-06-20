import type { ReactNode } from 'react'

import { Box } from '@chakra-ui/react'

import {
  type MapboxStaticMapVariant,
  buildMapboxStaticImageUrl,
  parseMapHeightPx,
} from '@/utils/mapboxStaticImageUrl'
import { Button, Link } from '@ui'

export type LocationMapProps = {
  accessToken: string | undefined
  lat: number
  lng: number
  /** Map container height (default 200px). */
  height?: string
  /** Exact pin when full address is shared; otherwise approximate area circle. */
  variant?: MapboxStaticMapVariant
  /** Optional footer flush below the map (and below “Open in Maps” when shown). */
  footer?: ReactNode
}

function mapsSearchUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
}

function LocationMapUnavailable({ height }: { height: string }) {
  return (
    <Box
      w="full"
      h={height}
      bg="cardBg"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      fontSize="sm"
      color="formLabelMuted"
      textAlign="center"
    >
      Map preview unavailable
    </Box>
  )
}

export function LocationMap({
  accessToken,
  lat,
  lng,
  height = '200px',
  variant = 'approximate',
  footer,
}: LocationMapProps) {
  const token = accessToken?.trim()
  const heightPx = parseMapHeightPx(height)
  const showOpenInMaps =
    variant === 'exact' && Number.isFinite(lat) && Number.isFinite(lng)

  const mapImage =
    token &&
    buildMapboxStaticImageUrl({
      accessToken: token,
      lat,
      lng,
      heightPx,
      variant,
    })

  const mapPane = mapImage ? (
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
    <LocationMapUnavailable height={height} />
  )

  const openInMapsRow = showOpenInMaps ? (
    <Link
      href={mapsSearchUrl(lat, lng)}
      target="_blank"
      rel="noopener noreferrer"
      display="block"
      w="full"
      borderTopWidth="1px"
      borderColor="cardDivider"
      bg="cardBg"
      _hover={{ textDecoration: 'none', bg: 'badgeBg' }}
    >
      <Button type="button" size="xs" variant="ghost" w="full">
        Open in Maps
      </Button>
    </Link>
  ) : null

  if (!footer) {
    return (
      <Box
        w="full"
        borderRadius="lg"
        overflow="hidden"
        borderWidth="1px"
        borderColor="cardBorder"
        bg="cardBg"
      >
        {mapPane}
        {openInMapsRow}
      </Box>
    )
  }

  return (
    <Box
      w="full"
      borderRadius="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor="cardBorder"
      bg="cardBg"
    >
      {mapPane}
      {openInMapsRow}
      <Box
        py={3}
        px={2}
        textAlign="center"
        borderTopWidth="1px"
        borderColor="cardDivider"
      >
        {footer}
      </Box>
    </Box>
  )
}
