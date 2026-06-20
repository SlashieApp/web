'use client'

import { Box, type BoxProps, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export type ProgressBarProps = {
  /** Completion percentage, clamped to 0–100. */
  value: number
  /** Optional caption rendered below the track (e.g. "Step 2 of 5"). */
  label?: ReactNode
  /** Accessible label for the progress track. */
  trackLabel?: string
  /** Track height token/value. */
  trackHeight?: BoxProps['h']
} & Omit<BoxProps, 'children'>

/** Universal linear progress indicator with an optional caption. */
export function ProgressBar({
  value,
  label,
  trackLabel = 'Progress',
  trackHeight = '4px',
  ...rest
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <Box w="full" {...rest}>
      <Box
        h={trackHeight}
        borderRadius="full"
        bg="neutral.200"
        overflow="hidden"
        mb={label ? 2 : 0}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={trackLabel}
      >
        <Box
          h="full"
          w={`${clamped}%`}
          bg="primary"
          transition="width 0.2s ease"
        />
      </Box>
      {label ? (
        <Text fontSize="xs" fontWeight={600} color="formLabelMuted">
          {label}
        </Text>
      ) : null}
    </Box>
  )
}
