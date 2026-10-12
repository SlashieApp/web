'use client'

import {
  ApolloClient,
  InMemoryCache,
  type Reference,
  from,
  split,
} from '@apollo/client/core'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { createHttpLink } from '@apollo/client/link/http'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { isSubscriptionOperation } from '@apollo/client/utilities'
import { type Client, createClient } from 'graphql-ws'

import { markAccountDisabled } from '@/utils/accountDisabledState'
import { captureApiError, getCurrentRoute } from '@/utils/analytics'
import {
  clearApiUnavailable,
  redirectToLandingIfAppRoute,
} from '@/utils/apiAvailability'

import { clearAuthToken, getAuthToken } from './auth'
import { isAccountDisabledError, isUnauthenticatedError } from './graphqlErrors'

const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_GRAPHQL_URL}/graphql`,
})

const authLink = setContext((_, { headers }) => {
  const token = getAuthToken()
  if (!token) {
    return { headers }
  }

  return {
    headers: {
      ...headers,
      authorization: `Bearer ${token}`,
    },
  }
})

const errorLink = onError(({ error, operation }) => {
  if (isAccountDisabledError(error)) {
    if (getAuthToken()) markAccountDisabled()
    return
  }

  if (isUnauthenticatedError(error)) {
    clearAuthToken()
  }

  const operationName = operation?.operationName ?? 'unknown'
  const operationType = operation?.query.definitions.find(
    (def) => def.kind === 'OperationDefinition',
  )
  const opType =
    operationType && operationType.kind === 'OperationDefinition'
      ? operationType.operation
      : undefined

  if (CombinedGraphQLErrors.is(error)) {
    for (const gqlError of error.errors) {
      captureApiError(gqlError, {
        flow: 'graphql',
        action: 'apollo_onError',
        source: 'graphql',
        url_or_operation: operationName,
        route: getCurrentRoute(),
        operation_type: opType,
      })
    }
    return
  }

  if (error) {
    captureApiError(error, {
      flow: 'graphql',
      action: 'apollo_onError',
      source: 'graphql',
      url_or_operation: operationName,
      route: getCurrentRoute(),
      operation_type: opType,
    })

    if (!CombinedGraphQLErrors.is(error)) {
      redirectToLandingIfAppRoute()
    }
  }
})

let wsClient: Client | null = null

/**
 * Subscriptions (Messages `threadItemAdded`) over graphql-ws. Lazy: the
 * socket opens with the first subscription; the JWT is read on every
 * connect. Browser only.
 */
function realtimeClient(): Client {
  if (!wsClient) {
    const httpUrl = `${process.env.NEXT_PUBLIC_GRAPHQL_URL}/graphql`
    wsClient = createClient({
      url: httpUrl.replace(/^http/, 'ws'),
      lazy: true,
      retryAttempts: Number.POSITIVE_INFINITY,
      connectionParams: () => {
        const token = getAuthToken()
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    })
  }
  return wsClient
}

/** Reconnect with the current token (sign-in, sign-out, account switch). */
export function restartRealtimeConnection() {
  wsClient?.terminate()
  wsClient = null
}

const realtimeLink = new GraphQLWsLink({
  // Created on first use so server rendering never opens a socket.
  subscribe: (...args: Parameters<Client['subscribe']>) =>
    realtimeClient().subscribe(...args),
  iterate: (...args: Parameters<Client['iterate']>) =>
    realtimeClient().iterate(...args),
  on: (...args: Parameters<Client['on']>) => realtimeClient().on(...args),
  terminate: () => realtimeClient().terminate(),
  dispose: () => realtimeClient().dispose(),
} as Client)

export const apolloClient = new ApolloClient({
  // Subscriptions skip the error link: a dropped socket must not trigger the
  // offline redirect; the Messages provider handles it.
  link: split(
    ({ query }) => isSubscriptionOperation(query),
    realtimeLink,
    from([errorLink, authLink, httpLink]),
  ),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Discovery pages (FE-201): one list per filter + sort; a page
          // fetched with `after` appends, a fresh query replaces.
          // Messages (FE-202): `before` loads older items (newest first).
          threadItems: {
            keyArgs: ['threadId'],
            merge(
              existing: readonly Reference[] | undefined,
              incoming: readonly Reference[],
              { args, readField },
            ) {
              if (!args?.before || !existing) return incoming
              const seen = new Set(existing.map((ref) => readField('id', ref)))
              return [
                ...existing,
                ...incoming.filter((ref) => !seen.has(readField('id', ref))),
              ]
            },
          },
          tasks: {
            keyArgs: ['filter', 'sort'],
            merge(
              existing: readonly Reference[] | undefined,
              incoming: readonly Reference[],
              { args, readField },
            ) {
              if (!args?.after || !existing) return incoming
              const seen = new Set(existing.map((ref) => readField('id', ref)))
              return [
                ...existing,
                ...incoming.filter((ref) => !seen.has(readField('id', ref))),
              ]
            },
          },
        },
      },
    },
  }),
})
