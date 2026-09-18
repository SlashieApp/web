import { Box, type BoxProps } from '@chakra-ui/react'
import type { ReactNode, Ref } from 'react'

import { AppShellBody } from './AppShellBody'

export type AppShellProps = {
  children: ReactNode
  /** Extra props for the scrolling `main` pane. */
  mainProps?: BoxProps & { ref?: Ref<HTMLDivElement> }
  /**
   * Auth cookie present on this request. Forwarded to Header so logged-in
   * visitors SSR account skeletons instead of guest Log in / Sign up.
   */
  hasSession?: boolean
} & Omit<BoxProps, 'children'>

/**
 * Shared marketplace / account chrome: Header, scrolling main, glass
 * MobileBottomNav. Task detail hides the dock and tucks the header on
 * scroll-down; search and other routes keep both. `isolation` keeps Mapbox
 * canvases under the Header.
 */
export function AppShell({
  children,
  mainProps,
  hasSession = false,
  ...props
}: AppShellProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100dvh"
      isolation="isolate"
      overflow="visible"
      {...props}
    >
      <AppShellBody mainProps={mainProps} hasSession={hasSession}>
        {children}
      </AppShellBody>
    </Box>
  )
}
