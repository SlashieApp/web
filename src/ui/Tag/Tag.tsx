'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type VariantVisual = {
  color: string
  borderColor: string
  bg: string
  leading: ReactNode
}

function IconClockSmall() {
  return (
    <Box
      as="span"
      display="inline-flex"
      w="14px"
      h="14px"
      flexShrink={0}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Pending</title>
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M12 7v5l3 2"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 12a7 7 0 0 1 12-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

function LeadingDot() {
  return (
    <Box
      as="span"
      w="6px"
      h="6px"
      borderRadius="full"
      bg="currentColor"
      flexShrink={0}
      aria-hidden
    />
  )
}

/** Maps to semantic tokens in `theme/system.ts` (light vs dark per active Chakra system). */
function variantVisual(
  variant: 'active' | 'pending' | 'urgent',
): VariantVisual {
  switch (variant) {
    case 'active':
      return {
        color: 'tagActiveFg',
        borderColor: 'tagActiveBorder',
        bg: 'tagActiveBg',
        leading: <LeadingDot />,
      }
    case 'pending':
      return {
        color: 'tagPendingFg',
        borderColor: 'tagPendingBorder',
        bg: 'tagPendingBg',
        leading: <IconClockSmall />,
      }
    case 'urgent':
      return {
        color: 'tagUrgentFg',
        borderColor: 'tagUrgentBorder',
        bg: 'tagUrgentBg',
        leading: null,
      }
    default: {
      const _x: never = variant
      return _x
    }
  }
}

export type TagProps = Omit<BoxProps, 'children'> & {
  variant: 'active' | 'pending' | 'urgent'
  children: ReactNode
}

export function Tag({ variant, children, gap = 1.5, ...rest }: TagProps) {
  const v = variantVisual(variant)

  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      columnGap={gap}
      w="fit-content"
      borderRadius="full"
      borderWidth="1px"
      borderColor={v.borderColor}
      bg={v.bg}
      color={v.color}
      px={4}
      py={1.5}
      fontFamily="heading"
      fontSize="xs"
      fontWeight={700}
      letterSpacing="0.06em"
      textTransform="uppercase"
      lineHeight="1.2"
      {...rest}
    >
      {v.leading}
      {children}
    </Box>
  )
}
