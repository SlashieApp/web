'use client'

import {
  Box,
  type BoxProps,
  Heading,
  type HeadingProps,
  Text,
} from '@chakra-ui/react'
import { type ReactNode, useCallback, useRef } from 'react'
import { LuArrowLeft } from 'react-icons/lu'

import { IconButton } from '../IconButton/IconButton'
import { attachHeaderCollapse } from './attachHeaderCollapse'
import {
  BAR_H,
  BAR_TITLE_INSET,
  BAR_TITLE_PX,
  BAR_TITLE_TOP,
  BUTTON_BOX,
  BUTTON_OVERHANG,
  GLYPH_PX,
  OPTION_GAP,
  TITLE_GAP,
  TITLE_PX,
} from './headerCollapse'

type Length = string | number

/** A CSS length (a number is px), or one per breakpoint. */
type StickyTop =
  | Length
  | Partial<Record<'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl', Length>>

export type StickyHeaderProps = {
  /**
   * The page's title: the big h1 under the bar, and the bar's one-line copy
   * once it has collapsed. Leave it out for a bar with just Back.
   */
  title?: string
  /** One line under the big title (not with `overMedia`). */
  description?: ReactNode
  /** Shows the back button, in the bar's left, when set. */
  onBack?: () => void
  /** Accessible label for the icon back button (it has no visible text). */
  backAriaLabel?: string
  /**
   * The page's own icon button for the bar's right (such as the task options).
   * It is a 44px box; spread `HEADER_ICON_BUTTON` (or `HEADER_OVERLAY_BUTTON`
   * over a map) onto it for its 24px glyph and look. It comes right after Back
   * in the tab and reading order.
   */
  option?: ReactNode
  /** The page's own background colour, which the bar is painted in. */
  background?: BoxProps['bg']
  /** Where the bar sticks: 0, or under a sticky site header. */
  stickyTop?: StickyTop
  /** The page's column: the widest the bar's row and the big title get. */
  contentMaxW?: BoxProps['maxW']
  /**
   * Gutters for a header that is not inside the page's `<Container>`: the
   * bar's row then brings them and centres its column. Inside a Container
   * leave it out, the Container has them.
   */
  contentPx?: BoxProps['px']
  /**
   * A map or cover sits behind the bar (task details, a public profile): the
   * bar floats over it and is transparent until the title collapses into it,
   * then fades to `background`. The page then draws its own big title lower
   * down, with `StickyHeaderTitle`.
   */
  overMedia?: boolean
  /** The page. It scrolls under the bar, which sticks to the top of it. */
  children?: ReactNode
}

/** The big title's look, for the h1 and for the copy that moves into the bar. */
const TITLE_STYLE = {
  fontFamily: 'heading',
  fontSize: `${TITLE_PX}px`,
  fontWeight: 700,
  lineHeight: '1.2',
  color: 'text.default',
  overflowWrap: 'anywhere',
} as const

/**
 * The bar's icon buttons hold a 24px glyph. Chakra sizes an icon button's svg
 * itself, so it has to be said in css. The bar gives it to its own back
 * button; a page spreads it onto the option button it passes.
 */
export const HEADER_ICON_BUTTON = {
  css: { '& svg': { width: `${GLYPH_PX}px`, height: `${GLYPH_PX}px` } },
} as const

/**
 * The same over a map or cover: the frosted white chip task details always
 * had, for Back and the option button.
 */
export const HEADER_OVERLAY_BUTTON = {
  ...HEADER_ICON_BUTTON,
  bg: 'whiteAlpha.700',
  _hover: { bg: 'whiteAlpha.900', color: 'text.default' },
} as const

const cssLength = (value: Length) =>
  typeof value === 'number' ? `${value}px` : value

/** `stickyTop` as CSS lengths, `extra` px further down. */
function topFor(stickyTop: StickyTop, extra = 0): BoxProps['top'] {
  const at = (value: Length) =>
    extra ? `calc(${cssLength(value)} + ${extra}px)` : cssLength(value)
  if (typeof stickyTop === 'string' || typeof stickyTop === 'number') {
    return at(stickyTop)
  }
  return Object.fromEntries(
    Object.entries(stickyTop).flatMap(([breakpoint, value]) =>
      value === undefined ? [] : [[breakpoint, at(value)]],
    ),
  ) as BoxProps['top']
}

/**
 * The page's one h1, in the big title's look (34px, bold). `StickyHeader`
 * draws it itself on an ordinary page; a page whose title rests lower (task
 * details, a public profile) renders it where it belongs, and the header
 * finds it there to collapse it into the bar. On its own it is a plain
 * heading.
 */
export function StickyHeaderTitle({
  children,
  ...rest
}: Omit<HeadingProps, 'as'>) {
  return (
    <Heading as="h1" data-sticky-header-title="" {...TITLE_STYLE} {...rest}>
      {children}
    </Heading>
  )
}

/**
 * The bar's row in the page's column: the bar's own box is as wide as the
 * page, the row is as wide as its content (`position: relative` for what it
 * holds).
 */
function BarRow({
  maxW,
  px,
  main = false,
  children,
}: {
  maxW?: BoxProps['maxW']
  px?: BoxProps['px']
  /** The row the scroll listener measures. */
  main?: boolean
  children?: ReactNode
}) {
  return (
    <Box
      h="full"
      w="full"
      maxW={maxW}
      px={px}
      mx={px == null ? undefined : 'auto'}
    >
      <Box
        position="relative"
        h="full"
        data-sticky-header-row={main ? '' : undefined}
      >
        {children}
      </Box>
    </Box>
  )
}

