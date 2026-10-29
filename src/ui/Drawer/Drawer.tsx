'use client'

import {
  Box,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  type DrawerContentProps,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTitle,
  HStack,
  Stack,
} from '@chakra-ui/react'
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'
import { LuX } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { APP_OVERLAY_Z_INDEX, overlayDescriptionStyle } from '@/theme/styles'
import { useIsBrowser } from '@/utils/useIsBrowser'

import { Button } from '../Button'
import { IconButton as UiIconButton } from '../IconButton/IconButton'
import bag from './i11n.json'
import { useDrawerSheet } from './useDrawerSheet'

/** Matches `Container`: horizontal page gutters. */
const drawerGutterX = { base: 4, md: 6 } as const

const DrawerNestingContext = createContext(false)
const DrawerCloseContext = createContext<(() => void) | null>(null)

/** True when rendering inside an open `@ui` Drawer panel (including portals). */
export function useInsideDrawer() {
  return useContext(DrawerNestingContext)
}

/** Close the nearest open `@ui` Drawer. No-op outside a drawer. */
export function useDrawerClose() {
  return useContext(DrawerCloseContext) ?? (() => {})
}

const OPEN_DIALOG =
  '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]'

function openDialogs(): Element[] {
  return [...document.querySelectorAll(OPEN_DIALOG)]
}

/**
 * Close a drawer from one of its items. The item may open a dialog in the
 * same tap: closing the drawer then would dismiss that dialog too (zag drops
 * layers opened above a closing one). So once React has rendered the tap,
 * wait for any dialog the tap opened to close first.
 */
export function useCloseFromItem(close: () => void) {
  const watchRef = useRef<MutationObserver | null>(null)
  useEffect(() => () => watchRef.current?.disconnect(), [])

  return useCallback(() => {
    // Dialogs open before the tap (this drawer, anything under it) don't count.
    const before = new Set(openDialogs())
    const tapOpenedDialog = () => openDialogs().some((el) => !before.has(el))
    setTimeout(() => {
      if (!tapOpenedDialog()) {
        close()
        return
      }
      watchRef.current?.disconnect()
      const watch = new MutationObserver(() => {
        if (tapOpenedDialog()) return
        watch.disconnect()
        close()
      })
      watchRef.current = watch
      watch.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['data-state'],
      })
    }, 0)
  }, [close])
}

export const DRAWER_PANEL_MAX_W = 'lg' as const

export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom'

export type DrawerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type DrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  children: ReactNode
  placement?: DrawerPlacement
  size?: DrawerSize
  /** Footer button that closes the drawer; optional. */
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  /**
   * A second footer button, left of the primary one (Clear, Reset). It runs
   * `onSecondaryAction`, then closes the drawer, like the primary. The two sit
   * `formSpace.inlineGap` (12) apart and the primary takes the rest of the row.
   * It needs a `primaryActionLabel`: the bar is the primary's.
   */
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  /** Optional responsive panel overrides for feature drawers/sheets. */
  contentProps?: DrawerContentProps
  /**
   * Where focus goes on close. Defaults to whatever had focus on open; pass
   * the opening button when a tap may not focus it (Safari on iPhone).
   */
  finalFocusEl?: () => HTMLElement | null
}

const sheetMotionCss = {
  animation: 'none !important',
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none !important',
    transition: 'none !important',
  },
} as const

function SheetHandle() {
  return (
    <Box
      aria-hidden
      data-sheet-handle=""
      w="36px"
      h="4px"
      borderRadius="full"
      bg="border.strong"
      mx="auto"
      mb={3}
      flexShrink={0}
    />
  )
}

