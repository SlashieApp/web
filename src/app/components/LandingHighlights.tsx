'use client'

import { SimpleGrid, Stack } from '@chakra-ui/react'
import { Heading, Text } from '@ui'

import { GlassCard } from '../../ui/Card/GlassCard'

const highlights = [
  {
    title: 'Post in minutes',
    body: 'Share a small job with location, timing, and budget.',
  },
  {
    title: 'Get clear offers',
    body: 'Workers reply with availability and upfront pricing.',
  },
  {
    title: 'Book with confidence',
    body: 'Pick the best fit and keep everything in one thread.',
  },
]

export function LandingHighlights() {
  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
      {highlights.map((card) => (
        <GlassCard key={card.title} p={5} bg="surfaceContainerLowest">
          <Stack gap={2}>
            <Heading size="sm">{card.title}</Heading>
            <Text color="muted">{card.body}</Text>
          </Stack>
        </GlassCard>
      ))}
    </SimpleGrid>
  )
}
