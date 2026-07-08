'use client'

import { HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { Badge, Card } from '@ui'

const VISIBLE_SKILLS = 4

export function WorkerSkillsSection({ skills }: { skills: readonly string[] }) {
  const [showAll, setShowAll] = useState(false)
  const cleaned = skills.map((skill) => skill.trim()).filter(Boolean)
  const visible = showAll ? cleaned : cleaned.slice(0, VISIBLE_SKILLS)
  const hiddenCount = cleaned.length - visible.length

  return (
    <Card layout="section" heading="Skills">
      {cleaned.length === 0 ? (
        <Text color="text.muted">No skills listed yet.</Text>
      ) : (
        <HStack gap={2} flexWrap="wrap">
          {visible.map((skill) => (
            <Badge key={skill} variant="success" shape="pill" size="lg">
              {skill}
            </Badge>
          ))}
          {hiddenCount > 0 ? (
            <Badge
              as="button"
              variant="neutral"
              shape="pill"
              size="lg"
              cursor="pointer"
              onClick={() => setShowAll(true)}
              aria-label={`Show ${hiddenCount} more skills`}
            >
              +{hiddenCount} more
            </Badge>
          ) : null}
        </HStack>
      )}
    </Card>
  )
}
