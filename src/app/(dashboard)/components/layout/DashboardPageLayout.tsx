'use client'

import { Box, Grid, HStack, Stack } from '@chakra-ui/react'
import type { ReactNode, Ref } from 'react'

import { DashboardPageHeader } from './DashboardPageHeader'
import {
  DashboardSectionNav,
  type DashboardSectionNavItem,
} from './DashboardSectionNav'

export type DashboardPageLayoutProps = {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  /** Right-aligned controls beside the page title (e.g. primary CTAs). */
  actions?: ReactNode
  /** Content between the header and section nav (hero, banners). */
  afterHeader?: ReactNode
  /** Content between section nav and the body (checkout notices, errors). */
  afterNav?: ReactNode
  sections?: readonly DashboardSectionNavItem[]
  activeSectionHref?: string
  /**
   * When set, renders a 65/35 main + sidebar grid on large screens.
   * Omit for full-width body content (lists, overview dashboards).
   */
  sidebar?: ReactNode
  /** When false, sidebar is desktop-only (default true). */
  sidebarOnMobile?: boolean
  /** Anchor id for the page root (default `overview`). */
  id?: string
  rootRef?: Ref<HTMLDivElement>
  children: ReactNode
}

/**
 * Shared shell for dashboard hub pages: eyebrow header, optional section nav,
 * and either a full-width body or a main + sidebar split.
 */
export function DashboardPageLayout({
  eyebrow,
  title,
  description,
  actions,
  afterHeader,
  afterNav,
  sections,
  activeSectionHref,
  sidebar,
  sidebarOnMobile = true,
  id = 'overview',
  rootRef,
  children,
}: DashboardPageLayoutProps) {
  const header = (
    <DashboardPageHeader
      eyebrow={eyebrow}
      title={title}
      description={description}
    />
  )

  return (
    <Stack ref={rootRef} gap={{ base: 5, md: 6 }} id={id}>
      {actions ? (
        <HStack
          justify="space-between"
          align="flex-start"
          gap={4}
          flexWrap="wrap"
        >
          <Box flex="1" minW={{ base: '100%', sm: '240px' }}>
            {header}
          </Box>
          <HStack gap={2} flexWrap="wrap" flexShrink={0}>
            {actions}
          </HStack>
        </HStack>
      ) : (
        header
      )}

      {afterHeader}

      {sections && sections.length > 0 ? (
        <DashboardSectionNav items={sections} activeHref={activeSectionHref} />
      ) : null}

      {afterNav}

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
        children
      )}
    </Stack>
  )
}
