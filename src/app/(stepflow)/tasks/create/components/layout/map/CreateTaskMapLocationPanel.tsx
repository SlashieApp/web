'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { UseFormRegister } from 'react-hook-form'
import { LuLock, LuMapPin } from 'react-icons/lu'

import { Button, FormField, Input } from '@ui'
import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import { CreateTaskSection } from '../shared/CreateTaskSection'
import { TaskLocationMapPicker } from './TaskLocationMapPicker'

export type CreateTaskMapLocationPanelProps = {
  /** Bare mode for the stepped create flow (no Card/heading). */
  bare?: boolean
  /** Card header text (card mode only). */
  sectionHeading?: string
  mapboxAccessToken: string | undefined
  mapPlaceName: string
  /** What workers see before accept (town at the pin); empty while looking up. */
  publicArea?: string
  locationLat: string
  locationLng: string
  onLocationChange: (value: string) => void
  onLocationLatChange: (value: string) => void
  onLocationLngChange: (value: string) => void
  register: UseFormRegister<CreateTaskFormFieldValues>
  streetAddressError?: string
  onCopyMapPlaceToAddress: () => void
  /** First relevant map/location validation message from the form. */
  locationError?: string
  /** Geocode the street address when the field is left. */
  onStreetAddressBlur?: () => void
}

export function CreateTaskMapLocationPanel({
  bare = false,
  sectionHeading = '2. Task location',
  mapboxAccessToken,
  mapPlaceName,
  publicArea = '',
  locationLat,
  locationLng,
  onLocationChange,
  onLocationLatChange,
  onLocationLngChange,
  register,
  streetAddressError,
  onCopyMapPlaceToAddress,
  locationError,
  onStreetAddressBlur,
}: CreateTaskMapLocationPanelProps) {
  const canCopyPlace = Boolean(mapPlaceName.trim())
  const streetAddress = register('streetAddress')

  return (
    <CreateTaskSection bare={bare} heading={sectionHeading} bodyGap={4}>
      <HStack
        align="flex-start"
        gap={2.5}
        p={3}
        borderRadius="lg"
        bg="bg.subtle"
        borderWidth="1px"
        borderColor="border.default"
      >
        <Box color="text.default" pt={0.5} flexShrink={0} aria-hidden>
          <LuLock size={16} />
        </Box>
        <Text fontSize="sm" color="text.default">
          Your exact address stays private until you accept a worker. Until
          then, workers only see an approximate area on the map.
        </Text>
      </HStack>
      <TaskLocationMapPicker
        accessToken={mapboxAccessToken}
        location={mapPlaceName}
        locationLat={locationLat}
        locationLng={locationLng}
        onLocationChange={onLocationChange}
        onLocationLatChange={onLocationLatChange}
        onLocationLngChange={onLocationLngChange}
        showCoordinateHelpText={false}
      />
      <HStack
        gap={1.5}
        alignSelf="flex-start"
        px={3}
        py={1.5}
        borderRadius="full"
        bg="status.success.soft"
        aria-live="polite"
      >
        <Box color="action.primary" flexShrink={0} aria-hidden>
          <LuMapPin size={14} />
        </Box>
        <Text fontSize="sm" fontWeight={600} lineClamp={1}>
          {publicArea
            ? `Workers will see: ${publicArea}`
            : 'Move the map to set the area.'}
        </Text>
      </HStack>

      <FormField
        label={
          <HStack as="span" gap={1.5}>
            <LuLock size={14} aria-hidden />
            Exact address
          </HStack>
        }
        helperText="Shared only with the worker you accept, after you hire them."
        errorText={streetAddressError}
      >
        <Stack gap={2}>
          <Input
            {...streetAddress}
            placeholder="Apt, street, unit number…"
            onBlur={(event) => {
              streetAddress.onBlur(event)
              onStreetAddressBlur?.()
            }}
          />
          <HStack gap={2} flexWrap="wrap" align="stretch">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              flexShrink={0}
              disabled={!canCopyPlace}
              onClick={onCopyMapPlaceToAddress}
            >
              Copy map place to address
            </Button>
            <Text fontSize="xs" color="text.muted" flex={1} minW="0" py={1}>
              Fills the field with the map search label (you can edit it
              afterward).
            </Text>
          </HStack>
        </Stack>
      </FormField>

      {locationError ? (
        <Text fontSize="sm" color="status.danger.fg">
          {locationError}
        </Text>
      ) : null}
    </CreateTaskSection>
  )
}
