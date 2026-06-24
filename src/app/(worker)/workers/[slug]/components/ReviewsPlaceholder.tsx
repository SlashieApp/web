'use client'

import { Text } from '@chakra-ui/react'

import { Card } from '@ui'

export function ReviewsPlaceholder() {
  return (
    <Card layout="section" eyebrow="Reviews" heading="Reviews">
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        Reviews are coming soon. Slashie will show verified feedback from
        completed tasks here once this feature launches.
      </Text>
    </Card>
  )
}
