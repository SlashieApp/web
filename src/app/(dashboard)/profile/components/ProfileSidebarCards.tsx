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
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { Badge, Button, Card, Link, ProgressBar } from '@ui'

import type { ProfileLifecycle } from '../helpers/profileLifecycle'
import {
  getProfileStrengthItems,
  profileStrengthPercent,
} from '../helpers/profileStrength'
import bag from '../i11n.json'

export function NextStepCard({
  lifecycle,
  onAction,
}: {
  lifecycle: ProfileLifecycle
  onAction?: () => void
}) {
  const t = useI11n(bag)
  const href = useLocalizedHref()
  return (
    <Card layout="section" p={5}>
      <Stack gap={4}>
        <HStack gap={2}>
          <LuFlag size={18} color="var(--chakra-colors-status-warning-fg)" />
          <Heading as="h2" fontSize="md">
            {t.nextStepTitle}
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
          <Link
            href={href(lifecycle.ctaHref)}
            _hover={{ textDecoration: 'none' }}
          >
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
  const t = useI11n(bag)
  const href = useLocalizedHref()
  if (!me.worker?.id) return null
  const items = getProfileStrengthItems(me)
  const percent = profileStrengthPercent(items)

  return (
    <Card layout="section" p={5}>
      <Stack gap={4}>
        <HStack justify="space-between" align="flex-start" gap={3}>
          <Stack gap={0.5}>
            <Heading as="h2" fontSize="md">
              {t.strengthTitle}
            </Heading>
            <Text fontSize="xs" color="text.muted">
              {t.strengthDescription}
            </Text>
          </Stack>
          <Badge variant={percent === 100 ? 'success' : 'neutral'} shape="pill">
            {percent}%
          </Badge>
        </HStack>
        <ProgressBar
          value={percent}
          size="lg"
          trackLabel={t.strengthTrackLabel}
        />
        <Stack gap={2.5}>
          {items.map((item) => (
            <Link
              key={item.key}
              href={href(item.href)}
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
                  {item.optional ? ` ${t.optional}` : ''}
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
  const t = useI11n(bag)
  const href = useLocalizedHref()
  return (
    <Card layout="section" p={5}>
      <Stack gap={4}>
        <HStack gap={2}>
          <LuLock size={18} aria-hidden />
          <Heading as="h2" fontSize="md">
            {t.privacyTitle}
          </Heading>
        </HStack>
        <Text fontSize="xs" color="text.muted" lineHeight="tall">
          {t.privacyDescription}
        </Text>
        <Stack gap={3}>
          <HStack gap={3} align="flex-start">
            <LuUsers size={17} aria-hidden />
            <Stack gap={0}>
              <Text fontSize="sm" fontWeight={600}>
                {me.settings.isProfilePrivate
                  ? t.profileIsPrivate
                  : t.profileIsPublic}
              </Text>
              <Text fontSize="xs" color="text.muted">
                {me.settings.isProfilePrivate
                  ? t.profilePrivateHint
                  : t.profilePublicHint}
              </Text>
            </Stack>
          </HStack>
          <HStack gap={3} align="flex-start">
            <LuLock size={17} aria-hidden />
            <Stack gap={0}>
              <Text fontSize="sm" fontWeight={600}>
                {t.contactStaysPrivate}
              </Text>
              <Text fontSize="xs" color="text.muted">
                {t.contactStaysPrivateHint}
              </Text>
            </Stack>
          </HStack>
        </Stack>
        <Link href={href('/account')} fontSize="sm" fontWeight={600}>
          {t.manageAccountPrivacy}
        </Link>
      </Stack>
    </Card>
  )
}
