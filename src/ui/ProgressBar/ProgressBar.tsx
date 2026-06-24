'use client'

import { Box, type BoxProps, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { sdlMotion } from '@/theme/styles'

/**
 * SDL ProgressBar. A linear progress indicator with an optional caption.
 *
 * Tones map to SDL semantic roles: `default` uses `action.primary` (green ink
 * fill), the status tones use `status.<family>.solid`. GREEN-INK is not a
 * concern here — the fill carries no text — but the bar never signals state by
 * color alone: the `error` state pairs the fill with a status dot + caption via
 * the `label` prop.
 *
 * Motion: the fill animates `transform` only (scaleX) so we never trigger layout
 * and we honor `prefers-reduced-motion` (animation/transition disabled).
 */
export type ProgressBarTone =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  // legacy aliases (migration): resolve to a tone below
  | 'primary'
  | 'error'

export type ProgressBarSize = 'sm' | 'md' | 'lg'

export type ProgressBarProps = {
  /** Completion percentage, clamped to 0–100. Ignored when `indeterminate`. */
  value?: number
  /** Optional caption rendered below the track (e.g. "Step 2 of 5"). */
  label?: ReactNode
  /** Accessible label for the progress track. */
  trackLabel?: string
  /** Visual + semantic tone of the fill. */
  tone?: ProgressBarTone
  /** Track height preset. `trackHeight` overrides this if provided. */
  size?: ProgressBarSize
  /** Explicit track height token/value (overrides `size`). */
  trackHeight?: BoxProps['h']
  /** Loading state — renders an indeterminate animated fill. */
  indeterminate?: boolean
  /** Error state — forces the danger tone and renders a status dot beside the caption. */
  error?: boolean
} & Omit<BoxProps, 'children'>

type SdlTone = 'default' | 'success' | 'warning' | 'danger' | 'info'

const toneAlias: Record<ProgressBarTone, SdlTone> = {
  default: 'default',
  primary: 'default',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  error: 'danger',
  info: 'info',
}

/** Fill color per tone — `default` is the brand green action fill. */
function toneFill(tone: SdlTone): string {
  return tone === 'default' ? 'action.primary' : `status.${tone}.solid`
}

const sizeHeights: Record<ProgressBarSize, BoxProps['h']> = {
  sm: '4px',
  md: '6px',
  lg: '8px',
}

/**
 * Indeterminate sweep — animates `transform` only. Wrapped in a reduced-motion
 * guard so users who opt out see a static, calm fill instead of motion.
 */
const indeterminateAnimation = {
  position: 'absolute',
  insetBlock: 0,
  insetInline: 0,
  transformOrigin: 'left center',
  animation: `sdl-progress-indeterminate 1.2s ${sdlMotion.easing.standard} infinite`,
  '@keyframes sdl-progress-indeterminate': {
    '0%': { transform: 'scaleX(0.15) translateX(0%)' },
    '50%': { transform: 'scaleX(0.45) translateX(120%)' },
    '100%': { transform: 'scaleX(0.15) translateX(560%)' },
  },
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    transform: 'scaleX(0.4)',
  },
}

/** Universal linear progress indicator with an optional caption. */
export function ProgressBar({
  value = 0,
  label,
  trackLabel = 'Progress',
  tone = 'default',
  size = 'sm',
  trackHeight,
  indeterminate = false,
  error = false,
  ...rest
}: ProgressBarProps) {
  const resolvedTone: SdlTone = error ? 'danger' : toneAlias[tone]
  const fill = toneFill(resolvedTone)
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const height = trackHeight ?? sizeHeights[size]

  return (
    <Box w="full" {...rest}>
      <Box
        h={height}
        borderRadius="full"
        bg="bg.subtle"
        overflow="hidden"
        position="relative"
        mb={label ? 2 : 0}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-busy={indeterminate || undefined}
        aria-label={trackLabel}
      >
        {indeterminate ? (
          <Box
            h="full"
            w="full"
            borderRadius="full"
            bg={fill}
            css={indeterminateAnimation}
          />
        ) : (
          <Box
            h="full"
            w="full"
            borderRadius="full"
            bg={fill}
            transformOrigin="left center"
            transform={`scaleX(${clamped / 100})`}
            transitionProperty="transform"
            transitionDuration={sdlMotion.duration.moderate}
            transitionTimingFunction={sdlMotion.easing.standard}
            css={{
              '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
              },
            }}
          />
        )}
      </Box>
      {label ? (
        <Box display="flex" alignItems="center" gap={1.5}>
          {error ? (
            <Box
              as="span"
              aria-hidden
              boxSize="6px"
              borderRadius="full"
              bg="status.danger.solid"
              flexShrink={0}
            />
          ) : null}
          <Text
            fontSize="xs"
            fontWeight={600}
            color={error ? 'status.danger.fg' : 'text.muted'}
          >
            {label}
          </Text>
        </Box>
      ) : null}
    </Box>
  )
}
