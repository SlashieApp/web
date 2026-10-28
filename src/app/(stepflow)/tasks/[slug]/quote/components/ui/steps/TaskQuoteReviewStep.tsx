'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import {
  formatTimeSlotLabel,
  timeSlotDraftStart,
  timeSlotInputsFromDrafts,
} from '@/utils/timeSlots'

import bag from '../../../i11n.json'

type TaskQuoteReviewStepProps = {
  photoUrls: string[]
}

function formatReviewPrice(pence: number): string | null {
  if (pence <= 0) return null
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pence / 100)
}

export function TaskQuoteReviewStep({ photoUrls }: TaskQuoteReviewStepProps) {
  const { quoteAmountInput, quoteMessageInput, quoteSlots } = useTaskDetail()
  const copy = useI11n(bag)
  const locale = useLocale() === 'zh-hk' ? 'zh-HK' : 'en-GB'
  const times = quoteSlots.flatMap((draft) => {
    const start = timeSlotDraftStart(draft)
    if (!start) return []
    const [input] = timeSlotInputsFromDrafts([draft])
    const end =
      input?.durationMinutes != null
        ? new Date(start.getTime() + input.durationMinutes * 60_000)
        : null
    return [formatTimeSlotLabel({ start, end }, locale)]
  })

  const pence = Number(quoteAmountInput) || 0
  const reviewPriceLabel = formatReviewPrice(pence) ?? copy.review.noPrice
  const message = quoteMessageInput.trim()

  return (
    <Stack gap={5}>
      <Stack gap={2}>
        <Text fontWeight={500} fontSize="sm" color="text.link">
          {copy.review.price}
        </Text>
        <Text fontSize="md" color="text.link">
          {reviewPriceLabel}
        </Text>
      </Stack>

      {times.length > 0 ? (
        <Stack gap={2}>
          <Text fontWeight={500} fontSize="sm" color="text.link">
            {copy.proposedTimes}
          </Text>
          {times.map((label) => (
            <Text key={label} fontSize="sm" color="text.link">
              {label}
            </Text>
          ))}
        </Stack>
      ) : null}

      <Stack gap={2}>
        <Text fontWeight={500} fontSize="sm" color="text.link">
          {copy.review.message}
        </Text>
        <Text fontSize="sm" color="text.link" whiteSpace="pre-wrap">
          {message || copy.review.noMessage}
        </Text>
      </Stack>

      {photoUrls.length > 0 ? (
        <Stack gap={2}>
          <Text fontWeight={500} fontSize="sm" color="text.link">
            {copy.review.photos}
          </Text>
          <HStack gap={2} flexWrap="wrap">
            {photoUrls.map((url, i) => (
              <Box key={url} w="72px" h="72px" rounded="lg" overflow="hidden">
                <img
                  src={url}
                  alt={formatMessage(copy.photos.alt, { number: i + 1 })}
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
