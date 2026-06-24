'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'

import { useUserStore } from '@/app/(auth)/store/user'
import { workerSetupHref } from '@/app/(worker)/worker/setup/helpers/workerSetupHref'
import { Button, Card, Link } from '@ui'

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
    <Card
      layout="section"
      p={{ base: 5, md: 6 }}
      bg="status.success.soft"
      borderColor="green.200"
    >
      <Stack gap={4}>
        <Stack gap={1}>
          <Text fontSize="sm" fontWeight={700} color="status.success.fg">
            Worker setup in progress
          </Text>
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            You are {percent}% through onboarding. Pick up at{' '}
            <Text as="span" fontWeight={600} color="text.default">
              {stepLabel}
            </Text>{' '}
            to unlock quoting on tasks.
          </Text>
        </Stack>
        <HStack gap={3} flexWrap="wrap">
          <Link
            href={workerSetupHref('/profile')}
            _hover={{ textDecoration: 'none' }}
          >
            <Button size="sm" variant="primary">
              Continue setup
            </Button>
          </Link>
          <Text fontSize="xs" color="text.muted">
            Progress is saved automatically as you go.
          </Text>
        </HStack>
      </Stack>
    </Card>
  )
}
