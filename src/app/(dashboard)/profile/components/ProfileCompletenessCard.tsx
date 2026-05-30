'use client'

import { Box, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { useUserStore } from '@/app/(auth)/store/user'
import { Badge, Button, SectionCard } from '@ui'

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
  const isWorker = Boolean(me.worker?.id)
  const firstIncomplete = items.find((item) => !item.done)

  return (
    <SectionCard p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <HStack
          justify="space-between"
          align="flex-start"
          gap={3}
          flexWrap="wrap"
        >
          <Stack gap={1}>
            <Heading size="md">
              {isWorker ? 'Your worker profile' : 'Complete your profile'}
            </Heading>
            <Text fontSize="sm" color="formLabelMuted">
              {isWorker
                ? 'Your profile meets the requirements to send quotes.'
                : 'Finish these to unlock sending quotes as a worker.'}
            </Text>
          </Stack>
          <Badge
            bg={eligible ? 'primary.100' : 'badgeBg'}
            color={eligible ? 'primary.800' : 'cardFg'}
          >
            {isWorker ? 'Worker active' : `${percent}% complete`}
          </Badge>
        </HStack>

        <Box h={2} borderRadius="full" bg="badgeBg" overflow="hidden">
          <Box
            h="full"
            w={`${percent}%`}
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
                  as={NextLink}
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

        {!isWorker ? (
          <HStack gap={3} flexWrap="wrap">
            {eligible ? (
              <Link
                as={NextLink}
                href="#profile-worker"
                _hover={{ textDecoration: 'none' }}
              >
                <Button size="sm" variant="primary">
                  Become a worker
                </Button>
              </Link>
            ) : firstIncomplete ? (
              <Link
                as={NextLink}
                href={firstIncomplete.href}
                _hover={{ textDecoration: 'none' }}
              >
                <Button size="sm" variant="secondary">
                  Continue setup
                </Button>
              </Link>
            ) : null}
          </HStack>
        ) : null}
      </Stack>
    </SectionCard>
  )
}
