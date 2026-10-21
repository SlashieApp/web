'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuLock } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'

import bag from '../../../i11n.json'

export function TaskQuotePrivateCallout() {
  const t = useI11n(bag).privateCallout
  return (
    <HStack align="start" gap={3} p={4} rounded="xl" bg="status.success.soft">
      <Box color="status.success.fg" mt={0.5} flexShrink={0}>
        <LuLock size={20} aria-hidden />
      </Box>
      <Stack gap={1}>
        <Text fontWeight={700} fontSize="sm" color="text.link">
          {t.title}
        </Text>
        <Text fontSize="sm" color="text.muted">
          {t.body}
        </Text>
      </Stack>
    </HStack>
  )
}
