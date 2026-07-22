'use client'

import { HStack, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { LuCalendarDays, LuCamera, LuExternalLink } from 'react-icons/lu'

import { MeAvatar } from '@/app/(auth)/components/MeAvatar'
import type { MeSnapshot } from '@/app/(auth)/store/user'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { Badge, Button, Card, Link } from '@ui'

import type { ProfileLifecycle } from '../helpers/profileLifecycle'
import { displayNameFromMe, joinMonthYear } from '../profileDisplayHelpers'

export function ProfileIdentityHero({
  me,
  lifecycle,
  onEditPhoto,
}: {
  me: MeSnapshot
  lifecycle: ProfileLifecycle
  onEditPhoto: () => void
}) {
  const href = useLocalizedHref()
  const name = displayNameFromMe(me)

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
            <MeAvatar size="lg" name={name} />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              aria-label="Edit profile photo"
              position="absolute"
              right="-8px"
              bottom="-6px"
              boxSize="32px"
              minW="32px"
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
            {joinMonthYear(me.createdAt) ? (
              <HStack gap={1.5} color="text.muted">
                <LuCalendarDays size={14} aria-hidden />
                <Text fontSize="xs">Joined {joinMonthYear(me.createdAt)}</Text>
              </HStack>
            ) : null}
          </Stack>
        </HStack>

        <Stack gap={3} align={{ base: 'flex-start', md: 'flex-end' }}>
          <Badge variant={lifecycle.badgeVariant} dot shape="pill">
            {lifecycle.badge}
          </Badge>
          {lifecycle.publicProfileHref ? (
            <Link
              href={href(lifecycle.publicProfileHref)}
              _hover={{ textDecoration: 'none' }}
            >
              <Button size="sm" variant="secondary">
                View public profile
                <LuExternalLink size={14} aria-hidden />
              </Button>
            </Link>
          ) : null}
        </Stack>
      </SimpleGrid>
    </Card>
  )
}
