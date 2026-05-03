'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { Card } from '@ui'

function IconShield() {
  return (
    <Box color="primary.600" flexShrink={0} aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <title>Shield</title>
        <path
          d="M12 3 4 6v6c0 5 3.5 8.5 8 9.5 4.5-1 8-4.5 8-9.5V6l-8-3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

export function TaskDetailPaymentTrustCard() {
  return (
    <Card
      p={5}
      maxW="full"
      w="full"
      bg="neutral.100"
      borderWidth="1px"
      borderColor="cardBorder"
    >
      <HStack align="flex-start" gap={3}>
        <IconShield />
        <Stack gap={1}>
          <Text
            fontSize="sm"
            fontWeight={700}
            color="cardFg"
            lineHeight="short"
          >
            Payments outside Slashie
          </Text>
          <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
            Payment is arranged directly between the customer and the worker
            outside Slashie. Use the app to agree on scope and quotes; settle up
            using whatever method you both choose.
          </Text>
        </Stack>
      </HStack>
    </Card>
  )
}