/**
 * The page header (FE-458), one for every page: a bar one row (56px) tall that
 * sticks to the top of the page, and under it the big title, which collapses
 * into the bar as the page scrolls. It wraps the page, so that the column its
 * bar sticks in is as tall as the page, and so that the tab and reading order
 * follow the bar's row: Back, the option button, then the page (the big title
 * first).
 *
 * Open: Back alone in the bar, the 34px h1 under it, then the description.
 * Scrolled: the title shrinks to 18px and moves up beside Back (see
 * `headerCollapse.ts` for the numbers and `attachHeaderCollapse.ts` for how
 * the scroll drives it). The bar is the page's own colour with no rule or
 * shadow, Back shows at every width, and the bar's copy is hidden from screen
 * readers: the h1 is the only heading.
 */
export function StickyHeader({
  title,
  description,
  onBack,
  backAriaLabel,
  option,
  background = 'bg.subtle',
  stickyTop = 0,
  contentMaxW,
  contentPx,
  overMedia = false,
  children,
}: StickyHeaderProps) {
  const detachRef = useRef<(() => void) | null>(null)
  const frameRef = useCallback((node: HTMLDivElement | null) => {
    detachRef.current?.()
    detachRef.current = node ? attachHeaderCollapse(node) : null
  }, [])

  const hasTitle = title !== undefined
  const column = { maxW: contentMaxW, px: contentPx }
  const buttonTop = `${(BAR_H - BUTTON_BOX) / 2}px`
  const overhang = `-${BUTTON_OVERHANG}px`
  const optionClearance = BUTTON_BOX - BUTTON_OVERHANG + OPTION_GAP

  return (
    <Box
      ref={frameRef}
      data-sticky-header=""
      data-over-media={overMedia ? '' : undefined}
      display="grid"
      gridTemplateColumns="minmax(0, 1fr)"
      w="full"
    >
      {/* Everything sits in one cell: the bar over the top of the page. */}
      <Box
        data-sticky-header-bar=""
        gridArea="1 / 1"
        alignSelf="start"
        position="sticky"
        top={topFor(stickyTop)}
        zIndex={10}
        h={`${BAR_H}px`}
        w="full"
        // Over a map the bar lets it through; its buttons take their own clicks.
        pointerEvents={overMedia ? 'none' : undefined}
      >
        <Box
          aria-hidden
          data-sticky-header-bar-bg=""
          position="absolute"
          top={0}
          bottom={0}
          left="50%"
          w="100vw"
          transform="translateX(-50%)"
          bg={background}
          opacity={overMedia ? 0 : 1}
          pointerEvents={overMedia ? 'none' : 'auto'}
        />
        <BarRow {...column} main>
          {onBack ? (
            <IconButton
              type="button"
              variant="ghost"
              data-sticky-header-back=""
              aria-label={backAriaLabel ?? 'Back'}
              position="absolute"
              top={buttonTop}
              left={overhang}
              boxSize={`${BUTTON_BOX}px`}
              color="text.default"
              pointerEvents="auto"
              {...(overMedia ? HEADER_OVERLAY_BUTTON : HEADER_ICON_BUTTON)}
              onClick={onBack}
            >
              <LuArrowLeft />
            </IconButton>
          ) : null}
          {hasTitle ? (
            <Text
              aria-hidden
              data-sticky-header-bar-title=""
              position="absolute"
              top={`${BAR_TITLE_TOP}px`}
              left={`${BAR_TITLE_INSET}px`}
              right={option ? `${optionClearance}px` : 0}
              fontFamily="heading"
              fontSize={`${BAR_TITLE_PX}px`}
              fontWeight={600}
              lineHeight="24px"
              color="text.default"
              truncate
              opacity={0}
              pointerEvents="none"
            >
              {title}
            </Text>
          ) : null}
        </BarRow>
      </Box>

      {/* The option button sits on the bar's row, so it follows Back in the tab
          and reading order, ahead of the page. It is a layer of its own so
          that it stays above the page and the title moving into the bar. */}
      {option ? (
        <Box
          gridArea="1 / 1"
          alignSelf="start"
          position="sticky"
          top={topFor(stickyTop)}
          zIndex={13}
          h={`${BAR_H}px`}
          w="full"
          pointerEvents="none"
        >
          <BarRow {...column}>
            <Box
              position="absolute"
              top={buttonTop}
              right={overhang}
              boxSize={`${BUTTON_BOX}px`}
              display="flex"
              alignItems="center"
              justifyContent="center"
              pointerEvents="auto"
            >
              {option}
            </Box>
          </BarRow>
        </Box>
      ) : null}

      <Box gridArea="1 / 1" minW={0} pt={overMedia ? 0 : `${BAR_H}px`}>
        {hasTitle && !overMedia ? (
          <Box
            pt={`${TITLE_GAP}px`}
            pb={{ base: 4, md: 6 }}
            maxW={contentMaxW}
            px={contentPx}
            mx={contentPx == null ? undefined : 'auto'}
          >
            <StickyHeaderTitle>{title}</StickyHeaderTitle>
            {description ? (
              <Text mt={2} fontSize="sm" color="text.muted" maxW="3xl">
                {description}
              </Text>
            ) : null}
          </Box>
        ) : null}
        {children}
      </Box>

      {/* The title once it has reached the bar: it sticks, so the scroll
          carries it up to the bar copy's place. Hidden until then. */}
      {hasTitle ? (
        <Box
          aria-hidden
          data-sticky-header-traveller=""
          gridArea="1 / 1"
          alignSelf="start"
          justifySelf="start"
          position="sticky"
          top={topFor(stickyTop, BAR_TITLE_TOP)}
          zIndex={12}
          maxW="full"
          opacity={0}
          pointerEvents="none"
          transformOrigin="0 0"
          {...TITLE_STYLE}
        >
          {title}
        </Box>
      ) : null}
    </Box>
  )
}
