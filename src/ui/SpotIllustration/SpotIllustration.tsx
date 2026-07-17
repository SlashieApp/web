'use client'

import { Box } from '@chakra-ui/react'

/**
 * SDL Spot Line illustrations — small line-art spots for empty / zero-data UI.
 * Stroke rides `action.primary` (green ink) with muted supporting strokes.
 *
 * Variants map to the design-system Spot Line sheet:
 * - `quotes` — houses + person + chat bubble (no quotes / marketplace empty).
 * - `reviews` — E04: chair + lamp + heart speech bubble.
 * - `no-work` — E14: briefcase + sparkles.
 */
export type SpotIllustrationVariant = 'quotes' | 'reviews' | 'no-work'

export type SpotIllustrationProps = {
  variant: SpotIllustrationVariant
  /** Rendered width in px (SVG scales, 4:3 ratio). */
  width?: number
}

/** Houses + person + chat bubble (marketplace / quotes empty). */
function QuotesSpot() {
  return (
    <svg
      width="120"
      height="84"
      viewBox="0 0 120 84"
      fill="none"
      role="presentation"
    >
      <title>No quotes illustration</title>
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.35"
      >
        <path d="M10 70V52l12-9 12 9v18" />
        <path d="M86 70V54l11-8 11 8v16" />
      </g>
      <path
        d="M4 70h112"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="60" cy="50" r="7" />
        <path d="M48 70c0-7 5-12 12-12s12 5 12 12" />
      </g>
      <g stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M44 12h32a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H62l-9 8v-8h-9a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6Z" />
        <path d="M52 24h16M52 30h10" strokeLinecap="round" opacity="0.6" />
      </g>
    </svg>
  )
}

/** E04 — chair + floor lamp + heart bubble. */
function ReviewsSpot() {
  return (
    <svg
      width="140"
      height="104"
      viewBox="0 0 140 104"
      fill="none"
      role="presentation"
    >
      <title>No reviews illustration</title>
      {/* ground */}
      <path
        d="M14 92h112"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* chair */}
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M38 50v22m0 0v20m0-20h26m0-20v20m0 0v20" />
        <path d="M38 50c0-8 4-14 13-14s13 6 13 14v10H38V50Z" />
        <path d="M34 66h34v6H34z" />
      </g>
      {/* lamp */}
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      >
        <path d="M96 92V46" />
        <path d="M86 92h20" />
        <path d="M86 46l10-14 10 14H86Z" />
      </g>
      {/* heart speech bubble */}
      <g stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M84 8h30a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6h-12l-8 7v-7h-10a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6Z" />
        <path
          d="M99 24c-3-2.4-6-4.8-6-7.4 0-1.9 1.5-3.3 3.3-3.3 1.1 0 2.1.5 2.7 1.4a3.3 3.3 0 0 1 2.7-1.4c1.8 0 3.3 1.4 3.3 3.3 0 2.6-3 5-6 7.4Z"
          fill="currentColor"
          opacity="0.75"
        />
      </g>
      {/* plant pot accent */}
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      >
        <path d="M117 92v-6m0 0c-4 0-6-3-6-7 4 0 6 3 6 7Zm0 0c4 0 6-3 6-7-4 0-6 3-6 7Z" />
        <path d="M112 92h10" />
      </g>
    </svg>
  )
}

/** E14 — briefcase + sparkles. */
function NoWorkSpot() {
  return (
    <svg
      width="140"
      height="104"
      viewBox="0 0 140 104"
      fill="none"
      role="presentation"
    >
      <title>No completed jobs illustration</title>
      {/* ground */}
      <path
        d="M18 90h104"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* briefcase */}
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="40" y="42" width="60" height="42" rx="7" />
        <path d="M58 42v-6a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v6" />
        <path d="M40 60h60" opacity="0.7" />
        <path d="M66 56h8v8h-8z" />
      </g>
      {/* sparkles */}
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      >
        <path d="M112 30v10M107 35h10" />
        <path d="M30 22v8M26 26h8" />
        <path d="M104 14v6M101 17h6" />
      </g>
    </svg>
  )
}

/** Line-art spot for empty states; green ink via `action.primary`. */
export function SpotIllustration({
  variant,
  width = 140,
}: SpotIllustrationProps) {
  const art =
    variant === 'quotes' ? (
      <QuotesSpot />
    ) : variant === 'reviews' ? (
      <ReviewsSpot />
    ) : (
      <NoWorkSpot />
    )

  return (
    <Box
      aria-hidden
      color="action.primary"
      lineHeight="0"
      display="inline-flex"
      justifyContent="center"
      w={`${width}px`}
      css={{ '& svg': { width: '100%', height: 'auto' } }}
    >
      {art}
    </Box>
  )
}
