'use client'

import type {
  LoginMutation,
  LoginMutationVariables,
  LoginWithGoogleMutation,
  LoginWithGoogleMutationVariables,
  MeQuery,
} from '@codegen/schema'
import { create } from 'zustand/react'

import { parseAuthAbuseError } from '@/app/(auth)/helpers/authAbuseErrors'
import { captchaMutationContext } from '@/app/(auth)/helpers/captchaMutationContext'
import Login from '@/app/(auth)/login/graphql/Login.gql'
import LoginWithGoogle from '@/app/(auth)/login/graphql/LoginWithGoogle.gql'
import Me from '@/graphql/Me.gql'
import {
  EVENTS,
  identifyAuthenticatedUser,
  resetAnalyticsIdentity,
  trackFlowFailed,
  trackFlowSucceeded,
} from '@/utils/analytics'
import { clearApiUnavailable } from '@/utils/apiAvailability'
import { apolloClient } from '@/utils/apolloClient'
import { clearAuthToken, getAuthToken, setAuthToken } from '@/utils/auth'
import {
  cacheGooglePhotoUrl,
  clearCachedGooglePhotoUrl,
  googlePictureFromIdToken,
} from '@/utils/googlePhotoCache'

const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

type AuthUser = {
  id: string
  email: string
  createdAt?: string | null
}

export type MeSnapshot = NonNullable<MeQuery['me']>

type LoginAnalyticsExtras = {
  had_captcha?: boolean
  fail_count_client?: number
  rate_limited?: boolean
}

type LoginInput = {
  email: string
  password: string
  rememberMe?: boolean
  captchaToken?: string | null
  analytics?: LoginAnalyticsExtras
}

type UserStore = {
  user: AuthUser | null
  /** Full `me` snapshot mirrored from Apollo. Source of truth for dashboard reads. */
  me: MeSnapshot | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  /** Replace the cached `me` snapshot (typically after `me` query or full mutation). */
  setMe: (me: MeSnapshot | null) => void
  /** Shallow-merge into the cached `me`; ignored when no `me` is present. */
  patchMe: (patch: Partial<MeSnapshot>) => void
  login: (input: LoginInput) => Promise<AuthUser | null>
  loginWithGoogle: (idToken: string) => Promise<AuthUser | null>
  logout: () => void
  getUser: () => Promise<AuthUser | null>
}

function toAuthUser(user: unknown): AuthUser | null {
  if (!user || typeof user !== 'object') return null

  const candidate = user as {
    id?: unknown
    email?: unknown
    createdAt?: unknown
  }

  if (typeof candidate.id !== 'string' || typeof candidate.email !== 'string') {
    return null
  }

  return {
    id: candidate.id,
    email: candidate.email,
    createdAt:
      typeof candidate.createdAt === 'string' ? candidate.createdAt : null,
  }
}

function syncStateFromMe(me: MeQuery['me'] | null | undefined): {
  user: AuthUser | null
  me: MeSnapshot | null
} {
  return {
    user: toAuthUser(me),
    me: me ?? null,
  }
}

