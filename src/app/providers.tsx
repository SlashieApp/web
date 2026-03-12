'use client'

import { ApolloProvider } from '@apollo/client/react'
import { ChakraProvider } from '@chakra-ui/react'

import { system } from '@/theme/system'
import { apolloClient } from '@/utils/apolloClient'

import { PostHogProvider } from './PostHogProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <ChakraProvider value={system}>
        <PostHogProvider>{children}</PostHogProvider>
      </ChakraProvider>
    </ApolloProvider>
  )
}
