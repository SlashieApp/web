import { Box, type BoxProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Header } from '../Header'
import {
  MOBILE_BOTTOM_NAV_CLEARANCE,
  MobileBottomNav,
} from '../MobileBottomNav'

export type AppShellProps = {
  children: ReactNode
  /** Extra props for the scrolling `main` pane. */
  mainProps?: BoxProps
} & Omit<BoxProps, 'children'>

/**
 * Shared marketplace / account chrome: sticky Header, scrolling main,
 * glass MobileBottomNav. `isolation` keeps Mapbox canvases under the Header.
 */
export function AppShell({ children, mainProps, ...props }: AppShellProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100dvh"
      isolation="isolate"
      {...props}
    >
      <Header flexShrink={0} />
      <Box
        as="main"
        flex={1}
        minH={0}
        overflowY="auto"
        position="relative"
        zIndex={0}
        pb={{ base: MOBILE_BOTTOM_NAV_CLEARANCE, md: 0 }}
        {...mainProps}
      >
        {children}
      </Box>
      <MobileBottomNav />
    </Box>
  )
}
