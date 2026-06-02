'use client'

import type { ReactNode } from 'react'

import { Box, HStack, Text } from '@chakra-ui/react'

/** Label style aligned with `SectionCard` eyebrow and filter section titles. */
export const metaSectionLabelProps = {
  fontSize: 'xs',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'formLabelMuted',
}

export function MetaRow({
  label,
  children,
  icon,
  secondaryLine,
}: {
  label: string
  children: ReactNode
  icon: ReactNode
  /** Muted subline under the value (e.g. distance). */
  secondaryLine?: string
}) {
  return (
    <HStack align="flex-start" gap={3}>
      <Box flexShrink={0} color="formLabelMuted" mt={0.5} aria-hidden>
        {icon}
      </Box>
      <Box flex={1} minW={0}>
        <Text {...metaSectionLabelProps} mb={1}>
          {label}
        </Text>
        <Box fontSize="sm" fontWeight={700} color="cardFg" lineHeight="short">
          {children}
        </Box>
        {secondaryLine ? (
          <Text
            fontSize="xs"
            color="formLabelMuted"
            lineHeight="short"
            mt={1.5}
          >
            {secondaryLine}
          </Text>
        ) : null}
      </Box>
    </HStack>
  )
}
