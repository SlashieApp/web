'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import type { KeyboardEvent } from 'react'
import { LuCheck, LuMapPin } from 'react-icons/lu'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'
import { Avatar, Badge, Card, Link, Rating } from '@ui'

const MAX_SKILL_CHIPS = 3

/**
 * Solid brand-green check disc (design's verified/responds glyph). Green-ink
 * rule: the check uses `text.onGreen`, never white.
 */
function CheckDisc({ size }: { size: number }) {
  return (
    <Box
      as="span"
      aria-hidden
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      boxSize={`${size}px`}
      borderRadius="full"
      bg="action.primary"
      color="text.onGreen"
      flexShrink={0}
    >
      <LuCheck size={Math.round(size * 0.6)} strokeWidth={3.5} />
    </Box>
  )
}

export type WorkerSearchCardProps = {
  name: string
  avatarUrl?: string | null
  verified?: boolean
  /** Tagline or area summary, e.g. "Handyman · Furniture assembly". */
  subtitle?: string | null
  /** Rating-row score, e.g. "4.9 (128)". */
  ratingLabel?: string | null
  /** Rating-row experience, e.g. "5 yrs exp". */
  experienceLabel?: string | null
  /** Responsiveness line, e.g. "Responds in under 2 hours". */
  respondsLabel?: string | null
  /** Approximate service-area label, e.g. "Camden (~5 miles)". Never an address. */
  serviceAreaLabel?: string | null
  skills?: readonly string[]
  profileHref: string
  isActive?: boolean
  /** First activation selects/highlights on the map; the parent decides what a second activation does. */
  onActivate?: () => void
  activateAriaLabel?: string
  /**
   * `gesture` — plain surface so horizontal swipes reach Embla (mobile
   * carousel). `button` — focusable control (lists, keyboard). Mirrors
   * TaskCard's activation modes.
   */
  activateMode?: 'button' | 'gesture'
  /** Cursor on the activatable shell (e.g. `grab` in a draggable carousel). */
  activateCursor?: 'pointer' | 'grab'
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
  ratingLabel,
  experienceLabel,
  respondsLabel,
  serviceAreaLabel,
  skills = [],
  profileHref,
  isActive = false,
  onActivate,
  activateAriaLabel,
  activateMode = 'button',
  activateCursor = 'pointer',
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
    // Same Card treatment as TaskCard: `isActive` drives the border via the
    // primitive; active fill + hover/active elevation match the task cards.
    <Card
      isActive={isActive}
      // TaskCard parity: same p={3}; minH matches TaskCard's natural height
      // (120px thumbnail + padding) so the two /search modes line up.
      p={3}
      minH="144px"
      w="full"
      maxW="full"
      bg={isActive ? 'status.success.soft' : 'bg.surface'}
      boxShadow={isActive ? 'e3' : 'card'}
      transitionProperty="background-color, border-color, box-shadow"
      transitionDuration={sdlMotion.duration.base}
      transitionTimingFunction={sdlMotion.easing.standard}
      _hover={onActivate ? { boxShadow: 'e3' } : undefined}
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
              left="-2px"
              bottom="-2px"
              boxSize={compact ? '18px' : '24px'}
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
              <LuCheck size={compact ? 10 : 13} strokeWidth={3.5} aria-hidden />
            </Box>
          ) : null}
        </Box>

        <Stack gap={compact ? 0.5 : 1} flex={1} minW={0}>
          <HStack gap={2} justify="space-between" align="baseline">
            <HStack gap={1} minW={0} align="center">
              <Heading size="sm" lineHeight="short" lineClamp={1}>
                {name}
              </Heading>
              {verified ? (
                // Decorative: the avatar badge carries the "Verified worker" label.
                <CheckDisc size={14} />
              ) : null}
            </HStack>
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

          {ratingLabel || experienceLabel ? (
            <HStack gap={1.5} color="text.muted" fontSize="xs" minW={0}>
              {ratingLabel ? (
                <Rating value={ratingLabel} size="sm" label="Worker rating" />
              ) : null}
              {ratingLabel && experienceLabel ? (
                <Text as="span" fontSize="xs" aria-hidden>
                  ·
                </Text>
              ) : null}
              {experienceLabel ? (
                <Text fontSize="xs" lineClamp={1}>
                  {experienceLabel}
                </Text>
              ) : null}
            </HStack>
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

          {respondsLabel ? (
            <HStack gap={1.5} fontSize="xs" minW={0}>
              <CheckDisc size={12} />
              <Text color="text.muted" lineClamp={1}>
                {respondsLabel}
              </Text>
            </HStack>
          ) : null}

          {!compact && visibleSkills.length > 0 ? (
            <HStack gap={1.5} flexWrap="wrap" pt={0.5}>
              {visibleSkills.map((skill) => (
                <Badge key={skill} variant="neutral" shape="pill" size="sm">
                  {skill}
                </Badge>
              ))}
              {extraSkillCount > 0 ? (
                <Badge variant="neutral" shape="pill" size="sm">
                  +{extraSkillCount}
                </Badge>
              ) : null}
            </HStack>
          ) : null}
        </Stack>
      </HStack>
    </Card>
  )

  if (activateMode === 'gesture') {
    // Plain surface (no button semantics) so horizontal swipes reach Embla.
    return (
      <Box
        w="full"
        cursor={activateCursor}
        aria-current={isActive ? 'true' : undefined}
        aria-label={activateAriaLabel ?? `${name}. Select to highlight on map.`}
        onClick={onActivate}
        css={{
          touchAction: 'pan-y',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {shell}
      </Box>
    )
  }

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
