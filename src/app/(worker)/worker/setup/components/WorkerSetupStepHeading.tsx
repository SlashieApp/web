'use client'

import { Stack, Text } from '@chakra-ui/react'

type WorkerSetupStepHeadingProps = {
  title: string
  description?: string
  compact?: boolean
}

export function WorkerSetupStepHeading({
  title,
  description,
  compact = false,
}: WorkerSetupStepHeadingProps) {
  return (
    <Stack gap={compact ? 1 : 2}>
      <Text
        as="h1"
        fontSize={compact ? 'xl' : { base: '2xl', md: '3xl' }}
        fontWeight={800}
        lineHeight="short"
        color="cardFg"
      >
        {title}
      </Text>
      {description ? (
        <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
          {description}
        </Text>
      ) : null}
    </Stack>
  )
}
