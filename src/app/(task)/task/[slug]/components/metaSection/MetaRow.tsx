'use client'

import type { ReactNode } from 'react'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

export function MetaRow({
  label,
  children,
  icon,
}: {
  label: string
  children: ReactNode
  icon: ReactNode
}) {
  return (
    <HStack align="flex-start" gap={3}>
      <Box flexShrink={0} color="formLabelMuted" mt={0.5} aria-hidden>
        {icon}
      </Box>
      <Stack gap={0} flex={1} minW={0}>
        <Text fontSize="xs" fontWeight={600} color="formLabelMuted">
          {label}
        </Text>
        <Box fontSize="sm" fontWeight={600} color="cardFg" lineHeight="short">
          {children}
        </Box>
      </Stack>
    </HStack>
  )
}
