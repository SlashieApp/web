'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuLock } from 'react-icons/lu'

export function TaskQuotePrivateCallout() {
  return (
    <HStack align="start" gap={3} p={4} rounded="xl" bg="green.100">
      <Box color="green.600" mt={0.5} flexShrink={0}>
        <LuLock size={20} aria-hidden />
      </Box>
      <Stack gap={1}>
        <Text fontWeight={700} fontSize="sm" color="secondary.900">
          Quotes are private
        </Text>
        <Text fontSize="sm" color="formLabelMuted">
          Your quote will be visible to the customer once you send it.
        </Text>
      </Stack>
    </HStack>
  )
}
