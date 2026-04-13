'use client'

import { HStack, Stack } from '@chakra-ui/react'
import type { UseFormRegister } from 'react-hook-form'

import { Button } from '@/ui/Button'
import { GlassCard } from '@/ui/Card/GlassCard'
import { FormField } from '@/ui/FormField/FormField'
import { TextInput } from '@/ui/Input'
import { Heading, Text } from '@ui'
import type { CreateTaskFormValues } from '../createTaskFormSchema'
import { TaskLocationMapPicker } from './TaskLocationMapPicker'

export type CreateTaskMapLocationPanelProps = {
  mapboxAccessToken: string | undefined
  mapPlaceName: string
  locationLat: string
  locationLng: string
  onLocationChange: (value: string) => void
  onLocationLatChange: (value: string) => void
  onLocationLngChange: (value: string) => void
  register: UseFormRegister<CreateTaskFormValues>
  streetAddressError?: string
  onCopyMapPlaceToAddress: () => void
  /** First relevant map/location validation message from the form. */
  locationError?: string
}

export function CreateTaskMapLocationPanel({
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
}: CreateTaskMapLocationPanelProps) {
  const canCopyPlace = Boolean(mapPlaceName.trim())

  return (
    <GlassCard p={{ base: 5, md: 6 }} bg="surfaceContainerLowest">
      <Stack gap={4}>
        <Heading size="lg" color="primary.700">
          Task location
        </Heading>
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
          helperText="Only shared with the professional you hire — not shown on your public listing until you accept a quote."
          errorText={streetAddressError}
        >
          <Stack gap={2}>
            <TextInput
              {...register('streetAddress')}
              placeholder="Apt, street, unit number…"
            />
            <HStack gap={2} flexWrap="wrap" align="stretch">
              <Button
                type="button"
                size="sm"
                variant="subtle"
                flexShrink={0}
                disabled={!canCopyPlace}
                onClick={onCopyMapPlaceToAddress}
              >
                Copy map place to address
              </Button>
              <Text fontSize="xs" color="muted" flex={1} minW="0" py={1}>
                Fills the field with the map search label (you can edit it
                afterward).
              </Text>
            </HStack>
          </Stack>
        </FormField>

        <Text fontSize="sm" color="muted">
          Workers see the map area for search only. Your exact address stays
          private until you hire someone.
        </Text>
        {locationError ? (
          <Text fontSize="sm" color="red.500">
            {locationError}
          </Text>
        ) : null}
      </Stack>
    </GlassCard>
  )
}
