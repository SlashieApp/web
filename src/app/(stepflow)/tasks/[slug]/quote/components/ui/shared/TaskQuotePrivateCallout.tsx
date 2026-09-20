'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuLock } from 'react-icons/lu'

export function TaskQuotePrivateCallout() {
  return (
    <HStack align="start" gap={3} p={4} rounded="xl" bg="status.success.soft">
      <Box color="status.success.fg" mt={0.5} flexShrink={0}>
        <LuLock size={20} aria-hidden />
      </Box>
      <Stack gap={1}>
        <Text fontWeight={700} fontSize="sm" color="text.link">
          Quotes are private
        </Text>
        <Text fontSize="sm" color="text.muted">
          Your quote will be visible to the customer once you send it.
        </Text>
      </Stack>
    </HStack>
  )
}
