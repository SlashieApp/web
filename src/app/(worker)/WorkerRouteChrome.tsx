'use client'

import type { ReactNode } from 'react'

import { Box } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'

import { Dock, Header } from '@ui'

type WorkerRouteChromeProps = {
  children: ReactNode
}

/** Standalone onboarding routes render without app header or dock. */
function isStandaloneWorkerRoute(pathname: string | null): boolean {
  return Boolean(pathname?.startsWith('/worker/setup'))
}

export function WorkerRouteChrome({ children }: WorkerRouteChromeProps) {
  const pathname = usePathname()

  if (isStandaloneWorkerRoute(pathname)) {
    return (
      <Box minH="100dvh" bg="bg.subtle" display="flex" flexDirection="column">
        {children}
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" height="100dvh">
      <Header />
      <Box
        as="main"
        flex={1}
        display="flex"
        flexDirection={{ base: 'column', md: 'row' }}
        minH={0}
        overflow="hidden"
      >
        <Box
          flex={1}
          minW={0}
          minH={0}
          overflowY="auto"
          order={{ base: 1, md: 2 }}
        >
          {children}
        </Box>
        <Box
          flexShrink={0}
          order={{ base: 2, md: 1 }}
          w={{ base: 'full', md: 'auto' }}
        >
          <Dock />
        </Box>
      </Box>
    </Box>
  )
}
