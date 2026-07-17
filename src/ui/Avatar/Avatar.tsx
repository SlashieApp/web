'use client'

import {
  Box,
  type BoxProps,
  HStack,
  type SystemStyleObject,
  Text,
  type TextProps,
  VisuallyHidden,
  chakra,
} from '@chakra-ui/react'
import Image from 'next/image'
import { useState } from 'react'
import { LuUser } from 'react-icons/lu'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'

/**
 * SDL Avatar. Rounded list/profile avatar with load fallbacks:
 * 1. `srcCandidates` tried in order (onError advances)
 * 2. else single `src`
 * 3. else `fallback` — initials (default) or user icon
 *
 * An optional `label` renders the name column beside the image; an optional
 * `status` renders a presence dot paired with an accessible label.
 *
 * Interactive avatars (`onClick` / `href`) meet a 44px touch target and use
 * `sdlFocusRing` for WCAG 2.2 AA focus visibility.
 */
export type UiAvatarSize = 'sm' | 'md' | 'lg' | 'xs' | 'xl'

type SdlSize = 'sm' | 'md' | 'lg' | 'xl'

/** Presence/status families — always rendered as dot + accessible label. */
export type UiAvatarStatus = 'online' | 'away' | 'busy' | 'offline'

/** What to show when no image URL loads. */
export type UiAvatarFallback = 'initials' | 'icon'

export type AvatarProps = {
  /** Display name / alt text for the image; also drives the initials fallback. */
  name: string
  src?: string
  /**
   * Ordered image URLs tried on load failure (CDN → Google → other).
   * Takes precedence over `src` when non-empty.
   */
  srcCandidates?: readonly string[]
  /** Fallback when every URL fails or none are provided. Default: initials. */
  fallback?: UiAvatarFallback
  /** When set, shown beside the image in the row; omit for image-only. */
  label?: string
  labelProps?: TextProps
  /**
   * Avatar size. Responsive object preserved as the default to match the
   * legacy `{ base: 6, md: 7 }` sizing. Legacy `xs`/`xl` resolve to sm/lg.
   */
  size?: UiAvatarSize
  /** Optional presence indicator. Renders a dot + visually-hidden label. */
  status?: UiAvatarStatus
  /** Make the avatar interactive (focusable, focus ring, >=44px hit area). */
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  /** Render as a link wrapper target; pairs with `onClick` for keyboard users. */
  href?: string
  /** Extra props forwarded to the image container. */
  rootProps?: BoxProps
}

const sizeAlias: Record<UiAvatarSize, SdlSize> = {
  xs: 'sm',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
}

/** Pixel diameter per SDL size. `md` mirrors the legacy responsive 24/28px; `xl` is the profile-hero size. */
const avatarBox: Record<SdlSize, BoxProps['w']> = {
  sm: 6,
  md: { base: 6, md: 7 },
  lg: 10,
  xl: 24,
}

const avatarFontSize: Record<SdlSize, TextProps['fontSize']> = {
  sm: 'xs',
  md: 'xs',
  lg: 'sm',
  xl: '2xl',
}

/** next/image `sizes` hint per SDL size. */
const avatarImageSizes: Record<SdlSize, string> = {
  sm: '28px',
  md: '28px',
  lg: '40px',
  xl: '96px',
}

const avatarIconSize: Record<SdlSize, number> = {
  sm: 14,
  md: 16,
  lg: 22,
  xl: 44,
}

const statusMeta: Record<UiAvatarStatus, { dot: string; label: string }> = {
  online: { dot: 'status.success.solid', label: 'Online' },
  away: { dot: 'status.warning.solid', label: 'Away' },
  busy: { dot: 'status.danger.solid', label: 'Busy' },
  offline: { dot: 'border.strong', label: 'Offline' },
}

