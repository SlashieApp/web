'use client'

import { Stack } from '@chakra-ui/react'

import { TaskLocationMapPicker } from '@/app/(task)/components'
import { GlassCard } from '@/ui/Card/GlassCard'
import { FormField } from '@/ui/FormField/FormField'
import { TextInput } from '@/ui/Input'
import { Heading, Text } from '@ui'

export type CreateTaskLocationSectionProps = {
  mapboxAccessToken: string | undefined
  streetAddress: string
  mapPlaceName: string
  locationLat: string
  locationLng: string
  onStreetAddressChange: (value: string) => void
  onLocationChange: (value: string) => void
  onLocationLatChange: (value: string) => void
  onLocationLngChange: (value: string) => void
}

export function CreateTaskLocationSection({
  mapboxAccessToken,
  streetAddress,
  mapPlaceName,
  locationLat,
  locationLng,
  onStreetAddressChange,
  onLocationChange,
  onLocationLatChange,
  onLocationLngChange,
}: CreateTaskLocationSectionProps) {
  return (
    <GlassCard p={{ base: 5, md: 6 }} bg="surfaceContainerLowest">
      <Stack gap={5}>
        <Stack gap={1}>
          <Heading size="lg" color="primary.700">
            2. Location
          </Heading>
          <Text fontSize="sm" color="muted">
            Pin the general area on the map. Your full street address stays
            private until you accept a worker&apos;s offer.
          </Text>
        </Stack>

        <TaskLocationMapPicker
          accessToken={mapboxAccessToken}
          location={mapPlaceName}
          locationLat={locationLat}
          locationLng={locationLng}
          onLocationChange={onLocationChange}
          onLocationLatChange={onLocationLatChange}
          onLocationLngChange={onLocationLngChange}
        />

        <FormField
          label="Exact address"
          helperText="Only you see this until you accept an offer — it is not shown on the public task listing."
        >
          <TextInput
            value={streetAddress}
            onChange={(e) => onStreetAddressChange(e.target.value)}
            placeholder="Apt, street, unit number…"
          />
        </FormField>
      </Stack>
    </GlassCard>
  )
}
