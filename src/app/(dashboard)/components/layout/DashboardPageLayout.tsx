'use client'

import { Box, Grid, Stack } from '@chakra-ui/react'
import type { ReactNode, Ref } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { useGoBack } from '@/utils/goBack'
import { StickyHeader } from '@ui'

import bag from '../../i11n.json'

/** One readable column for settings pages. */
const NARROW_MAX_W = '720px'

export type DashboardPageLayoutProps = {
  /** The h1: the same words as the menu item and the browser tab. */
  title: string
  /** One short line under the title. */
  description?: ReactNode
  /** Between the header and the body (hero, notices). */
  afterHeader?: ReactNode
  /** `narrow`: one readable column. `wide`: the page width, with an optional rail. */
  width?: 'narrow' | 'wide'
  /** Rail beside the body on large screens; stacks under it on phones. */
  sidebar?: ReactNode
  /** When false, the rail is desktop-only (default true). */
  sidebarOnMobile?: boolean
  rootRef?: Ref<HTMLDivElement>
  children: ReactNode
}

/**
 * Page contract for the signed-in dashboard pages: the page header (FE-458),
 * whose big title is the h1 and matches the menu label, with Back at every
 * width and the title collapsing into the bar on scroll, then the body in one
 * readable column or with a rail.
 */
export function DashboardPageLayout({
  title,
  description,
  afterHeader,
  width = 'narrow',
  sidebar,
  sidebarOnMobile = true,
  rootRef,
  children,
}: DashboardPageLayoutProps) {
  const t = useI11n(bag)
  const onBack = useGoBack()

  return (
    <Box
      ref={rootRef}
      w="full"
      maxW={width === 'narrow' ? NARROW_MAX_W : undefined}
      mx="auto"
    >
      <StickyHeader
        title={title}
        description={description}
        onBack={onBack}
        backAriaLabel={t.page.backAria}
      >
        <Stack gap={{ base: 4, md: 5 }}>
          {afterHeader}
          {sidebar ? (
            <Grid
              templateColumns={{
                base: '1fr',
                lg: 'minmax(0, 1.85fr) minmax(280px, 1fr)',
              }}
              gap={6}
              alignItems="start"
            >
              <Stack gap={4} minW={0}>
                {children}
              </Stack>
              <Stack
                gap={4}
                minW={0}
                display={{
                  base: sidebarOnMobile ? 'flex' : 'none',
                  lg: 'flex',
                }}
              >
                {sidebar}
              </Stack>
            </Grid>
          ) : (
            <Stack gap={4} minW={0}>
              {children}
            </Stack>
          )}
        </Stack>
      </StickyHeader>
    </Box>
  )
}
