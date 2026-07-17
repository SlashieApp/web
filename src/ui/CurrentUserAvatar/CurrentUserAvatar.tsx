'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import { useState } from 'react'
import { LuUser } from 'react-icons/lu'

import { useUserStore } from '@/app/(auth)/store/user'
import { readCachedGooglePhotoUrl } from '@/utils/googlePhotoCache'

import { buildCurrentUserAvatarCandidates } from './currentUserAvatarHelpers'

export type CurrentUserAvatarSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_BOX: Record<CurrentUserAvatarSize, BoxProps['boxSize']> = {
  sm: '32px',
  md: '40px',
  lg: { base: '64px', md: '80px' },
  xl: { base: '80px', md: '96px' },
}

const SIZE_ICON: Record<CurrentUserAvatarSize, number> = {
  sm: 18,
  md: 22,
  lg: 36,
  xl: 44,
}

export type CurrentUserAvatarProps = {
  /** Visual size. `lg` matches the /profile hero; `xl` the photo card. */
  size?: CurrentUserAvatarSize
  /**
   * Profile avatar override (e.g. local upload preview). When omitted, reads
   * `me.profile.avatarUrl` from the user store.
   */
  avatarUrl?: string | null
  /** Google profile photo override; defaults to the session-cached OAuth picture. */
  googlePhotoUrl?: string | null
  /** Accessible name; defaults to profile name / email. */
  name?: string
  rootProps?: BoxProps
}

/**
 * Current-user avatar with load fallbacks:
 * 1. S3 / CDN profile photo
 * 2. Google OAuth picture (if S3 missing or fails to load)
 * 3. Blank user icon
 */
export function CurrentUserAvatar({
  size = 'md',
  avatarUrl: avatarUrlProp,
  googlePhotoUrl: googlePhotoUrlProp,
  name: nameProp,
  rootProps,
}: CurrentUserAvatarProps) {
  const me = useUserStore((s) => s.me)
  const profileAvatar =
    avatarUrlProp !== undefined
      ? avatarUrlProp
      : (me?.profile?.avatarUrl ?? null)
  const googlePhoto =
    googlePhotoUrlProp !== undefined
      ? googlePhotoUrlProp
      : readCachedGooglePhotoUrl()

  const candidates = buildCurrentUserAvatarCandidates(
    profileAvatar,
    googlePhoto,
  )
  const candidateKey = candidates.join('|')

  const [failedCount, setFailedCount] = useState(0)
  const [seenKey, setSeenKey] = useState(candidateKey)
  if (seenKey !== candidateKey) {
    setSeenKey(candidateKey)
    setFailedCount(0)
  }

  const activeSrc =
    failedCount < candidates.length ? candidates[failedCount] : null

  const label =
    nameProp?.trim() ||
    me?.profile?.name?.trim() ||
    me?.email?.trim() ||
    'Account'

  return (
    <Box
      boxSize={SIZE_BOX[size]}
      borderRadius="full"
      bg="bg.subtle"
      color="text.muted"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      flexShrink={0}
      aria-label={`${label} avatar`}
      {...rootProps}
    >
      {activeSrc ? (
        // Dynamic hosts (S3 + Google) — plain img so onError can advance the chain.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={activeSrc}
          src={activeSrc}
          alt=""
          onError={() => setFailedCount((n) => n + 1)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Box as="span" display="inline-flex" aria-hidden>
          <LuUser size={SIZE_ICON[size]} strokeWidth={1.75} />
        </Box>
      )}
    </Box>
  )
}
