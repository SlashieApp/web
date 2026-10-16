'use client'

import { Box, Grid, Stack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { type ReactNode, type Ref, useCallback } from 'react'

import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { APP_HOME } from '@/utils/appRoutes'
import { StickyHeader } from '@ui'

import bag from '../../i11n.json'

/** One readable column for settings pages. */
const NARROW_MAX_W = '720px'

export type DashboardPageLayoutProps = {
  /** The h1: the same words as the menu item and the browser tab. */
  title: string
  /** One short line under the title. */
  description?: ReactNode
  /** At most one button beside the title. */
  action?: ReactNode
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
 * Page contract for the signed-in dashboard pages: a sticky header whose h1
 * matches the menu label, a back control on phones (no app header there),
 * then the body in one readable column or with a rail.
 */
export function DashboardPageLayout({
  title,
  description,
  action,
  afterHeader,
  width = 'narrow',
  sidebar,
  sidebarOnMobile = true,
  rootRef,
  children,
}: DashboardPageLayoutProps) {
  const t = useI11n(bag)
  const router = useRouter()
  const localize = useLocalizedHref()
  const onBack = useCallback(() => {
    if (window.history.length > 1) router.back()
    else router.push(localize(APP_HOME))
  }, [localize, router])

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
        action={action}
        onBack={onBack}
        backLabel={t.page.back}
        backAriaLabel={t.page.backAria}
        hideBackFrom="lg"
      />
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
              display={{ base: sidebarOnMobile ? 'flex' : 'none', lg: 'flex' }}
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
    </Box>
  )
}
