'use client'

import { HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { LuCalendarDays, LuCamera, LuExternalLink } from 'react-icons/lu'

import { MeAvatar } from '@/app/(auth)/components/ui/MeAvatar'
import type { MeSnapshot } from '@/app/(auth)/store/user'
import { publicProfilePath } from '@/app/helpers/publicProfilePath'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Badge, Button, Card, IconButton, Link } from '@ui'

import bag from '../../../i11n.json'
import {
  displayNameFromMe,
  joinMonthYear,
} from '../../../profileDisplayHelpers'
import type { ProfileViewConfig } from '../../../views'

export type ProfileIdentityHeroProps = {
  me: MeSnapshot
  config: ProfileViewConfig
  /** Suspended: no photo or details editing. */
  readOnly?: boolean
  onEditPhoto: () => void
  onEditDetails: () => void
}

/** Photo, name, joined date, status badge and the one public profile link. */
export function ProfileIdentityHero({
  me,
  config,
  readOnly = false,
  onEditPhoto,
  onEditDetails,
}: ProfileIdentityHeroProps) {
  const copy = useI11n(bag)
  const t = copy.hero
  const name = displayNameFromMe(me)
  const joined = joinMonthYear(me.createdAt)

  return (
    <Card
      layout="section"
      framed
      p={{ base: 4, md: 5 }}
      bg="status.success.soft"
      borderColor="status.success.border"
    >
      <HStack
        gap={4}
        align="center"
        justify="space-between"
        flexWrap="wrap"
        rowGap={4}
      >
        <HStack gap={4} align="center" minW={0}>
          <Stack position="relative" flexShrink={0}>
            <MeAvatar size="xl" name={name} fallback="initials" />
            {readOnly ? null : (
              <IconButton
                type="button"
                variant="outline"
                aria-label={t.editPhoto}
                position="absolute"
                right="-6px"
                bottom="-6px"
                borderRadius="full"
                bg="bg.surface"
                onClick={onEditPhoto}
              >
                <LuCamera size={16} aria-hidden />
              </IconButton>
            )}
          </Stack>
          <Stack gap={1} minW={0}>
            <Heading as="h2" fontSize={{ base: 'xl', md: '2xl' }}>
              {name}
            </Heading>
            <HStack gap={2} flexWrap="wrap" color="text.muted">
              {joined ? (
                <HStack gap={1.5}>
                  <LuCalendarDays size={14} aria-hidden />
                  <Text fontSize="xs">
                    {formatMessage(t.joined, { date: joined })}
                  </Text>
                </HStack>
              ) : null}
              <Badge variant={config.badge.tone} dot shape="pill">
                {copy.badge[config.badge.label]}
              </Badge>
            </HStack>
          </Stack>
        </HStack>

        <HStack gap={2} flexWrap="wrap">
          {readOnly ? null : (
            <Button
              type="button"
              size="sm"
              minH="44px"
              variant="ghost"
              onClick={onEditDetails}
            >
              {t.editDetails}
            </Button>
          )}
          {config.publicLink ? (
            <Button asChild size="sm" minH="44px" variant="secondary">
              <Link
                href={publicProfilePath(me.id)}
                _hover={{ textDecoration: 'none' }}
              >
                {config.publicLink === 'preview'
                  ? t.previewPublicProfile
                  : t.viewPublicProfile}
                <LuExternalLink size={14} aria-hidden />
              </Link>
            </Button>
          ) : null}
        </HStack>
      </HStack>
    </Card>
  )
}
