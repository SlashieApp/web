'use client'

import { HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { workerVtName } from '@/app/(worker)/workers/helpers/workerCardHandoff'
import { ViewTransition } from '@/ui/ViewTransition'
import { Badge, Card } from '@ui'

import { useWorkerProfile } from '../../context/WorkerProfileContext'

const VISIBLE_SKILLS = 4

export function WorkerSkillsSection({
  skills: skillsOverride,
}: {
  skills?: readonly string[]
}) {
  const { worker, seed, workerId } = useWorkerProfile()
  const [showAll, setShowAll] = useState(false)
  const skills = skillsOverride ?? worker?.skills ?? seed?.skills ?? []
  const cleaned = skills.map((skill) => skill.trim()).filter(Boolean)
  const visible = showAll ? cleaned : cleaned.slice(0, VISIBLE_SKILLS)
  const hiddenCount = cleaned.length - visible.length
  const named = Boolean(worker || seed)

  return (
    <Card layout="section" heading="Skills">
      {cleaned.length === 0 ? (
        <Text color="text.muted">No skills listed yet.</Text>
      ) : (
        <ViewTransition
          name={named ? workerVtName('skills', workerId) : undefined}
          share="auto"
          default="none"
        >
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
        </ViewTransition>
      )}
    </Card>
  )
}
