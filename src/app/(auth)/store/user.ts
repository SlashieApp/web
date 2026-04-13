'use client'

import type {
  LoginMutation,
  LoginMutationVariables,
  MeQuery,
} from '@codegen/schema'
import { create } from 'zustand'

import { LOGIN_MUTATION, ME_QUERY } from '@/graphql/auth'
import { apolloClient } from '@/utils/apolloClient'
import { clearAuthToken, getAuthToken, setAuthToken } from '@/utils/auth'

const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

type AuthUser = {
  id: string
  email: string
  createdAt?: string | null
}

type LoginInput = {
  email: string
  password: string
  rememberMe?: boolean
}

type UserStore = {
  user: AuthUser | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
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

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  login: async ({ email, password, rememberMe = false }) => {
    set({ isLoading: true })
    try {
      const result = await apolloClient.mutate<
        LoginMutation,
        LoginMutationVariables
      >({
        mutation: LOGIN_MUTATION,
        variables: { email, password },
      })

      const token = result.data?.login?.token?.trim()
      if (!token) {
        throw new Error('Login succeeded but no session token was returned.')
      }

      setAuthToken(token, rememberMe ? REMEMBER_MAX_AGE : SESSION_MAX_AGE)

      const loginUser = toAuthUser(result.data?.login?.user)
      if (loginUser) {
        set({ user: loginUser, isLoading: false })
        return loginUser
      }

      const meResult = await apolloClient.query<MeQuery>({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      })
      const meUser = toAuthUser(meResult.data?.me)
      set({ user: meUser, isLoading: false })
      return meUser
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
  logout: () => {
    clearAuthToken()
    set({ user: null })
    void apolloClient.clearStore()
  },
  getUser: async () => {
    const token = getAuthToken()
    if (!token) {
      set({ user: null, isLoading: false })
      return null
    }

    set({ isLoading: true })
    try {
      const result = await apolloClient.query<MeQuery>({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      })
      const meUser = toAuthUser(result.data?.me)
      set({ user: meUser, isLoading: false })
      return meUser
    } catch {
      clearAuthToken()
      set({ user: null, isLoading: false })
      return null
    }
  },
}))
