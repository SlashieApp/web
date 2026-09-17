import { Box, Container } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { AppShell } from '@/ui/AppShell'
import { Footer } from '@ui'

type AccountShellProps = {
  children: ReactNode
  hasSession?: boolean
}

/**
 * Account-hub page chrome: shared app Header + scrolling main + bottom nav.
 * Page titles live on each route via DashboardPageLayout — not a second header.
 */
export function AccountShell({
  children,
  hasSession = false,
}: AccountShellProps) {
  return (
    <AppShell hasSession={hasSession} bg="bg.subtle" color="text.default">
      <Box py={{ base: 5, md: 6 }} display="flex" flexDirection="column">
        <Container flex="1" w="full">
          {children}
        </Container>
        {/* Legal strip stays at the end of the scrolling content. */}
        <Footer variant="minimal" mt={{ base: 8, md: 10 }} bg="transparent" />
      </Box>
    </AppShell>
  )
}
