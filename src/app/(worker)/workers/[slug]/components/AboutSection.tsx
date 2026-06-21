'use client'

import { Stack, Text } from '@chakra-ui/react'

import { Badge, Card } from '@ui'

import { useWorkerProfile } from '../context/WorkerProfileContext'

export function AboutSection() {
  const { worker } = useWorkerProfile()
  const bio = worker.bio?.trim()
  const tagline = worker.tagline?.trim()

  if (!bio && !tagline) return null

  return (
    <Card layout="section" eyebrow="About" heading="About this worker">
      {tagline ? <Badge color="primary">{tagline}</Badge> : null}
      {bio ? (
        <Text
          fontSize="sm"
          color="cardFg"
          lineHeight="tall"
          whiteSpace="pre-wrap"
        >
          {bio}
        </Text>
      ) : (
        <Text fontSize="sm" color="formLabelMuted">
          This worker has not added a bio yet.
        </Text>
      )}
    </Card>
  )
}
