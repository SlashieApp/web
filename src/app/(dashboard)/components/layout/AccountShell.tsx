import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { AppShell } from '@/ui/AppShell'

type AccountShellProps = {
  children: ReactNode
  hasSession?: boolean
}

/**
 * Account-hub page chrome: shared app Header + scrolling main + bottom nav.
 * Page titles live on each route via DashboardPageLayout, not a second header.
 * The page container comes with that layout, so the shell has none of its own.
 */
export function AccountShell({
  children,
  hasSession = false,
}: AccountShellProps) {
  return (
    <AppShell hasSession={hasSession} bg="bg.canvas" color="text.default">
      {/* The page's sticky header brings its own top spacing. */}
      <Box pb={{ base: 5, md: 6 }} display="flex" flexDirection="column">
        {children}
      </Box>
    </AppShell>
  )
}
