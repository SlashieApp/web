import { Stack, Text } from '@chakra-ui/react'

import { publicRatingAverage } from '@/content/reviews/reviewModel'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Card, SpotIllustration } from '@ui'

import bag from '../../../i11n.json'

type RatingSummary = {
  average?: number | null
  count?: number | null
}

/**
 * Public reviews stay empty until review bodies ship. The average is hidden
 * until there are at least three ratings.
 */
export function WorkerReviewsSection({
  summary,
}: {
  summary?: RatingSummary | null
}) {
  const t = useI11n(bag)
  const count = summary?.count ?? 0
  const average = publicRatingAverage(summary)
  const title =
    count <= 0
      ? t.reviewsNone
      : average == null
        ? formatMessage(count === 1 ? t.reviewsCountOne : t.reviewsCount, {
            count,
          })
        : formatMessage(t.reviewsAverage, {
            average: average.toFixed(1),
            count,
          })

  return (
    <Card layout="section" heading={t.reviewsHeading}>
      <Stack align="center" textAlign="center" gap={3} py={4} px={2} w="full">
        <SpotIllustration variant="reviews" />
        <Stack gap={1} align="center">
          <Text fontSize="lg" fontWeight={600} color="text.default">
            {title}
          </Text>
          <Text fontSize="sm" color="text.muted" maxW="320px">
            {count > 0 && average == null
              ? t.reviewsThreshold
              : t.reviewsEmptyBody}
          </Text>
        </Stack>
      </Stack>
    </Card>
  )
}