function syncAnalyticsIdentity(me: MeSnapshot | null) {
  if (!me) return
  const fullName = me.profile?.name?.trim() ?? ''
  const [firstName, ...lastParts] = fullName.split(/\s+/).filter(Boolean)
  identifyAuthenticatedUser({
    id: me.id,
    email: me.email,
    firstName: firstName || undefined,
    lastName: lastParts.join(' ') || undefined,
    emailVerified: me.emailVerified,
    phoneVerified: me.phoneVerified,
    isWorker: Boolean(me.worker?.id),
  })
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  me: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setMe: (next) => set(syncStateFromMe(next)),
  patchMe: (patch) => {
    const current = get().me
    if (!current) return
    const next = { ...current, ...patch } as MeSnapshot
    set(syncStateFromMe(next))
  },
  login: async ({
    email,
    password,
    rememberMe = false,
    captchaToken,
    analytics,
  }) => {
    set({ isLoading: true })
    const hadCaptcha = Boolean(captchaToken?.trim() || analytics?.had_captcha)
    try {
      const result = await apolloClient.mutate<
        LoginMutation,
        LoginMutationVariables
      >({
        mutation: Login,
        variables: { email, password },
        context: captchaMutationContext(captchaToken),
      })

      const token = result.data?.login?.token?.trim()
      if (!token) {
        throw new Error('Login succeeded but no session token was returned.')
      }

      setAuthToken(token, rememberMe ? REMEMBER_MAX_AGE : SESSION_MAX_AGE)
      clearCachedGooglePhotoUrl()
      const meResult = await apolloClient.query<MeQuery>({
        query: Me,
        fetchPolicy: 'network-only',
      })
      const synced = syncStateFromMe(meResult.data?.me)
      set({ ...synced, isLoading: false })
      syncAnalyticsIdentity(synced.me)
      clearApiUnavailable()
      trackFlowSucceeded(EVENTS.login_success, {
        method: 'password',
        had_captcha: hadCaptcha,
        fail_count_client: analytics?.fail_count_client,
      })
      return synced.user
    } catch (error) {
      set({ isLoading: false })
      const abuse = parseAuthAbuseError(error)
      trackFlowFailed(EVENTS.login_fail, error, {
        flow: 'login',
        action: 'login',
        operation: 'Login',
        route: '/login',
        extra: {
          method: 'password',
          had_captcha: hadCaptcha,
          fail_count_client: analytics?.fail_count_client,
          rate_limited: abuse.rateLimited,
        },
      })
      throw error
    }
  },
  loginWithGoogle: async (idToken) => {
    set({ isLoading: true })
    try {
      const result = await apolloClient.mutate<
        LoginWithGoogleMutation,
        LoginWithGoogleMutationVariables
      >({
        mutation: LoginWithGoogle,
        variables: { token: idToken },
      })

      const token = result.data?.loginWithMethod?.token?.trim()
      if (!token) {
        throw new Error(
          'Google sign-in succeeded but no session token was returned.',
        )
      }

      setAuthToken(token, SESSION_MAX_AGE)
      cacheGooglePhotoUrl(googlePictureFromIdToken(idToken))

      const meResult = await apolloClient.query<MeQuery>({
        query: Me,
        fetchPolicy: 'network-only',
      })
      const synced = syncStateFromMe(meResult.data?.me)
      set({ ...synced, isLoading: false })
      syncAnalyticsIdentity(synced.me)
      clearApiUnavailable()
      trackFlowSucceeded(EVENTS.google_login_success)
      return synced.user
    } catch (error) {
      set({ isLoading: false })
      trackFlowFailed(EVENTS.google_login_fail, error, {
        flow: 'google_login',
        action: 'loginWithGoogle',
        operation: 'LoginWithGoogle',
        route: '/login',
      })
      throw error
    }
  },
  logout: () => {
    clearAuthToken()
    clearCachedGooglePhotoUrl()
    resetAnalyticsIdentity()
    set({ user: null, me: null })
    void apolloClient.clearStore()
  },
  getUser: async () => {
    const token = getAuthToken()
    if (!token) {
      set({ user: null, me: null, isLoading: false })
      return null
    }

    set({ isLoading: true })
    try {
      const result = await apolloClient.query<MeQuery>({
        query: Me,
        fetchPolicy: 'network-only',
      })
      const synced = syncStateFromMe(result.data?.me)
      set({ ...synced, isLoading: false })
      syncAnalyticsIdentity(synced.me)
      clearApiUnavailable()
      return synced.user
    } catch (error) {
      clearAuthToken()
      clearCachedGooglePhotoUrl()
      resetAnalyticsIdentity()
      set({ user: null, me: null, isLoading: false })
      return null
    }
  },
}))

/** Stable selector hook for the current `me` snapshot (Zustand-mirrored). */
export function useMe() {
  return useUserStore((state) => state.me)
}
