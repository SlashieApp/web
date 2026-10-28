'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuEye } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'

import bag from '../../../i11n.json'

/**
 * Review step: who will see the quote once it's sent. Anyone sees the price,
 * times and message; only the customer sees the worker's name and profile
 * (FE-370).
 */
export function TaskQuoteVisibilityCallout() {
  const t = useI11n(bag).visibilityCallout
  return (
    <HStack align="start" gap={3} p={4} rounded="xl" bg="status.success.soft">
      <Box color="status.success.fg" mt={0.5} flexShrink={0}>
        <LuEye size={20} aria-hidden />
      </Box>
      <Stack gap={1}>
        <Text fontSize="sm" fontWeight={500} color="status.success.fg">
          {t.title}
        </Text>
        <Text fontSize="sm" color="text.muted">
          {t.body}
        </Text>
      </Stack>
    </HStack>
  )
}
