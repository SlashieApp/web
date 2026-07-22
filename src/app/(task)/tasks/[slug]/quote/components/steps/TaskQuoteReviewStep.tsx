'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { useTaskDetail } from '../../../context/TaskDetailProvider'

type TaskQuoteReviewStepProps = {
  photoUrls: string[]
}

function formatReviewPrice(pence: number): string {
  if (pence <= 0) return '—'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pence / 100)
}

export function TaskQuoteReviewStep({ photoUrls }: TaskQuoteReviewStepProps) {
  const { quoteAmountInput, quoteMessageInput, quoteAvailabilityInput } =
    useTaskDetail()

  const pence = Number(quoteAmountInput) || 0
  const reviewPriceLabel = formatReviewPrice(pence)

  return (
    <Stack gap={5}>
      <Stack gap={2}>
        <Text fontWeight={700} fontSize="sm" color="text.link">
          Your quote
        </Text>
        <Text fontSize="md" color="text.link">
          {reviewPriceLabel}
        </Text>
        {quoteAvailabilityInput.trim() ? (
          <Text fontSize="sm" color="text.muted">
            Availability: {quoteAvailabilityInput.trim()}
          </Text>
        ) : null}
      </Stack>

      <Stack gap={2}>
        <Text fontWeight={700} fontSize="sm" color="text.link">
          Message to customer
        </Text>
        <Text fontSize="sm" color="text.link" whiteSpace="pre-wrap">
          {quoteMessageInput.trim() || '—'}
        </Text>
      </Stack>

      {photoUrls.length > 0 ? (
        <Stack gap={2}>
          <Text fontWeight={700} fontSize="sm" color="text.link">
            Photos
          </Text>
          <HStack gap={2} flexWrap="wrap">
            {photoUrls.map((url) => (
              <Box key={url} w="72px" h="72px" rounded="lg" overflow="hidden">
                <img
                  src={url}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            ))}
          </HStack>
        </Stack>
      ) : null}
    </Stack>
  )
}
