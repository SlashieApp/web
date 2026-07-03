'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { Card } from '@ui'

function IconShield() {
  return (
    <Box color="text.link" flexShrink={0} aria-hidden>
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

export function QuotePaymentTrustCard() {
  return (
    <Card
      layout="section"
      bodyGap={3}
      bg="bg.subtle"
      borderColor="border.default"
      header={
        <Stack gap={2}>
          <Text
            fontSize="xs"
            fontWeight={700}
            color="text.muted"
            letterSpacing="0.06em"
            textTransform="uppercase"
          >
            Trust
          </Text>
          <HStack align="flex-start" gap={3}>
            <IconShield />
            <Text
              fontSize="sm"
              fontWeight={700}
              color="text.default"
              lineHeight="short"
            >
              Payments outside Slashie
            </Text>
          </HStack>
        </Stack>
      }
    >
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        Payment is arranged directly between the customer and the worker outside
        Slashie. Use the app to agree on scope and quotes; settle up using
        whatever method you both choose.
      </Text>
    </Card>
  )
}
