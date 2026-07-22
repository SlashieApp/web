'use client'

import { Box, HStack, Text } from '@chakra-ui/react'
import { LuLock } from 'react-icons/lu'

import { WorkerContactButton } from './WorkerContactButton'

/** Mobile-only sticky bottom Contact bar (above the safe area). */
export function WorkerContactStickyBar() {
  return (
    <Box
      display={{ base: 'block', lg: 'none' }}
      position="fixed"
      insetX={0}
      bottom={0}
      zIndex={10}
      bg="bg.surface"
      borderTopWidth="1px"
      borderColor="border.default"
      px={4}
      pt={3}
      pb="calc(0.75rem + env(safe-area-inset-bottom))"
      boxShadow="0 -4px 16px rgba(11, 23, 20, 0.08)"
    >
      <WorkerContactButton size="lg" />
      <HStack gap={1.5} justify="center" pt={2} color="text.muted">
        <Box as="span" display="inline-flex" aria-hidden>
          <LuLock size={12} strokeWidth={2} />
        </Box>
        <Text fontSize="xs">Your details are safe</Text>
      </HStack>
    </Box>
  )
}
