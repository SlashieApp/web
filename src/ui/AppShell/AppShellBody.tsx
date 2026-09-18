'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'
import {
  type MutableRefObject,
  type ReactNode,
  type Ref,
  useCallback,
} from 'react'

import { sdlMotion } from '@/theme/styles'

import { Header } from '../Header'
import {
  MOBILE_BOTTOM_NAV_CLEARANCE,
  MobileBottomNav,
} from '../MobileBottomNav'

import { shouldHideMobileNav } from './shouldHideMobileNav'
import { useHideHeaderOnScroll } from './useHideHeaderOnScroll'

type AppShellMainProps = BoxProps & {
  ref?: Ref<HTMLDivElement>
}

type AppShellBodyProps = {
  children: ReactNode
  mainProps?: AppShellMainProps
  hasSession?: boolean
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (!ref) return
  if (typeof ref === 'function') ref(node)
  else (ref as MutableRefObject<T | null>).current = node
}

/** Header + scrolling main + optional mobile dock. Task detail hides the dock. */
export function AppShellBody({
  children,
  mainProps,
  hasSession = false,
}: AppShellBodyProps) {
  const hideMobileNav = shouldHideMobileNav(usePathname() ?? '')
  const { hidden, onScrollRootRef } = useHideHeaderOnScroll(hideMobileNav)
  const { ref: mainPropsRef, ...restMainProps } = mainProps ?? {}
  const onMainRef = useCallback(
    (node: HTMLDivElement | null) => {
      onScrollRootRef(node)
      assignRef(mainPropsRef, node)
    },
    [onScrollRootRef, mainPropsRef],
  )

  return (
    <>
      <Box
        flexShrink={0}
        display={{ base: 'grid', lg: 'contents' }}
        overflow={{ base: 'hidden', lg: 'visible' }}
        inert={hidden || undefined}
        css={{
          gridTemplateRows: hidden ? '0fr' : '1fr',
          transitionProperty: 'grid-template-rows',
          transitionDuration: sdlMotion.duration.moderate,
          transitionTimingFunction: sdlMotion.easing.standard,
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        }}
      >
        <Box minH={0} overflow={{ base: 'hidden', lg: 'visible' }}>
          <Header flexShrink={0} hasSession={hasSession} overflow="visible" />
        </Box>
      </Box>
      <Box
        as="main"
        flex={1}
        minH={0}
        minW={0}
        overflowX="clip"
        overflowY="auto"
        position="relative"
        zIndex={0}
        pb={hideMobileNav ? 0 : { base: MOBILE_BOTTOM_NAV_CLEARANCE, lg: 0 }}
        {...restMainProps}
        ref={onMainRef}
      >
        {children}
      </Box>
      {hideMobileNav ? null : <MobileBottomNav />}
    </>
  )
}
