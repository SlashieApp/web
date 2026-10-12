'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { UseFormRegister } from 'react-hook-form'
import { LuMapPin } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { FormField, Input } from '@ui'
import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import bag from '../../../i11n.json'

export type CreateTaskLocationSectionProps = {
  /** Map label for the pin (reverse geocode or search result). */
  mapPlaceName: string
  register: UseFormRegister<CreateTaskFormFieldValues>
  streetAddressError?: string
  /** First relevant map/location validation message from the form. */
  locationError?: string
  /** Current location was denied or unavailable. */
  locateUnavailable?: boolean
  /** Poster edited the street address, so a previous pin is no longer the place. */
  onStreetAddressEdited?: () => void
  /** Geocode the street address when the field is left. */
  onStreetAddressBlur?: () => void
}

/**
 * Bottom card body for the full-screen location step: the pin's place label
 * and the private exact address.
 */
export function CreateTaskLocationSection({
  mapPlaceName,
  register,
  streetAddressError,
  locationError,
  locateUnavailable = false,
  onStreetAddressEdited,
  onStreetAddressBlur,
}: CreateTaskLocationSectionProps) {
  const t = useI11n(bag).location
  const streetAddress = register('streetAddress')
  const place = mapPlaceName.trim()

  return (
    <Stack gap={4}>
      <HStack align="flex-start" gap={2}>
        <Box color="action.primary" pt={0.5} flexShrink={0} aria-hidden>
          <LuMapPin size={18} />
        </Box>
        <Stack gap={0} minW={0} aria-live="polite">
          <Text fontSize="xs" fontWeight={600} color="text.muted">
            {t.placeLabel}
          </Text>
          <Text
            fontSize="sm"
            color={place ? 'text.default' : 'text.muted'}
            lineClamp={2}
          >
            {place || t.placeEmpty}
          </Text>
        </Stack>
      </HStack>

      {locateUnavailable ? (
        <Text fontSize="sm" color="text.muted">
          {t.locateUnavailable}
        </Text>
      ) : null}

      <FormField label={t.addressLabel} errorText={streetAddressError}>
        <Input
          {...streetAddress}
          placeholder={t.addressPlaceholder}
          onChange={(event) => {
            onStreetAddressEdited?.()
            streetAddress.onChange(event)
          }}
          onBlur={(event) => {
            streetAddress.onBlur(event)
            onStreetAddressBlur?.()
          }}
        />
      </FormField>

      {locationError ? (
        <Text fontSize="sm" color="status.danger.fg">
          {locationError}
        </Text>
      ) : null}
    </Stack>
  )
}
