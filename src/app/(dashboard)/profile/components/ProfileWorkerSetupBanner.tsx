'use client'

import { HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { useUserStore } from '@/app/(auth)/store/user'
import { workerSetupHref } from '@/app/(worker)/worker/setup/helpers/workerSetupHref'
import { Button, SectionCard } from '@ui'

import {
  isWorkerSetupInProgress,
  workerSetupCurrentStepLabel,
  workerSetupProgressPercent,
} from '../helpers/workerSetupProfileHelpers'

export function ProfileWorkerSetupBanner() {
  const me = useUserStore((s) => s.me)
  if (!me || !isWorkerSetupInProgress(me)) return null

  const percent = workerSetupProgressPercent(me)
  const stepLabel = workerSetupCurrentStepLabel(me)

  return (
    <SectionCard
      p={{ base: 5, md: 6 }}
      bg="primary.50"
      borderColor="primary.100"
    >
      <Stack gap={4}>
        <Stack gap={1}>
          <Text fontSize="sm" fontWeight={700} color="primary.800">
            Worker setup in progress
          </Text>
          <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
            You are {percent}% through onboarding. Pick up at{' '}
            <Text as="span" fontWeight={600} color="cardFg">
              {stepLabel}
            </Text>{' '}
            to unlock quoting on tasks.
          </Text>
        </Stack>
        <HStack gap={3} flexWrap="wrap">
          <Link
            as={NextLink}
            href={workerSetupHref('/profile')}
            _hover={{ textDecoration: 'none' }}
          >
            <Button size="sm" variant="primary">
              Continue setup
            </Button>
          </Link>
          <Text fontSize="xs" color="formLabelMuted">
            Progress is saved automatically as you go.
          </Text>
        </HStack>
      </Stack>
    </SectionCard>
  )
}
