'use client'

import { Box, type BoxProps, Stack, Text } from '@chakra-ui/react'
import type { Ref } from 'react'

import { useI11n } from '@/i18n/useI11n'

import { Logo } from '../Logo/Logo'
import { ProgressBar } from '../ProgressBar/ProgressBar'
import bag from './i11n.json'

export type PageLoadingProps = Omit<BoxProps, 'children'> & {
  /** Visible status line. Defaults to the colocated “Just a moment” copy. */
  label?: string
  /** Mount callback for auth gates that hydrate on first attach. */
  ref?: Ref<HTMLDivElement>
}

/**
 * Branded full-page loading state: wordmark + indeterminate green bar.
 * Use on auth gates and other session waits instead of a blank canvas.
 */
export function PageLoading({
  label,
  minH = '100dvh',
  bg = 'bg.subtle',
  ...rest
}: PageLoadingProps) {
  const t = useI11n(bag)
  const status = label ?? t.label

  return (
    <Box
      as="output"
      minH={minH}
      bg={bg}
      color="text.default"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={6}
      aria-live="polite"
      aria-busy="true"
      {...rest}
    >
      <Stack gap={5} align="center" w="full" maxW="16rem">
        <Logo size="lg" />
        <ProgressBar
          indeterminate
          size="sm"
          w="full"
          maxW="10rem"
          trackLabel={t.trackLabel}
        />
        <Text
          fontSize="sm"
          fontWeight={500}
          color="text.muted"
          textAlign="center"
        >
          {status}
        </Text>
      </Stack>
    </Box>
  )
}
