'use client'

import { Box, HStack } from '@chakra-ui/react'
import { LuLock } from 'react-icons/lu'

const surfaceVar = 'var(--chakra-colors-bg-surface, #FFFFFF)'

/** Frosted: the semantic surface at 92% over a blur; no blur when reduced. */
const FROSTED_CSS = {
  background: `color-mix(in srgb, ${surfaceVar} 92%, transparent)`,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  '@media (prefers-reduced-transparency: reduce), (prefers-reduced-motion: reduce)':
    {
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
    },
} as const

/**
 * "Approximate area. Exact address after booking." over the task map for
 * everyone who does not have the exact address (FE-472): a frosted pill with a
 * lock. Real text, so a screen reader announces it. It lets every gesture
 * through. Where it sits is the caller's: below lg it rides with the page
 * content (`TaskDetailMapPill`), from lg it sits in the fixed map layer.
 */
export function ApproximateAreaPill({ label }: { label: string }) {
  return (
    <HStack
      gap={1.5}
      px={2.5}
      py={1}
      minH="32px"
      borderRadius="full"
      borderWidth="1px"
      borderColor="border.default"
      boxShadow="e3"
      color="text.default"
      fontSize="13px"
      fontWeight={500}
      lineHeight="1.35"
      textAlign="center"
      pointerEvents="none"
      css={FROSTED_CSS}
    >
      <Box
        color="text.muted"
        display="flex"
        alignItems="center"
        flexShrink={0}
        aria-hidden
      >
        <LuLock size={14} />
      </Box>
      <span>{label}</span>
    </HStack>
  )
}
