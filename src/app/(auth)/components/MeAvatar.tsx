'use client'

import type { BoxProps } from '@chakra-ui/react'

import { useUserStore } from '@/app/(auth)/store/user'
import { readCachedGooglePhotoUrl } from '@/utils/googlePhotoCache'
import { Avatar, type UiAvatarSize, buildAvatarSrcCandidates } from '@ui'

export type MeAvatarProps = {
  size?: UiAvatarSize
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
 * Thin app adapter: resolves the signed-in user's avatar URLs and renders the
 * universal `Avatar` primitive with load fallbacks (CDN → Google → icon).
 */
export function MeAvatar({
  size = 'md',
  avatarUrl: avatarUrlProp,
  googlePhotoUrl: googlePhotoUrlProp,
  name: nameProp,
  rootProps,
}: MeAvatarProps) {
  const me = useUserStore((s) => s.me)
  const profileAvatar =
    avatarUrlProp !== undefined
      ? avatarUrlProp
      : (me?.profile?.avatarUrl ?? null)
  const googlePhoto =
    googlePhotoUrlProp !== undefined
      ? googlePhotoUrlProp
      : readCachedGooglePhotoUrl()

  const label =
    nameProp?.trim() ||
    me?.profile?.name?.trim() ||
    me?.email?.trim() ||
    'Account'

  return (
    <Avatar
      name={label}
      size={size}
      srcCandidates={buildAvatarSrcCandidates(profileAvatar, googlePhoto)}
      fallback="icon"
      rootProps={rootProps}
    />
  )
}
