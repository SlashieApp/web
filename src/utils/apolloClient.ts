'use client'

import { ApolloClient, InMemoryCache, from } from '@apollo/client/core'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { createHttpLink } from '@apollo/client/link/http'

import { captureApiError, getCurrentRoute } from '@/lib/analytics'

import { clearAuthToken, getAuthToken } from './auth'
import { isUnauthenticatedError } from './graphqlErrors'

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
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})
