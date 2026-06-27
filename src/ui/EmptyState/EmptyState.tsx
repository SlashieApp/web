'use client'

import { Box, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

/**
 * SDL EmptyState — centred illustration + title + body + actions slot. Used for
 * the task-detail "No quotes yet" card and other zero-data states. SDL roles only.
 */
export type EmptyStateProps = {
  /** Illustration node; defaults to the marketplace "quotes" line art. */
  illustration?: ReactNode
  title: string
  description?: string
  /** Action controls (Buttons / Links), stacked under the copy. */
  children?: ReactNode
}

/** Default line illustration: small houses + a person + a chat bubble. */
function QuotesIllustration() {
  return (
    <Box aria-hidden color="action.primary" lineHeight="0">
      <svg
        width="120"
        height="84"
        viewBox="0 0 120 84"
        fill="none"
        role="presentation"
      >
        <title>No quotes illustration</title>
        {/* houses */}
        <g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.35"
        >
          <path d="M10 70V52l12-9 12 9v18" />
          <path d="M86 70V54l11-8 11 8v16" />
        </g>
        {/* ground line */}
        <path
          d="M4 70h112"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.35"
        />
        {/* person */}
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="60" cy="50" r="7" />
          <path d="M48 70c0-7 5-12 12-12s12 5 12 12" />
        </g>
        {/* chat bubble */}
        <g stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
          <path d="M44 12h32a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H62l-9 8v-8h-9a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6Z" />
          <path d="M52 24h16M52 30h10" strokeLinecap="round" opacity="0.6" />
        </g>
      </svg>
    </Box>
  )
}

export function EmptyState({
  illustration,
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <Stack align="center" textAlign="center" gap={3} py={4} px={2} w="full">
      {illustration ?? <QuotesIllustration />}
      <Stack gap={1} align="center">
        <Text fontSize="lg" fontWeight={600} color="text.default">
          {title}
        </Text>
        {description ? (
          <Text fontSize="sm" color="text.muted" maxW="320px">
            {description}
          </Text>
        ) : null}
      </Stack>
      {children ? (
        <Stack gap={2} w="full" maxW="320px" pt={1}>
          {children}
        </Stack>
      ) : null}
    </Stack>
  )
}
