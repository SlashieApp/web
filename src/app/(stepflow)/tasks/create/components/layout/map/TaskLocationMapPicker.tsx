'use client'

import { Box, Text } from '@chakra-ui/react'
import type { ChangeEvent } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { BRAND_MAP_PIN, BRAND_MAP_PIN_STROKE } from '@/theme/brand'
import { Input } from '@ui'

import bag from '../../../i11n.json'
import { useTaskLocationMap } from './useTaskLocationMap'

/**
 * Soft circle behind the centre pin (FE-70): workers see an approximate
 * area, not this exact point. Decorative.
 */
export function TaskLocationAreaHalo() {
  return (
    <Box
      pointerEvents="none"
      position="absolute"
      left="50%"
      top="50%"
      w="128px"
      h="128px"
      ml="-64px"
      mt="-64px"
      zIndex={1}
      borderRadius="full"
      bg="color-mix(in srgb, var(--chakra-colors-action-primary) 14%, transparent)"
      borderWidth="1.5px"
      borderStyle="dashed"
      borderColor="action.primary"
      aria-hidden
    />
  )
}

/** Fixed centre pin: the tip sits on the map centre. Decorative. */
export function TaskLocationCentrePin() {
  return (
    <Box
      pointerEvents="none"
      position="absolute"
      left="50%"
      top="50%"
      w="32px"
      h="32px"
      ml="-16px"
      mt="-28px"
      zIndex={2}
      aria-hidden
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Selected location</title>
        <path
          d="M12 0C5.383 0 0 5.285 0 11.8c0 6.515 12 20.2 12 20.2s12-13.685 12-20.2C24 5.285 18.617 0 12 0z"
          fill={BRAND_MAP_PIN}
          stroke={BRAND_MAP_PIN_STROKE}
          strokeWidth="2"
        />
      </svg>
    </Box>
  )
}

export type TaskLocationMapPickerProps = {
  accessToken: string | undefined
  location: string
  locationLat: string
  locationLng: string
  onLocationChange: (value: string) => void
  onLocationLatChange: (value: string) => void
  onLocationLngChange: (value: string) => void
}

export function TaskLocationMapPicker({
  accessToken,
  location,
  locationLat,
  locationLng,
  onLocationChange,
  onLocationLatChange,
  onLocationLngChange,
}: TaskLocationMapPickerProps) {
  const t = useI11n(bag).location
  const { attachMapContainer, onLocationInputChange, commitLocationQuery } =
    useTaskLocationMap({
      accessToken,
      location,
      locationLat,
      locationLng,
      onLocationChange,
      onLocationLatChange,
      onLocationLngChange,
      // Inside a scrolling page: one finger scrolls the page, two move the map.
      mapOptions: { cooperativeGestures: true },
      onMapCreated: (map, mapboxgl) => {
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')
      },
    })

  const token = accessToken?.trim()

  return (
    <Box
      position="relative"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="e1"
      borderWidth="1px"
      borderColor="border.default"
      h={{ base: '240px', md: '320px' }}
      bg="bg.surface"
    >
      {token ? (
        <>
          <Box
            ref={attachMapContainer}
            position="absolute"
            inset={0}
            zIndex={0}
            w="full"
            h="full"
            aria-hidden
          />
          <Box position="absolute" left={3} right={3} top={3} zIndex={2}>
            <Input
              value={location}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onLocationInputChange(e.target.value)
              }
              onBlur={commitLocationQuery}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                e.preventDefault()
                e.currentTarget.blur()
              }}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchLabel}
              rootProps={{
                bg: 'whiteAlpha.950',
                backdropFilter: 'blur(8px)',
                borderColor: 'border.default',
                boxShadow: 'sm',
              }}
            />
          </Box>
          <TaskLocationAreaHalo />
          <TaskLocationCentrePin />
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="full"
          px={4}
        >
          <Text color="text.muted" fontSize="sm" textAlign="center">
            {t.mapUnavailable}
          </Text>
        </Box>
      )}
    </Box>
  )
}
