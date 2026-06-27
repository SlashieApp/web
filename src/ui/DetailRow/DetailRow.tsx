'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

/**
 * SDL DetailRow — a labelled metadata row: leading icon, label, value, and an
 * optional muted sub-line. Used in the task-detail "Task details" card and
 * anywhere icon + label + value rows are needed. References SDL roles only.
 */
export type DetailRowProps = {
  /** Leading glyph (icon node). Rendered in a muted pod, decorative. */
  icon: ReactNode
  label: string
  /** Primary value — string or rich node (e.g. value + trailing badge). */
  children: ReactNode
  /** Muted secondary line under the value. */
  subLine?: string
  /** Hairline divider below the row (for stacked lists). */
  withDivider?: boolean
}

export function DetailRow({
  icon,
  label,
  children,
  subLine,
  withDivider = false,
}: DetailRowProps) {
  return (
    <HStack
      align="flex-start"
      gap={3}
      py={3}
      borderBottomWidth={withDivider ? '1px' : '0'}
      borderColor="border.default"
    >
      <Box
        aria-hidden
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        boxSize="20px"
        mt="2px"
        color="text.muted"
      >
        {icon}
      </Box>
      <Box minW="84px" flexShrink={0} pt="1px">
        <Text fontSize="sm" color="text.muted" fontWeight={500}>
          {label}
        </Text>
      </Box>
      <Stack gap={0.5} flex="1" minW={0}>
        <Box fontSize="sm" fontWeight={600} color="text.default">
          {children}
        </Box>
        {subLine ? (
          <Text fontSize="sm" color="text.muted" fontWeight={400}>
            {subLine}
          </Text>
        ) : null}
      </Stack>
    </HStack>
  )
}
