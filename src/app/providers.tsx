'use client'

import { ApolloProvider } from '@apollo/client/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'

import { apolloClient } from '@/utils/apolloClient'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    </ApolloProvider>
  )
}
