import { Card, EmptyState, SpotIllustration } from '@ui'

/**
 * Reviews list. `ratingSummary` / review data ship with BE-36 + the reviews
 * stage; until then this renders the E04 (chair + lamp) empty state.
 */
export function WorkerReviewsSection() {
  return (
    <Card layout="section" heading="Reviews">
      <EmptyState
        illustration={<SpotIllustration variant="reviews" />}
        title="No reviews yet"
        description="Reviews appear after completed jobs."
      />
    </Card>
  )
}
