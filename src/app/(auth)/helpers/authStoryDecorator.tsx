'use client'

import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core'
import { ApolloProvider } from '@apollo/client/react'
import type { Decorator } from '@storybook/nextjs-vite'
import type { GraphQLFormattedError } from 'graphql'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { NEVER, of, throwError } from 'rxjs'

import { stashResetEmail } from '@/app/(auth)/helpers/resetEmailHandoff'
import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'
import {
  clearDeletionScheduled,
  markDeletionScheduled,
} from '@/utils/accountDeletionState'
import {
  clearAccountDisabled,
  markAccountDisabled,
} from '@/utils/accountDisabledState'
import { clearAuthToken, setAuthToken } from '@/utils/auth'

/** What a story-only API answers for one operation. */
export type StoryResponse =
  | { kind: 'data'; data: Record<string, unknown> }
  | { kind: 'graphqlError'; code: string; message?: string }
  | { kind: 'networkError'; message?: string }

export type StorySessionOptions = {
  /** Signed-in user, or `null` / omitted for a signed-out visitor. */
  me?: MeSnapshot | null
  /** Operation name to canned answer. Any other operation never resolves. */
  responses?: Record<string, StoryResponse>
  /** Seed the story-only Apollo cache before the story renders. */
  seed?: (client: ApolloClient) => void
  /** Plant an auth cookie, for code that checks for a session. */
  token?: boolean
  /** The session is still being fetched (`isLoading`, `getUser` pending). */
  authLoading?: boolean
  /** Session flag for a suspended account, even with no `me` yet. */
  suspended?: boolean
  /** Session flag for an account waiting for deletion. */
  deletionScheduled?: boolean
}

const STORY_AUTH_TOKEN = 'storybook-session-token'

/** The live `getUser` calls the API, so each session swaps it out. */
const realGetUser = useUserStore.getState().getUser

/**
 * Runs `apply` while rendering, so the first paint already has the seeded
 * state, and again in an effect for the dev double mount. `reset` runs on
 * unmount: the store, cookies and globals are shared by every story in a page.
 */
export function StorySeed({
  apply,
  reset,
  children,
}: {
  apply: () => void
  reset: () => void
  children: ReactNode
}) {
  useState(apply)
  useEffect(() => {
    apply()
    return reset
  }, [apply, reset])

  return <>{children}</>
}

function storyLink(responses: Record<string, StoryResponse> = {}) {
  return new ApolloLink((operation) => {
    const response = operation.operationName
      ? responses[operation.operationName]
      : undefined
    if (!response) return NEVER
    if (response.kind === 'data') return of({ data: response.data })
    if (response.kind === 'graphqlError') {
      const error: GraphQLFormattedError = {
        message: response.message ?? response.code,
        extensions: { code: response.code },
      }
      return of({ errors: [error] })
    }
    return throwError(
      () => new Error(response.message ?? 'Network request failed'),
    )
  })
}

/**
 * Story-only Apollo client. The app client points at the live API (`.env` is
 * production), so a story never uses it: answers come from the seeded cache
 * and `responses`, and anything else never resolves.
 */
export function createStoryApolloClient({
  responses,
  seed,
}: Pick<StorySessionOptions, 'responses' | 'seed'> = {}) {
  const client = new ApolloClient({
    link: storyLink(responses),
    cache: new InMemoryCache(),
  })
  seed?.(client)
  return client
}

function applySession({
  me = null,
  token = false,
  authLoading = false,
  suspended = false,
  deletionScheduled = false,
}: StorySessionOptions) {
  clearAccountDisabled()
  clearDeletionScheduled()
  if (suspended || me?.disabled) markAccountDisabled()
  if (deletionScheduled) markDeletionScheduled()
  if (token) setAuthToken(STORY_AUTH_TOKEN)
  else clearAuthToken()
  useUserStore.setState({
    user: me
      ? { id: me.id, email: me.email, createdAt: String(me.createdAt) }
      : null,
    me,
    isLoading: authLoading,
    getUser: authLoading
      ? () => new Promise(() => {}) as ReturnType<typeof realGetUser>
      : async () => useUserStore.getState().user,
  })
}

function resetSession() {
  clearAccountDisabled()
  clearDeletionScheduled()
  clearAuthToken()
  useUserStore.setState({
    user: null,
    me: null,
    isLoading: false,
    getUser: realGetUser,
  })
}

function StorySession({
  options,
  children,
}: {
  options: StorySessionOptions
  children: ReactNode
}) {
  const [client] = useState(() => createStoryApolloClient(options))
  const apply = useMemo(() => () => applySession(options), [options])

  return (
    <StorySeed apply={apply} reset={resetSession}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </StorySeed>
  )
}

/**
 * Story-only session: seeds the user store (`me`, or signed out), swaps the
 * live API for a story-only Apollo client, and clears both afterwards. Use
 * one per story: nested sessions fight over the same store.
 */
export function withSession<TArgs>(
  options: StorySessionOptions = {},
): Decorator<TArgs> {
  return (Story) => (
    <StorySession options={options}>
      <Story />
    </StorySession>
  )
}

/**
 * The email the login form hands to forgot-password in sessionStorage. Pass
 * `''` for a visitor who opened the page directly.
 */
export function withResetEmail<TArgs>(email: string): Decorator<TArgs> {
  const apply = () => stashResetEmail(email)
  const reset = () => stashResetEmail('')
  return (Story) => (
    <StorySeed apply={apply} reset={reset}>
      <Story />
    </StorySeed>
  )
}

type TurnstileStub = NonNullable<Window['turnstile']>

/**
 * Stands in for Cloudflare's Turnstile and Sign in with Apple scripts, which
 * the real widgets would load from the network with the production keys in
 * `.env`. Turnstile draws a placeholder box and, when `captchaSolved`, hands
 * the form a token straight away. Apple's button is always ready.
 */
export function withAuthWidgets<TArgs>({
  captchaSolved = false,
}: { captchaSolved?: boolean } = {}): Decorator<TArgs> {
  const turnstile: TurnstileStub = {
    render: (element, options) => {
      element.innerHTML =
        '<div style="border:1px solid var(--chakra-colors-border-default);border-radius:8px;padding:20px 16px;font-size:14px;color:var(--chakra-colors-text-muted)">Security check placeholder</div>'
      if (captchaSolved) options.callback?.('story-turnstile-token')
      return 'story-turnstile'
    },
    remove: () => {},
  }
  const apply = () => {
    window.turnstile = turnstile
    window.AppleID = {
      auth: {
        init: () => {},
        signIn: () => Promise.reject({ error: 'popup_closed_by_user' }),
      },
    }
  }
  const reset = () => {
    window.turnstile = undefined
    window.AppleID = undefined
  }
  return (Story) => (
    <StorySeed apply={apply} reset={reset}>
      <Story />
    </StorySeed>
  )
}
