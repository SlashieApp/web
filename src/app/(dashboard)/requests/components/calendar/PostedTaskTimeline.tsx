'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { formatDate } from '@/utils/dashboardHelpers'

import type { PostedTaskTimelineStep } from '../../../helpers/postedTaskCustomer'

export function PostedTaskTimeline({
  steps,
}: {
  steps: PostedTaskTimelineStep[]
}) {
  return (
    <Stack gap={0} w="full">
      {steps.map((step, index) => (
        <HStack
          key={step.key}
          align="flex-start"
          gap={3}
          py={2}
          borderBottomWidth={index < steps.length - 1 ? '1px' : undefined}
          borderColor="border.default"
        >
          <Box
            w={2}
            h={2}
            mt={2}
            borderRadius="full"
            bg={
              step.done
                ? 'action.primary'
                : step.current
                  ? 'status.success.solid'
                  : 'neutral.300'
            }
            flexShrink={0}
          />
          <Stack gap={0} flex={1} minW={0}>
            <Text
              fontSize="sm"
              fontWeight={step.current ? 700 : 600}
              color={step.done || step.current ? 'text.default' : 'text.muted'}
            >
              {step.label}
            </Text>
            {step.detail ? (
              <Text fontSize="xs" color="text.muted">
                {step.detail}
              </Text>
            ) : null}
            {step.at ? (
              <Text fontSize="xs" color="text.muted">
                {formatDate(step.at)}
              </Text>
            ) : null}
          </Stack>
        </HStack>
      ))}
    </Stack>
  )
}
