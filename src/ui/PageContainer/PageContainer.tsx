'use client'

import {
  Box,
  type BoxProps,
  Container,
  type ContainerProps,
} from '@chakra-ui/react'
import type { ReactNode, Ref } from 'react'

import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'

/**
 * Which gutters the container brings (the page's own gutters are
 * `PAGE_GUTTER_X`: 16 below md, 24 from md, 32 from lg).
 *
 * - `all`: every width. The default, the site header's own gutters.
 * - `lg`: none below lg, 32 from lg. Messages and the create-task map: the
 *   inbox or the map runs edge to edge on phones and tablets.
 * - `none`: no gutters; the content brings its own.
 */
export type PageContainerGutters = 'all' | 'lg' | 'none'

/** The container's `px` for each {@link PageContainerGutters}. */
export const PAGE_CONTAINER_GUTTERS: Record<
  PageContainerGutters,
  ContainerProps['px']
> = {
  all: PAGE_GUTTER_X,
  lg: { base: 0, lg: PAGE_GUTTER_X.lg },
  none: 0,
}

export type PageContainerProps = Omit<ContainerProps, 'maxW' | 'px'> & {
  gutters?: PageContainerGutters
  ref?: Ref<HTMLDivElement>
}

/**
 * The page container (R1): the same measure as the site header, 80rem
 * (`PAGE_CONTAINER_MAX_W`) wide at most, centred, with the page gutters. Its
 * content box is the logo line on the left and the menu line on the right,
 * and every page's content sits in it (R2 to R4). It is Chakra's `Container`,
 * so `as`, `ref` and style props work as on one.
 *
 * Below lg the app has no site header (the bottom navigation takes over), but
 * the gutters are the same (16, 24 from md), so a page starts where it would
 * under the header.
 *
 * Full-bleed elements (a map, a band, a cover, a page background) go edge to
 * edge: use {@link PageBleed}, which keeps their content in the container.
 */
export function PageContainer({
  gutters = 'all',
  ...props
}: PageContainerProps) {
  return (
    <Container
      data-page-container=""
      maxW={PAGE_CONTAINER_MAX_W}
      px={PAGE_CONTAINER_GUTTERS[gutters]}
      {...props}
    />
  )
}

export type PageBleedProps = Omit<BoxProps, 'children'> & {
  /** Gutters of the container inside the bleed. */
  gutters?: PageContainerGutters
  /** Style props for the container inside the bleed (its layout, stacking). */
  contentProps?: Omit<PageContainerProps, 'gutters' | 'children'>
  /** The outer, full-bleed box. */
  ref?: Ref<HTMLDivElement>
  children?: ReactNode
}

/**
 * A full-bleed element whose content sits in the page container (R5): the
 * outer box runs edge to edge and takes the background, border or media; what
 * is inside lines up with the logo line and the menu line. Maps, bands,
 * covers and sticky bars use it.
 */
export function PageBleed({
  gutters = 'all',
  contentProps,
  children,
  ...props
}: PageBleedProps) {
  return (
    <Box w="full" {...props}>
      <PageContainer gutters={gutters} {...contentProps}>
        {children}
      </PageContainer>
    </Box>
  )
}
