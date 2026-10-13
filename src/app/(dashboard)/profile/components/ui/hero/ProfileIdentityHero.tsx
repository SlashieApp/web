'use client'

import { HStack, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { LuCalendarDays, LuCamera, LuExternalLink } from 'react-icons/lu'

import { MeAvatar } from '@/app/(auth)/components/ui/MeAvatar'
import type { MeSnapshot } from '@/app/(auth)/store/user'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Badge, Button, Card, Link } from '@ui'

import bag from '../../../i11n.json'

import type { ProfileLifecycle } from '../../../helpers/profileLifecycle'
import {
  displayNameFromMe,
  joinMonthYear,
} from '../../../profileDisplayHelpers'

export function ProfileIdentityHero({
  me,
  lifecycle,
  onEditPhoto,
}: {
  me: MeSnapshot
  lifecycle: ProfileLifecycle
  onEditPhoto: () => void
}) {
  const t = useI11n(bag).hero
  const name = displayNameFromMe(me)
  const joined = joinMonthYear(me.createdAt)

  return (
    <Card
      layout="section"
      p={{ base: 4, md: 5 }}
      bg="status.success.soft"
      borderColor="status.success.border"
    >
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={5} alignItems="center">
        <HStack gap={4} align="center">
          <Stack position="relative" flexShrink={0}>
            <MeAvatar size="xl" name={name} fallback="initials" />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              aria-label={t.editPhoto}
              position="absolute"
              right="-2px"
              bottom="-2px"
              boxSize="36px"
              minW="36px"
              p={0}
              borderRadius="full"
              onClick={onEditPhoto}
            >
              <LuCamera size={15} aria-hidden />
            </Button>
          </Stack>
          <Stack gap={1} minW={0}>
            <Heading as="h2" fontSize={{ base: 'xl', md: '2xl' }}>
              {name}
            </Heading>
            <Text fontSize="sm" color="text.muted" truncate>
              {me.email}
            </Text>
            {joined ? (
              <HStack gap={1.5} color="text.muted">
                <LuCalendarDays size={14} aria-hidden />
                <Text fontSize="xs">
                  {formatMessage(t.joined, { date: joined })}
                </Text>
              </HStack>
            ) : null}
          </Stack>
        </HStack>

        <Stack gap={3} align={{ base: 'flex-start', md: 'flex-end' }}>
          <Badge variant={lifecycle.badgeVariant} dot shape="pill">
            {lifecycle.badge}
          </Badge>
          {lifecycle.publicProfileHref ? (
            <Button asChild size="sm" variant="secondary">
              <Link
                href={lifecycle.publicProfileHref}
                _hover={{ textDecoration: 'none' }}
              >
                {t.viewPublicProfile}
                <LuExternalLink size={14} aria-hidden />
              </Link>
            </Button>
          ) : null}
        </Stack>
      </SimpleGrid>
    </Card>
  )
}