function drawerPanelRadius(placement: DrawerPlacement) {
  if (placement === 'end') return { borderLeftRadius: 'lg' }
  if (placement === 'start') return { borderRightRadius: 'lg' }
  if (placement === 'bottom') return { borderTopRadius: 'lg' }
  return { borderBottomRadius: 'lg' }
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  placement = 'start',
  size = 'md',
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  contentProps,
  finalFocusEl,
}: DrawerProps) {
  const t = useI11n(bag)
  const radius = drawerPanelRadius(placement)
  const isBrowser = useIsBrowser()
  const { present, setPanel, setBackdrop, touchAction } = useDrawerSheet({
    open,
    placement,
    onOpenChange,
  })

  const overlay = (
    <>
      {/* Scrim: dim + blur the page behind the panel. Click + ESC close are
          handled by DrawerRoot, which also traps focus inside the panel.
          Opacity follows the finger; Chakra's fade keyframes are disabled. */}
      <DrawerBackdrop
        ref={setBackdrop}
        bg="bg.overlay"
        backdropFilter="blur(4px)"
        position="fixed"
        inset="0"
        zIndex={APP_OVERLAY_Z_INDEX}
        css={sheetMotionCss}
      />
      <DrawerPositioner
        position="fixed"
        inset="0"
        zIndex={APP_OVERLAY_Z_INDEX}
        {...(placement === 'bottom'
          ? { justifyContent: 'center', alignItems: 'flex-end' }
          : {})}
      >
        <DrawerContent
          colorPalette="green"
          bg="bg.surface"
          color="text.default"
          boxShadow="e4"
          display="flex"
          flexDirection="column"
          maxH="100dvh"
          w="full"
          maxW={DRAWER_PANEL_MAX_W}
          {...(placement === 'bottom' || placement === 'top'
            ? { mx: 'auto' }
            : {
                ml: placement === 'end' ? 'auto' : undefined,
                mr: placement === 'start' ? 'auto' : undefined,
              })}
          {...radius}
          {...contentProps}
          ref={setPanel}
          touchAction={touchAction}
          css={{
            ...sheetMotionCss,
            '& input, & textarea, & select, & [role="slider"]': {
              touchAction: 'auto',
            },
          }}
        >
          <DrawerHeader px={drawerGutterX} pt={4} pb={0} flexShrink={0}>
            {/* The header is a flex row: without `w="full"` this column shrinks
                to its text, and the handle centres over the title. */}
            <Stack gap={0} align="stretch" w="full">
              {placement === 'bottom' ? <SheetHandle /> : null}
              {/* The title and the description are `formSpace.titleToSubtitle`
                  apart, edge to edge. The 44px close button is taller than the
                  title, so its margins (-8) take it out of the row's height,
                  and the row's top padding (8) puts the title back where a
                  44px row had it: the description is 8 under the title text,
                  not 8 under a row with slack. */}
              <Stack gap="form.titleToSubtitle" align="stretch" w="full">
                <HStack align="center" justify="space-between" gap={3} pt={2}>
                  <DrawerTitle
                    fontFamily="body"
                    fontSize="20px"
                    fontWeight={500}
                    letterSpacing="-0.015em"
                    color="text.default"
                    lineHeight="28px"
                    flex={1}
                    minW={0}
                  >
                    {title}
                  </DrawerTitle>
                  {/* Unstyled: Chakra floats the close button in the panel's
                      corner, which puts it above the title. Here it is in the
                      row, so the two centre on each other. */}
                  <DrawerCloseTrigger asChild unstyled>
                    <UiIconButton
                      aria-label={t.close}
                      variant="ghost"
                      flexShrink={0}
                      minW="44px"
                      minH="44px"
                      my={-2}
                      // The 20px glyph sits on the content's right edge, as the
                      // body's controls do; the 44px target reaches into the gutter.
                      me={-3}
                    >
                      <LuX size={20} strokeWidth={2} aria-hidden />
                    </UiIconButton>
                  </DrawerCloseTrigger>
                </HStack>
                {description ? (
                  <DrawerDescription {...overlayDescriptionStyle}>
                    {description}
                  </DrawerDescription>
                ) : null}
              </Stack>
            </Stack>
          </DrawerHeader>
          <DrawerBody
            px={drawerGutterX}
            pt="form.headerToBody"
            pb={primaryActionLabel ? 0 : 6}
            flex={1}
            minH={0}
            overflowY="auto"
            display="flex"
            flexDirection="column"
            overscrollBehavior="contain"
          >
            {/* As wide as the header, so the body lines up with the title
                even when a call site widens the panel. */}
            <Box
              w="full"
              flex={1}
              display="flex"
              flexDirection="column"
              minH={0}
            >
              {children}
              {primaryActionLabel ? (
                // The box above shrinks to the body (`minH={0}`), so a child
                // taller than the body overflows it, and the body's own bottom
                // padding would end before the last row. This spacer is part
                // of that flow: the last row is `formSpace.bodyToAction` above
                // the button, scrolled to the end or not.
                <Box aria-hidden flexShrink={0} pb="form.bodyToAction" />
              ) : null}
            </Box>
          </DrawerBody>
          {primaryActionLabel ? (
            <DrawerFooter
              px={drawerGutterX}
              pt={0}
              pb="calc(16px + env(safe-area-inset-bottom, 0px))"
              flexShrink={0}
            >
              <HStack gap="form.inlineGap" w="full">
                {secondaryActionLabel ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      onSecondaryAction?.()
                      onOpenChange(false)
                    }}
                  >
                    {secondaryActionLabel}
                  </Button>
                ) : null}
                <Button
                  variant="primary"
                  flex={1}
                  minW={0}
                  size="lg"
                  onClick={() => {
                    onPrimaryAction?.()
                    onOpenChange(false)
                  }}
                >
                  {primaryActionLabel}
                </Button>
              </HStack>
            </DrawerFooter>
          ) : null}
        </DrawerContent>
      </DrawerPositioner>
    </>
  )

  return (
    <DrawerNestingContext.Provider value={true}>
      <DrawerCloseContext.Provider value={() => onOpenChange(false)}>
        <DrawerRoot
          open={present}
          onOpenChange={(d: { open: boolean }) => onOpenChange(d.open)}
          placement={placement}
          size={size}
          finalFocusEl={finalFocusEl}
          lazyMount
          unmountOnExit
        >
          {isBrowser ? createPortal(overlay, document.body) : overlay}
        </DrawerRoot>
      </DrawerCloseContext.Provider>
    </DrawerNestingContext.Provider>
  )
}
