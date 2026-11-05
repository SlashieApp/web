'use client'

import { Box, Grid, Stack } from '@chakra-ui/react'
import type { ReactNode, Ref } from 'react'

import { READABLE_COLUMN_MAX_W } from '@/theme/pageContainer'

import { PageContainer } from '../PageContainer'
import { StickyHeader, type StickyHeaderProps } from '../StickyHeader'

export type PageLayoutProps = Pick<
  StickyHeaderProps,
  | 'title'
  | 'eyebrow'
  | 'description'
  | 'onBack'
  | 'backAriaLabel'
  | 'option'
  | 'titleMaxLines'
> & {
  /**
   * `column`: one readable column of 45rem (720px), LEFT-aligned on the logo
   * line (R3): Account, Billing, settings-style pages, single-column flows.
   * `wide`: the full container, logo line to menu line, with an optional rail
   * (R4): Profile, My tasks, lists.
   */
  width?: 'column' | 'wide'
  /** Between the header and the body (hero, notices); in the column on a `column` page. */
  afterHeader?: ReactNode
  /** Rail beside the body on large screens; stacks under it on phones. `wide` only. */
  sidebar?: ReactNode
  /** When false, the rail is desktop-only (default true). */
  sidebarOnMobile?: boolean
  rootRef?: Ref<HTMLDivElement>
  children: ReactNode
}

/**
 * The page layout rule as one component. Inside the page container (R1):
 *
 * 1. the page header (`StickyHeader`: Back, the title as the h1, a
 *    description) starts on the logo line and spans the container at every
 *    width (R2), whatever the body below it is;
 * 2. then the body, either one readable column (`width="column"`, 45rem,
 *    left-aligned on the same line, R3) or the full container with an
 *    optional rail on the right from lg (`width="wide"`, R4).
 *
 * It brings its own {@link PageContainer}: do not wrap it in one (the gutters
 * would double). Pages whose content is not a plain column (a map, a band)
 * compose `PageContainer` / `PageBleed` and `StickyHeader` themselves.
 */
export function PageLayout({
  title,
  eyebrow,
  description,
  onBack,
  backAriaLabel,
  option,
  titleMaxLines,
  width = 'column',
  afterHeader,
  sidebar,
  sidebarOnMobile = true,
  rootRef,
  children,
}: PageLayoutProps) {
  const body = sidebar ? (
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
  )

  const content = (
    <Stack gap={{ base: 4, md: 5 }}>
      {afterHeader}
      {body}
    </Stack>
  )

  return (
    <PageContainer ref={rootRef} flex="1">
      <StickyHeader
        title={title}
        eyebrow={eyebrow}
        description={description}
        onBack={onBack}
        backAriaLabel={backAriaLabel}
        option={option}
        titleMaxLines={titleMaxLines}
      >
        {width === 'column' ? (
          <Box
            data-page-layout-column=""
            w="full"
            maxW={READABLE_COLUMN_MAX_W}
            minW={0}
          >
            {content}
          </Box>
        ) : (
          content
        )}
      </StickyHeader>
    </PageContainer>
  )
}
