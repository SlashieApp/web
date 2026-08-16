'use client'

import { Box } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { Header } from '@/ui/Header'
import {
  MOBILE_BOTTOM_NAV_CLEARANCE,
  MobileBottomNav,
} from '@/ui/MobileBottomNav'

import { isTaskDetailPath } from './helpers/isTaskDetailPath'

/**
 * Pathname-aware (task) chrome. Hides the app Header and MobileBottomNav on
 * `/tasks/[slug]` at `<lg` so mobile task detail can own the viewport. Other
 * (task) routes and desktop (`lg+`) task detail keep the usual chrome.
 */
export function TaskSegmentChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideMobileTaskChrome = isTaskDetailPath(pathname)

  return (
    <Box display="flex" flexDirection="column" height="100dvh">
      <Header
        display={{
          base: hideMobileTaskChrome ? 'none' : 'flex',
          lg: 'flex',
        }}
      />
      <Box
        as="main"
        flex={1}
        minH={0}
        overflowY={
          hideMobileTaskChrome ? { base: 'hidden', lg: 'auto' } : 'auto'
        }
        position="relative"
        pb={
          hideMobileTaskChrome
            ? { base: 0, lg: 0 }
            : { base: MOBILE_BOTTOM_NAV_CLEARANCE, md: 0 }
        }
      >
        {children}
      </Box>
      {hideMobileTaskChrome ? null : <MobileBottomNav />}
    </Box>
  )
}
