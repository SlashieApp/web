'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuLock, LuMapPin } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { taskFieldError } from '../../../helpers/taskFieldError'
import bag from '../../../i11n.json'

export type CreateTaskLocationSectionProps = {
  /** What workers see before accept (town at the pin); empty while looking up. */
  publicArea: string
  /** First map/location error (a copy key) from the form. */
  locationError?: string
  /** Current location was denied or unavailable. */
  locateUnavailable?: boolean
  /**
   * Edit task's one-page form: explain what workers see before accept (the
   * create flow says it in the pin step's description instead).
   */
  privacyCallout?: boolean
}

/**
 * The pin's public side (FE-70): the approximate area workers see, a hint
 * when current location is unavailable, and the map's error. The private
 * exact address is `CreateTaskAddressSection`.
 */
export function CreateTaskLocationSection({
  publicArea,
  locationError,
  locateUnavailable = false,
  privacyCallout = false,
}: CreateTaskLocationSectionProps) {
  const copy = useI11n(bag)
  const t = copy.location

  return (
    <Stack gap={2}>
      {privacyCallout ? (
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
      ) : null}
      <HStack
        gap={1.5}
        alignSelf="flex-start"
        px={3}
        py={0.5}
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

      {locateUnavailable ? (
        <Text fontSize="sm" color="text.muted">
          {t.locateUnavailable}
        </Text>
      ) : null}

      {locationError ? (
        <Text fontSize="sm" color="status.danger.fg" role="alert">
          {taskFieldError(copy.errors, locationError)}
        </Text>
      ) : null}
    </Stack>
  )
}
