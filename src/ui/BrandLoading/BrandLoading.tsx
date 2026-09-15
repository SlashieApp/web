'use client'

import { Box, type BoxProps, Stack } from '@chakra-ui/react'
import type { ReactNode, Ref } from 'react'

import { Logo } from '../Logo/Logo'
import { ProgressBar } from '../ProgressBar/ProgressBar'

export type BrandLoadingProps = Omit<BoxProps, 'ref'> & {
  /** Caption under the indeterminate bar. Omit for a silent branded wait. */
  label?: ReactNode
  /** Accessible name for the progress track. */
  trackLabel?: string
  /** Mount callback / host element. Auth gates hydrate session from this node. */
  ref?: Ref<HTMLDivElement>
}

/**
 * Branded wait state: Slashie wordmark plus an indeterminate progress bar.
 * Presentational — callers own copy via `label` / `trackLabel`.
 */
export function BrandLoading({
  label,
  trackLabel = 'Loading',
  ref,
  ...rest
}: BrandLoadingProps) {
  return (
    <Box
      minH="100dvh"
      bg="bg.canvas"
      color="text.default"
      display="flex"
      alignItems="center"
      justifyContent="center"
      {...rest}
      ref={ref}
    >
      <Stack align="center" gap={5} px={6} w="full" maxW="16rem">
        <Box
          minH={{ base: '24px', md: '32px' }}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Logo size="md" />
        </Box>
        <ProgressBar
          indeterminate
          label={label}
          trackLabel={trackLabel}
          w="full"
        />
      </Stack>
    </Box>
  )
}
