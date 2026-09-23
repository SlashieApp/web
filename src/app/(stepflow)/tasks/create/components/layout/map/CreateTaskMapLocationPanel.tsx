'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'
import type { UseFormRegister } from 'react-hook-form'

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
  /** Poster edited the street address, so a previous pin is no longer the place. */
  onStreetAddressEdited?: () => void
  /** Geocode the street address when the field is left. */
  onStreetAddressBlur?: () => void
}

export function CreateTaskMapLocationPanel({
  bare = false,
  sectionHeading = '2. Task location',
  mapboxAccessToken,
  mapPlaceName,
  locationLat,
  locationLng,
  onLocationChange,
  onLocationLatChange,
  onLocationLngChange,
  register,
  streetAddressError,
  onCopyMapPlaceToAddress,
  locationError,
  onStreetAddressEdited,
  onStreetAddressBlur,
}: CreateTaskMapLocationPanelProps) {
  const canCopyPlace = Boolean(mapPlaceName.trim())
  const streetAddress = register('streetAddress')

  return (
    <CreateTaskSection bare={bare} heading={sectionHeading} bodyGap={4}>
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

      <FormField
        label="Exact address"
        helperText="Only shared with the worker you hire — not shown on your public listing until you accept a quote."
        errorText={streetAddressError}
      >
        <Stack gap={2}>
          <Input
            {...streetAddress}
            placeholder="Apt, street, unit number…"
            onChange={(event) => {
              onStreetAddressEdited?.()
              streetAddress.onChange(event)
            }}
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

      <Text fontSize="sm" color="text.muted">
        Workers see the map area for search only. Your exact address stays
        private until you hire someone.
      </Text>
      {locationError ? (
        <Text fontSize="sm" color="status.danger.fg">
          {locationError}
        </Text>
      ) : null}
    </CreateTaskSection>
  )
}
