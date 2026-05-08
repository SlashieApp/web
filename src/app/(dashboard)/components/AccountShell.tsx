'use client'

import { Box, Container, Grid, Heading, Stack, Text } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'

import { Header } from '@ui'

import { resolveAccountNavKey } from '../helpers/accountNav'
import { AccountSideNav, AccountTabStrip } from './AccountSideNav'

type AccountShellProps = {
  children: React.ReactNode
}

/**
 * Merged customer + worker account shell. Composes the canonical site Header
 * plus an in-area side nav (desktop) / tab strip (mobile). Auth gating + me
 * hydration are handled by the route group `layout.tsx`.
 */
export function AccountShell({ children }: AccountShellProps) {
  const pathname = usePathname()
  const active = resolveAccountNavKey(pathname)

  return (
    <Box minH="100dvh" bg="neutral.100" color="cardFg">
      <Header />
      <Box display={{ base: 'block', lg: 'none' }}>
        <AccountTabStrip active={active} />
      </Box>
      <Container
        maxW="container.xl"
        px={{ base: 4, md: 6 }}
        py={{ base: 6, md: 8 }}
      >
        <Grid
          templateColumns={{ base: '1fr', lg: '240px 1fr' }}
          gap={{ base: 0, lg: 8 }}
          alignItems="start"
        >
          <Box
            display={{ base: 'none', lg: 'block' }}
            position="sticky"
            top={4}
          >
            <Stack
              gap={4}
              p={4}
              bg="cardBg"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="cardBorder"
            >
              <Stack gap={0}>
                <Heading size="sm" color="cardFg">
                  Account hub
                </Heading>
                <Text fontSize="xs" color="formLabelMuted">
                  Customer + worker tools in one workspace.
                </Text>
              </Stack>
              <AccountSideNav active={active} />
            </Stack>
          </Box>
          <Box minW={0}>{children}</Box>
        </Grid>
      </Container>
    </Box>
  )
}
