'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
}) {
  return (
    <Stack gap={1}>
      <Text
        fontSize="xs"
        fontWeight={700}
        letterSpacing="0.08em"
        color="status.success.fg"
      >
        {eyebrow}
      </Text>
      <Heading
        as="h1"
        fontSize={{ base: '2xl', md: '3xl' }}
        letterSpacing="-0.02em"
      >
        {title}
      </Heading>
      {description ? (
        typeof description === 'string' ? (
          <Text color="text.muted" fontSize="sm">
            {description}
          </Text>
        ) : (
          <Box color="text.muted" fontSize="sm">
            {description}
          </Box>
        )
      ) : null}
    </Stack>
  )
}
