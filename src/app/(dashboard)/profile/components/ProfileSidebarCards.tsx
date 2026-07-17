'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import {
  LuCheck,
  LuCircle,
  LuExternalLink,
  LuFlag,
  LuLock,
  LuUsers,
} from 'react-icons/lu'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { Badge, Button, Card, Link, ProgressBar } from '@ui'

import type { ProfileLifecycle } from '../helpers/profileLifecycle'
import {
  getProfileStrengthItems,
  profileStrengthPercent,
} from '../helpers/profileStrength'

export function NextStepCard({
  lifecycle,
  onAction,
}: {
  lifecycle: ProfileLifecycle
  onAction?: () => void
}) {
  return (
    <Card layout="section" p={5}>
      <Stack gap={4}>
        <HStack gap={2}>
          <LuFlag size={18} color="var(--chakra-colors-status-warning-fg)" />
          <Heading as="h2" fontSize="md">
            Your next step
          </Heading>
        </HStack>
        <Stack gap={1}>
          <Text fontSize="sm" fontWeight={600}>
            {lifecycle.title}
          </Text>
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            {lifecycle.description}
          </Text>
        </Stack>
        {onAction ? (
          <Button
            type="button"
            w="full"
            size="sm"
            variant="primary"
            onClick={onAction}
          >
            {lifecycle.ctaLabel}
          </Button>
        ) : (
          <Link href={lifecycle.ctaHref} _hover={{ textDecoration: 'none' }}>
            <Button w="full" size="sm" variant="primary">
              {lifecycle.ctaLabel}
              {lifecycle.publicProfileHref === lifecycle.ctaHref ? (
                <LuExternalLink size={14} aria-hidden />
              ) : null}
            </Button>
          </Link>
        )}
      </Stack>
    </Card>
  )
}

export function ProfileStrengthCard({ me }: { me: MeSnapshot }) {
  if (!me.worker?.id) return null
  const items = getProfileStrengthItems(me)
  const percent = profileStrengthPercent(items)

  return (
    <Card layout="section" p={5}>
      <Stack gap={4}>
        <HStack justify="space-between" align="flex-start" gap={3}>
          <Stack gap={0.5}>
            <Heading as="h2" fontSize="md">
              Profile strength
            </Heading>
            <Text fontSize="xs" color="text.muted">
              Complete your public worker profile.
            </Text>
          </Stack>
          <Badge variant={percent === 100 ? 'success' : 'neutral'} shape="pill">
            {percent}%
          </Badge>
        </HStack>
        <ProgressBar value={percent} size="lg" trackLabel="Profile strength" />
        <Stack gap={2.5}>
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              tone="muted"
              _hover={{ textDecoration: 'none' }}
            >
              <HStack gap={2.5} align="center">
                <Box
                  color={item.done ? 'status.success.fg' : 'text.muted'}
                  display="inline-flex"
                  aria-hidden
                >
                  {item.done ? (
                    <LuCheck size={16} strokeWidth={2.5} />
                  ) : (
                    <LuCircle size={16} />
                  )}
                </Box>
                <Text
                  fontSize="xs"
                  color={item.done ? 'text.muted' : 'text.default'}
                >
                  {item.label}
                  {item.optional ? ' (optional)' : ''}
                </Text>
              </HStack>
            </Link>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}

export function PrivacyVisibilityCard({ me }: { me: MeSnapshot }) {
  return (
    <Card layout="section" p={5}>
      <Stack gap={4}>
        <HStack gap={2}>
          <LuLock size={18} aria-hidden />
          <Heading as="h2" fontSize="md">
            Privacy & visibility
          </Heading>
        </HStack>
        <Text fontSize="xs" color="text.muted" lineHeight="tall">
          Control what customers can see on your public profile.
        </Text>
        <Stack gap={3}>
          <HStack gap={3} align="flex-start">
            <LuUsers size={17} aria-hidden />
            <Stack gap={0}>
              <Text fontSize="sm" fontWeight={600}>
                Your profile is{' '}
                {me.settings.isProfilePrivate ? 'private' : 'public'}
              </Text>
              <Text fontSize="xs" color="text.muted">
                {me.settings.isProfilePrivate
                  ? 'Only you can view your full profile.'
                  : 'Customers can find and view your public worker profile.'}
              </Text>
            </Stack>
          </HStack>
          <HStack gap={3} align="flex-start">
            <LuLock size={17} aria-hidden />
            <Stack gap={0}>
              <Text fontSize="sm" fontWeight={600}>
                Contact info stays private
              </Text>
              <Text fontSize="xs" color="text.muted">
                Email, phone, and exact address never appear in the preview.
              </Text>
            </Stack>
          </HStack>
        </Stack>
        <Link href="/account" fontSize="sm" fontWeight={600}>
          Manage account privacy
        </Link>
      </Stack>
    </Card>
  )
}
