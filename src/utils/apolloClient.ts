'use client'

import { ApolloClient, InMemoryCache, from } from '@apollo/client/core'
import { createHttpLink } from '@apollo/client/link/http'
import { setContext } from '@apollo/client/link/context'

function getTokenFromCookie() {
  if (typeof document === 'undefined') return null
  const match = RegExp('auth=([^;]+)').exec(document.cookie)
  return match?.[1] ?? null
}

const httpLink = createHttpLink({
  // Prefer a full URL (recommended): https://handyman-apollo.onrender.com/graphql
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_URL ||
    'http://localhost:4000/graphql',
})

const authLink = setContext((_, { headers }) => {
  const token = getTokenFromCookie()
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
})
