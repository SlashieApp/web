'use client'

import { Box, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { Card } from '@ui'

import { useWorkerProfile } from '../../context/WorkerProfileContext'
import { workerFirstName } from '../../helpers/workerProfileHelpers'

/** Bio length past which mobile shows a Read more collapse. */
const COLLAPSE_THRESHOLD = 220

export function WorkerAboutSection() {
  const { worker } = useWorkerProfile()
  const [expanded, setExpanded] = useState(false)
  const bio = worker.bio?.trim()
  const firstName = workerFirstName(worker)

  const fallback = `${firstName} has not written an intro yet. Their skills, service area, and trust signals are shown on this page.`
  const collapsible = Boolean(bio && bio.length > COLLAPSE_THRESHOLD)

  return (
    <Card layout="section" heading="About">
      <Text
        color="text.muted"
        lineHeight="tall"
        whiteSpace="pre-line"
        lineClamp={
          collapsible && !expanded ? { base: 3, md: 'none' } : undefined
        }
      >
        {bio || fallback}
      </Text>
      {collapsible ? (
        <Box display={{ base: 'block', md: 'none' }} pt={1}>
          <Text
            as="button"
            fontSize="sm"
            fontWeight={700}
            color="text.link"
            cursor="pointer"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Show less' : 'Read more'}
          </Text>
        </Box>
      ) : null}
    </Card>
  )
}
