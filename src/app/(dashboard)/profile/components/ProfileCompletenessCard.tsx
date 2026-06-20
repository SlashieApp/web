'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { useUserStore } from '@/app/(auth)/store/user'
import { isWorkerSetupComplete } from '@/app/(worker)/worker/setup/helpers/workerSetupEligibility'
import { workerSetupHref } from '@/app/(worker)/worker/setup/helpers/workerSetupHref'
import { Badge, Button, Card, Link } from '@ui'

import {
  isWorkerSetupInProgress,
  workerSetupProgressPercent,
} from '../helpers/workerSetupProfileHelpers'
import {
  completenessPercent,
  getCompletenessItems,
  isWorkerEligible,
} from '../profileEligibility'

function CheckGlyph({ done }: { done: boolean }) {
  return (
    <Box
      w={5}
      h={5}
      borderRadius="full"
      flexShrink={0}
      display="grid"
      placeItems="center"
      fontSize="xs"
      fontWeight={800}
      bg={done ? 'primary.500' : 'badgeBg'}
      color={done ? 'black' : 'formLabelMuted'}
      aria-hidden
    >
      {done ? '✓' : '○'}
    </Box>
  )
}

export function ProfileCompletenessCard() {
  const me = useUserStore((s) => s.me)
  if (!me) return null

  const items = getCompletenessItems(me)
  const percent = completenessPercent(items)
  const eligible = isWorkerEligible(me)
  const setupComplete = isWorkerSetupComplete(me)
  const setupInProgress = isWorkerSetupInProgress(me)
  const setupPercent = workerSetupProgressPercent(me)
  const firstIncomplete = items.find((item) => !item.done)

  return (
    <Card layout="section" p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <HStack
          justify="space-between"
          align="flex-start"
          gap={3}
          flexWrap="wrap"
        >
          <Stack gap={1}>
            <Heading size="md">
              {setupComplete
                ? 'Your worker profile'
                : setupInProgress
                  ? 'Finish worker setup'
                  : 'Complete your profile'}
            </Heading>
            <Text fontSize="sm" color="formLabelMuted">
              {setupComplete
                ? 'Your profile meets the requirements to send quotes.'
                : setupInProgress
                  ? `You are ${setupPercent}% through worker onboarding.`
                  : 'Finish these to unlock sending quotes as a worker.'}
            </Text>
          </Stack>
          <Badge
            bg={setupComplete ? 'primary.100' : 'badgeBg'}
            color={setupComplete ? 'primary.800' : 'cardFg'}
          >
            {setupComplete
              ? 'Worker active'
              : setupInProgress
                ? `${setupPercent}% setup`
                : `${percent}% complete`}
          </Badge>
        </HStack>

        <Box h={2} borderRadius="full" bg="badgeBg" overflow="hidden">
          <Box
            h="full"
            w={`${setupInProgress ? setupPercent : percent}%`}
            bg="primary.500"
            transitionProperty="width"
            transitionDuration="240ms"
          />
        </Box>

        <Stack gap={2}>
          {items.map((item) => (
            <HStack key={item.key} justify="space-between" gap={3}>
              <HStack gap={3} minW={0}>
                <CheckGlyph done={item.done} />
                <Text
                  fontSize="sm"
                  color={item.done ? 'formLabelMuted' : 'cardFg'}
                  textDecoration={item.done ? 'line-through' : undefined}
                >
                  {item.label}
                </Text>
              </HStack>
              {!item.done ? (
                <Link
                  href={item.href}
                  fontSize="sm"
                  fontWeight={600}
                  color="primary.700"
                  flexShrink={0}
                  _hover={{ textDecoration: 'none', color: 'primary.600' }}
                >
                  Fix
                </Link>
              ) : null}
            </HStack>
          ))}
        </Stack>

        {!setupComplete ? (
          <HStack gap={3} flexWrap="wrap">
            {setupInProgress ? (
              <Link
                href={workerSetupHref('/profile')}
                _hover={{ textDecoration: 'none' }}
              >
                <Button size="sm" variant="primary">
                  Continue setup
                </Button>
              </Link>
            ) : eligible ? (
              <Link
                href={workerSetupHref('/profile')}
                _hover={{ textDecoration: 'none' }}
              >
                <Button size="sm" variant="primary">
                  Become a worker
                </Button>
              </Link>
            ) : firstIncomplete ? (
              <Link
                href={firstIncomplete.href}
                _hover={{ textDecoration: 'none' }}
              >
                <Button size="sm" variant="secondary">
                  Continue profile
                </Button>
              </Link>
            ) : null}
          </HStack>
        ) : null}
      </Stack>
    </Card>
  )
}
