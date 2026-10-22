'use client'

import { Box, Text } from '@chakra-ui/react'
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react'
import { LuLocateFixed, LuSearch } from 'react-icons/lu'

import { overlayWatermarkCss } from '@/app/(task)/helpers/marketplaceMap/overlay/overlay'
import { useIsTouchMobileDevice } from '@/app/(task)/helpers/touchMobileDevice'
import { useI11n } from '@/i18n/useI11n'
import { BRAND_MAP_PIN, BRAND_MAP_PIN_STROKE } from '@/theme/brand'
import { sdlFocusRing } from '@/theme/styles'
import { Button, Input } from '@ui'

import bag from '../../../i11n.json'
import { useTaskLocationMap } from './useTaskLocationMap'

/**
 * Room above the zoom buttons when they sit under the floating search bar
 * (12px from the top, then the bar).
 */
export const BELOW_TASK_LOCATION_SEARCH = '64px'

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

export type TaskLocationSearchBarProps = {
  value: string
  onChange: (value: string) => void
  /** Search for what was typed: on blur, and on Enter. */
  onSearch: () => void
  /** Locate-me: move the pin to where the poster is. */
  onLocate: () => void
  locating?: boolean
}

/**
 * The floating search field over a task location map (create and Edit
 * task): search a street, area or postcode, or locate-me. Enter searches and
 * closes the keyboard.
 */
export function TaskLocationSearchBar({
  value,
  onChange,
  onSearch,
  onLocate,
  locating = false,
}: TaskLocationSearchBarProps) {
  const t = useI11n(bag).location
  return (
    <Input
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      onBlur={onSearch}
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
  /** Locate-me couldn't tell where the poster is (denied, off, or too slow). */
  onLocateFailed?: () => void
}

/**
 * Edit task's map (FE-356): create's map in a card, with the same Mapbox
 * style, centre pin and area halo, floating search bar and locate-me, logo
 * and zoom buttons. Inside a scrolling page, one finger scrolls the page and
 * two move the map.
 */
export function TaskLocationMapPicker({
  accessToken,
  location,
  locationLat,
  locationLng,
  onLocationChange,
  onLocationLatChange,
  onLocationLngChange,
  onLocateFailed,
}: TaskLocationMapPickerProps) {
  const t = useI11n(bag).location
  const hideZoomControls = useIsTouchMobileDevice()
  const {
    attachMapContainer,
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
    mapOptions: { cooperativeGestures: true },
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
      css={{
        ...overlayWatermarkCss(),
        // The search bar spans the card, so the zoom buttons go under it;
        // phones pinch instead.
        '& .mapboxgl-ctrl-top-right': {
          top: BELOW_TASK_LOCATION_SEARCH,
          display: hideZoomControls ? 'none' : undefined,
        },
      }}
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
          <TaskLocationAreaHalo />
          <TaskLocationCentrePin />
          <Box position="absolute" left={3} right={3} top={3} zIndex={2}>
            <TaskLocationSearchBar
              value={location}
              onChange={onLocationInputChange}
              onSearch={commitLocationQuery}
              onLocate={() => void locate()}
              locating={locating}
            />
          </Box>
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
