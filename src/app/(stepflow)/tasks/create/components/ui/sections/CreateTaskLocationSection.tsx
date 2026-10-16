'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { UseFormRegister } from 'react-hook-form'
import { LuLock, LuMapPin } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, FormField, Input } from '@ui'
import type { CreateTaskFormFieldValues } from '../../../createTaskFormSchema'
import { taskFieldError } from '../../../helpers/taskFieldError'
import bag from '../../../i11n.json'

export type CreateTaskLocationSectionProps = {
  /** What workers see before accept (town at the pin); empty while looking up. */
  publicArea: string
  register: UseFormRegister<CreateTaskFormFieldValues>
  streetAddressError?: string
  /** First map/location error (a copy key) from the form. */
  locationError?: string
  /** Current location was denied or unavailable. */
  locateUnavailable?: boolean
  /** Geocode the street address when the field is left. */
  onStreetAddressBlur?: () => void
  /** The pin's current street address (reverse geocoded); empty until known. */
  pinAddress?: string
  /** Copy the pin's address into Exact address (FE-209). */
  onUsePinAddress?: () => void
}

/**
 * Location step body (FE-70): one privacy callout, the area workers see
 * (public), and the exact address (private until you accept a worker).
 */
export function CreateTaskLocationSection({
  publicArea,
  register,
  streetAddressError,
  locationError,
  locateUnavailable = false,
  onStreetAddressBlur,
  pinAddress = '',
  onUsePinAddress,
}: CreateTaskLocationSectionProps) {
  const copy = useI11n(bag)
  const t = copy.location
  const streetAddress = register('streetAddress')

  return (
    <Stack gap={4}>
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
          {t.privacyCallout}
        </Text>
      </HStack>

      <Stack gap={1.5}>
        <HStack
          gap={1.5}
          alignSelf="flex-start"
          px={3}
          py={1.5}
          borderRadius="full"
          bg="status.success.soft"
          color="text.default"
          aria-live="polite"
        >
          <Box color="action.primary" flexShrink={0} aria-hidden>
            <LuMapPin size={14} />
          </Box>
          <Text fontSize="sm" fontWeight={600} lineClamp={1}>
            {publicArea
              ? formatMessage(t.workersWillSee, { area: publicArea })
              : t.areaPending}
          </Text>
        </HStack>
      </Stack>

      {locateUnavailable ? (
        <Text fontSize="sm" color="text.muted">
          {t.locateUnavailable}
        </Text>
      ) : null}

      <FormField
        label={
          <HStack as="span" gap={1.5}>
            <LuLock size={14} aria-hidden />
            {t.addressLabel}
          </HStack>
        }
        required
        helperText={t.addressHelper}
        errorText={taskFieldError(copy.errors, streetAddressError)}
      >
        <Stack gap={2}>
          <Input
            {...streetAddress}
            placeholder={t.addressPlaceholder}
            onBlur={(event) => {
              streetAddress.onBlur(event)
              onStreetAddressBlur?.()
            }}
          />
          {onUsePinAddress ? (
            <Button
              type="button"
              variant="secondary"
              alignSelf="flex-start"
              disabled={!pinAddress.trim()}
              onClick={onUsePinAddress}
            >
              <LuMapPin size={14} aria-hidden />
              {t.usePinAddress}
            </Button>
          ) : null}
        </Stack>
      </FormField>

      {locationError ? (
        <Text fontSize="sm" color="status.danger.fg" role="alert">
          {taskFieldError(copy.errors, locationError)}
        </Text>
      ) : null}
    </Stack>
  )
}
