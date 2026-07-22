'use client'

import type { ReactNode } from 'react'

import { Box } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'

import { Dock } from '@/ui/Dock'
import { Header } from '@/ui/Header'
import { isStepFlowStandaloneRoute } from '@/utils/stepFlowRoutes'

type TaskRouteChromeProps = {
  children: ReactNode
}

/**
 * Discovery/task shell with Header + Dock, except StepFlow routes
 * (`/tasks/create`, `/tasks/[slug]/quote`) which own chrome via StepFlowLayout.
 */
export function TaskRouteChrome({ children }: TaskRouteChromeProps) {
  const pathname = usePathname()

  if (isStepFlowStandaloneRoute(pathname)) {
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
          position="relative"
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
