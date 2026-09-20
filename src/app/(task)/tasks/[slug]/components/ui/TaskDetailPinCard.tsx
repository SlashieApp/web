'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Card } from '@ui'

type TaskDetailPinCardProps = {
  title: ReactNode
  subtitle?: ReactNode
  leading?: ReactNode
  action?: ReactNode
}

/**
 * Compact bottom-pin chrome: two text rows max, CTA on the right.
 */
export function TaskDetailPinCard({
  title,
  subtitle,
  leading,
  action,
}: TaskDetailPinCardProps) {
  return (
    <Card layout="section" density="compact" maxW="full" boxShadow="e3">
      <HStack align="center" gap={3} w="full">
        {leading ? <Box flexShrink={0}>{leading}</Box> : null}
        <Stack gap={0.5} flex={1} minW={0}>
          <Text
            fontSize="md"
            fontWeight={700}
            color="text.default"
            lineHeight="short"
            lineClamp={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              fontSize="sm"
              color="text.muted"
              lineHeight="short"
              lineClamp={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </Stack>
        {action ? <Box flexShrink={0}>{action}</Box> : null}
      </HStack>
    </Card>
  )
}
