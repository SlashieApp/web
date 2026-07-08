'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import type { KeyboardEvent } from 'react'
import { LuCheck, LuMapPin } from 'react-icons/lu'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'
import { Avatar, Badge, Card, Link } from '@ui'

const MAX_SKILL_CHIPS = 3

export type WorkerSearchCardProps = {
  name: string
  avatarUrl?: string | null
  verified?: boolean
  /** Tagline or experience/area summary. */
  subtitle?: string | null
  /** Approximate service-area label, e.g. "Camden (~5 miles)". Never an address. */
  serviceAreaLabel?: string | null
  skills?: readonly string[]
  profileHref: string
  isActive?: boolean
  /** First activation selects/highlights on the map; the parent decides what a second activation does. */
  onActivate?: () => void
  activateAriaLabel?: string
  /** Compact variant for the mobile carousel. */
  compact?: boolean
}

/**
 * Worker entity card for the /search list panel and mobile carousel.
 * Public-safe fields only: name, avatar, verified badge, tagline, skills, and
 * approximate service area — no address or contact details.
 */
export function WorkerSearchCard({
  name,
  avatarUrl,
  verified,
  subtitle,
  serviceAreaLabel,
  skills = [],
  profileHref,
  isActive = false,
  onActivate,
  activateAriaLabel,
  compact = false,
}: WorkerSearchCardProps) {
  const visibleSkills = skills.slice(0, MAX_SKILL_CHIPS)
  const extraSkillCount = skills.length - visibleSkills.length

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    if (e.target !== e.currentTarget) return
    e.preventDefault()
    onActivate?.()
  }

  const shell = (
    <Card
      p={compact ? 3 : 4}
      w="full"
      borderWidth="1px"
      borderColor={isActive ? 'action.primary' : 'border.default'}
      boxShadow={isActive ? 'e3' : 'e2'}
      transitionProperty="border-color, box-shadow"
      transitionDuration={sdlMotion.duration.moderate}
      transitionTimingFunction={sdlMotion.easing.standard}
    >
      <HStack gap={3} align="flex-start">
        <Box position="relative" flexShrink={0}>
          <Avatar
            name={name}
            src={avatarUrl ?? undefined}
            size={compact ? 'md' : 'lg'}
          />
          {verified ? (
            <Box
              position="absolute"
              right="-2px"
              bottom="-2px"
              boxSize="18px"
              borderRadius="full"
              bg="action.primary"
              color="text.onGreen"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderWidth="2px"
              borderColor="bg.surface"
              aria-label="Verified worker"
            >
              <LuCheck size={10} strokeWidth={3.5} aria-hidden />
            </Box>
          ) : null}
        </Box>

        <Stack gap={compact ? 0.5 : 1} flex={1} minW={0}>
          <HStack gap={2} justify="space-between" align="baseline">
            <Heading size="sm" lineHeight="short" lineClamp={1}>
              {name}
            </Heading>
            <Link
              href={profileHref}
              fontSize="xs"
              fontWeight={700}
              flexShrink={0}
              onClick={(e) => e.stopPropagation()}
            >
              View profile
            </Link>
          </HStack>

          {subtitle ? (
            <Text
              fontSize="sm"
              color="text.muted"
              lineClamp={compact ? 1 : 2}
              lineHeight="1.4"
            >
              {subtitle}
            </Text>
          ) : null}

          <HStack gap={1} color="text.muted" fontSize="xs" minW={0}>
            <Box as="span" aria-hidden display="inline-flex" flexShrink={0}>
              <LuMapPin size={12} strokeWidth={2} />
            </Box>
            <Text lineClamp={1}>
              {serviceAreaLabel
                ? `Serves ${serviceAreaLabel}`
                : 'Service area not set'}
            </Text>
          </HStack>

          {!compact && visibleSkills.length > 0 ? (
            <HStack gap={1.5} flexWrap="wrap" pt={0.5}>
              {visibleSkills.map((skill) => (
                <Badge key={skill} variant="neutral" shape="pill" size="sm">
                  {skill}
                </Badge>
              ))}
              {extraSkillCount > 0 ? (
                <Badge variant="neutral" shape="pill" size="sm">
                  +{extraSkillCount} more
                </Badge>
              ) : null}
            </HStack>
          ) : null}
        </Stack>
      </HStack>
    </Card>
  )

  // Activation wrapper mirrors TaskCard: plain div with button semantics so
  // the inner "View profile" link stays independently focusable.
  return (
    <Box
      as="div"
      role="button"
      tabIndex={0}
      aria-label={activateAriaLabel ?? `${name}. Select to highlight on map.`}
      aria-current={isActive ? 'true' : undefined}
      onClick={onActivate}
      onKeyDown={onKeyDown}
      w="full"
      m={0}
      p={0}
      border="none"
      textAlign="left"
      bg="transparent"
      cursor="pointer"
      pointerEvents="auto"
      _focusVisible={sdlFocusRing}
      style={{ font: 'inherit' }}
    >
      {shell}
    </Box>
  )
}
