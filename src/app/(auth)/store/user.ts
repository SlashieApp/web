'use client'

import type {
  LoginMutation,
  LoginMutationVariables,
  MeQuery,
} from '@codegen/schema'
import { create } from 'zustand'

import Login from '@/app/(auth)/login/graphql/Login.gql'
import Me from '@/graphql/Me.gql'
import { apolloClient } from '@/utils/apolloClient'
import { clearAuthToken, getAuthToken, setAuthToken } from '@/utils/auth'

const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

type AuthUser = {
  id: string
  email: string
  createdAt?: string | null
}

export type MeSnapshot = NonNullable<MeQuery['me']>

type LoginInput = {
  email: string
  password: string
  rememberMe?: boolean
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
  login: async ({ email, password, rememberMe = false }) => {
    set({ isLoading: true })
    try {
      const result = await apolloClient.mutate<
        LoginMutation,
        LoginMutationVariables
      >({
        mutation: Login,
        variables: { email, password },
      })

      const token = result.data?.login?.token?.trim()
      if (!token) {
        throw new Error('Login succeeded but no session token was returned.')
      }

      setAuthToken(token, rememberMe ? REMEMBER_MAX_AGE : SESSION_MAX_AGE)

      const meResult = await apolloClient.query<MeQuery>({
        query: Me,
        fetchPolicy: 'network-only',
      })
      const synced = syncStateFromMe(meResult.data?.me)
      set({ ...synced, isLoading: false })
      return synced.user
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
  logout: () => {
    clearAuthToken()
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
      return synced.user
    } catch {
      clearAuthToken()
      set({ user: null, me: null, isLoading: false })
      return null
    }
  },
}))

/** Stable selector hook for the current `me` snapshot (Zustand-mirrored). */
export function useMe() {
  return useUserStore((state) => state.me)
}
