import { Stack, Text } from '@chakra-ui/react'

import { Card, SpotIllustration } from '@ui'

/**
 * Reviews list. `ratingSummary` / review data ship with BE-36 + the reviews
 * stage; until then this renders the E04 (chair + lamp) empty state.
 */
export function WorkerReviewsSection() {
  return (
    <Card layout="section" heading="Reviews">
      <Stack align="center" textAlign="center" gap={3} py={4} px={2} w="full">
        <SpotIllustration variant="reviews" />
        <Stack gap={1} align="center">
          <Text fontSize="lg" fontWeight={600} color="text.default">
            No reviews yet
          </Text>
          <Text fontSize="sm" color="text.muted" maxW="320px">
            Reviews appear after completed jobs.
          </Text>
        </Stack>
      </Stack>
    </Card>
  )
}
