'use client'

import { Stack, Text } from '@chakra-ui/react'

type TaskQuoteStepHeadingProps = {
  title: string
  description?: string
  compact?: boolean
}

export function TaskQuoteStepHeading({
  title,
  description,
  compact = false,
}: TaskQuoteStepHeadingProps) {
  return (
    <Stack gap={compact ? 1 : 2}>
      <Text
        as="h1"
        fontSize={compact ? 'xl' : { base: '2xl', md: '3xl' }}
        fontWeight={800}
        lineHeight="short"
        color="text.default"
        letterSpacing="-0.02em"
      >
        {title}
      </Text>
      {description ? (
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {description}
        </Text>
      ) : null}
    </Stack>
  )
}