/** Initials from a display name (max two glyphs). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const interactiveStyles: SystemStyleObject = {
  cursor: 'pointer',
  minW: '44px',
  minH: '44px',
  p: 0,
  bg: 'transparent',
  border: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'full',
  transitionProperty: 'box-shadow, transform, opacity',
  transitionDuration: sdlMotion.duration.moderate,
  transitionTimingFunction: sdlMotion.easing.standard,
  _focusVisible: sdlFocusRing,
  _hover: { opacity: 0.92 },
}

const InteractiveLink = chakra('a')
const InteractiveButton = chakra('button')

function AvatarFallback({
  name,
  sdlSize,
  fallback,
}: {
  name: string
  sdlSize: SdlSize
  fallback: UiAvatarFallback
}) {
  if (fallback === 'icon') {
    return (
      <Box as="span" display="inline-flex" aria-hidden>
        <LuUser size={avatarIconSize[sdlSize]} strokeWidth={1.75} />
      </Box>
    )
  }
  return (
    <Text
      as="span"
      aria-hidden
      fontSize={avatarFontSize[sdlSize]}
      fontWeight={600}
      lineHeight="1"
      userSelect="none"
    >
      {initials(name)}
    </Text>
  )
}

/** Rounded list avatar; optional `label` adds the name column beside the image. */
export function Avatar({
  name,
  src,
  srcCandidates,
  fallback = 'initials',
  label,
  labelProps,
  size = 'md',
  status,
  onClick,
  href,
  rootProps,
}: AvatarProps) {
  const sdlSize = sizeAlias[size]
  const box = avatarBox[sdlSize]
  const interactive = Boolean(onClick || href)

  const candidates =
    srcCandidates && srcCandidates.length > 0 ? srcCandidates : src ? [src] : []
  const candidateKey = candidates.join('|')

  const [failedCount, setFailedCount] = useState(0)
  const [seenKey, setSeenKey] = useState(candidateKey)
  if (seenKey !== candidateKey) {
    setSeenKey(candidateKey)
    setFailedCount(0)
  }

  const activeSrc =
    failedCount < candidates.length ? candidates[failedCount] : null
  const useCandidateChain = Boolean(srcCandidates && srcCandidates.length > 0)

  const image = (
    <Box
      w={box}
      h={box}
      borderRadius="full"
      overflow="hidden"
      bg="bg.subtle"
      color="text.muted"
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      {...rootProps}
    >
      {activeSrc && useCandidateChain ? (
        // Dynamic hosts (S3 + Google) — plain img so onError can advance the chain.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={activeSrc}
          src={activeSrc}
          alt=""
          onError={() => setFailedCount((n) => n + 1)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : activeSrc ? (
        <Image
          src={activeSrc}
          alt={`${name} avatar`}
          fill
          sizes={avatarImageSizes[sdlSize]}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <AvatarFallback name={name} sdlSize={sdlSize} fallback={fallback} />
      )}
    </Box>
  )

  // Presence dot is positioned over the image and paired with a hidden label so
  // status is never conveyed by colour alone.
  const withStatus = status ? (
    <Box position="relative" display="inline-flex" flexShrink={0}>
      {image}
      <Box
        as="span"
        aria-hidden
        position="absolute"
        right="-1px"
        bottom="-1px"
        boxSize="10px"
        borderRadius="full"
        borderWidth="2px"
        borderColor="bg.surface"
        bg={statusMeta[status].dot}
      />
      <VisuallyHidden>{statusMeta[status].label}</VisuallyHidden>
    </Box>
  ) : (
    image
  )

  const avatarLabel = label ? undefined : `${name} avatar`
  let avatar = withStatus
  if (interactive && href) {
    avatar = (
      <InteractiveLink
        href={href}
        aria-label={avatarLabel}
        css={interactiveStyles}
      >
        {withStatus}
      </InteractiveLink>
    )
  } else if (interactive) {
    avatar = (
      <InteractiveButton
        type="button"
        onClick={onClick}
        aria-label={avatarLabel}
        css={interactiveStyles}
      >
        {withStatus}
      </InteractiveButton>
    )
  }

  if (label == null || label === '') {
    return avatar
  }

  return (
    <HStack gap={2}>
      {avatar}
      <Text
        fontSize="sm"
        fontWeight={600}
        color="text.muted"
        truncate
        {...labelProps}
      >
        {label}
      </Text>
    </HStack>
  )
}

/**
 * Overlapping avatar stack (e.g. quote participants). Shows up to `max`
 * avatars and a `+N` overflow chip using SDL surface tokens.
 */
export type AvatarGroupItem = { name: string; src?: string }

export type AvatarGroupProps = {
  items: AvatarGroupItem[]
  /** Max avatars shown before the overflow chip. */
  max?: number
  size?: UiAvatarSize
}

export function AvatarGroup({ items, max = 4, size = 'md' }: AvatarGroupProps) {
  const sdlSize = sizeAlias[size]
  const box = avatarBox[sdlSize]
  const visible = items.slice(0, max)
  const overflow = items.length - visible.length

  return (
    <HStack gap={0} aria-label={`${items.length} people`}>
      {visible.map((item, i) => (
        <Box
          key={`${item.name}-${i}`}
          ml={i === 0 ? 0 : '-8px'}
          borderRadius="full"
          borderWidth="2px"
          borderColor="bg.surface"
        >
          <Avatar name={item.name} src={item.src} size={size} />
        </Box>
      ))}
      {overflow > 0 ? (
        <Box
          ml="-8px"
          w={box}
          h={box}
          borderRadius="full"
          borderWidth="2px"
          borderColor="bg.surface"
          bg="bg.subtle"
          color="text.muted"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize={avatarFontSize[sdlSize]}
          fontWeight={600}
          flexShrink={0}
        >
          {`+${overflow}`}
        </Box>
      ) : null}
    </HStack>
  )
}
