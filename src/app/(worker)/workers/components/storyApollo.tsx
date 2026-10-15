'use client'

import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core'
import { ApolloProvider } from '@apollo/client/react'
import { Observable } from '@apollo/client/utilities'
import type { Decorator } from '@storybook/nextjs-vite'

/** A request that never answers: the story stays in its loading state. */
function neverResolves() {
  return new Observable<ApolloLink.Result>(() => {})
}

/**
 * Story-only Apollo client. `answer` returns a response for the operations a
 * story wants to show; everything else hangs instead of reaching the API
 * (`.env` points at production), so a click on Save, Report or Search in a
 * story can never send a real request.
 */
export function createStoryApolloClient(
  answer?: (
    operation: ApolloLink.Operation,
  ) => Observable<ApolloLink.Result> | undefined,
) {
  return new ApolloClient({
    link: new ApolloLink((operation) => answer?.(operation) ?? neverResolves()),
    cache: new InMemoryCache(),
  })
}

const idleClient = createStoryApolloClient()

/** For components that only need Apollo hooks to exist: nothing ever answers. */
export const withStoryApollo: Decorator = (Story) => (
  <ApolloProvider client={idleClient}>
    <Story />
  </ApolloProvider>
)
