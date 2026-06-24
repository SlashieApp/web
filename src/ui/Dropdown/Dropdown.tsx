'use client'

import { Box, type BoxProps, chakra } from '@chakra-ui/react'
import {
  type FocusEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'

/**
 * SDL popover surface. Reduced-motion safe: animates transform/opacity only and
 * the `@media (prefers-reduced-motion: reduce)` clause disables the enter motion.
 */
const sdlPanelMotion = {
  transformOrigin: 'top',
  animation: `sdl-dropdown-in ${sdlMotion.duration.fast} ${sdlMotion.easing.decelerate}`,
  '@keyframes sdl-dropdown-in': {
    from: { opacity: 0, transform: 'translateY(-4px) scale(0.98)' },
    to: { opacity: 1, transform: 'translateY(0) scale(1)' },
  },
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
} as const

const DropdownCloseContext = createContext<(() => void) | null>(null)

/** Default trigger shell (used when `trigger` is not a React element). */
const DropdownTriggerButton = chakra('button')

/** Close the nearest click-mode `Dropdown` panel. No-op outside a dropdown. */
export function useDropdownClose() {
  return useContext(DropdownCloseContext) ?? (() => {})
}

export type DropdownTriggerApi = {
  /** Whether the panel is currently open. */
  open: boolean
  /** Toggle the panel open/closed. */
  toggle: () => void
  /** Close the panel. */
  close: () => void
  /** Attach to the trigger element so focus returns here on Escape. */
  triggerRef: Ref<HTMLButtonElement>
  /** Spread onto the trigger for menu ARIA wiring. */
  triggerProps: {
    'aria-expanded': boolean
    'aria-haspopup': 'menu'
    'aria-controls': string
  }
}

type DropdownBaseProps = {
  /** Horizontal alignment of the panel relative to the trigger. */
  align?: 'start' | 'end' | 'center'
  /** Start opened (Storybook / controlled-open scenarios). */
  defaultOpen?: boolean
  /** Notified whenever open state changes. */
  onOpenChange?: (open: boolean) => void
  /** Override / extend the default popover surface styling. */
  contentProps?: BoxProps
}

export type ClickDropdownProps = DropdownBaseProps & {
  /** Accessible label for the popover region. */
  contentLabel: string
  /** Panel width (click mode). */
  width?: BoxProps['w']
  hoverExpand?: false
  /**
   * Trigger element or render prop. Pass JSX (e.g. `IconButton`) and `Dropdown`
   * merges toggle + ARIA; use the render prop when you need full control.
   */
  trigger: ReactNode | ((api: DropdownTriggerApi) => ReactNode)
  /**
   * Panel contents as JSX or render prop. JSX slots can call `useDropdownClose()`.
   */
  children: ReactNode | ((api: { close: () => void }) => ReactNode)
}

export type HoverDropdownProps = DropdownBaseProps & {
  /** Open on pointer hover and keyboard focus instead of click. */
  hoverExpand: true
  /** Accessible label for the popover region. */
  contentLabel?: string
  /** Hover/focus target (e.g. nav link). ARIA props merge when this is a single React element. */
  trigger: ReactNode
  /** Dropdown panel body. */
  children: ReactNode
  /** Chakra spacing token: invisible gap between trigger and panel for easier pointer travel. */
  gutter?: BoxProps['pt']
  openDelayMs?: number
  closeDelayMs?: number
  /** Root wrapper props (position, display, etc.). */
  rootProps?: Omit<BoxProps, 'children'>
}

export type DropdownProps = ClickDropdownProps | HoverDropdownProps

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref && typeof ref === 'object') {
        ;(ref as React.MutableRefObject<T | null>).current = node
      }
    }
  }
}

function mergeTriggerAria(
  trigger: ReactNode,
  open: boolean,
  controlsId: string,
): ReactNode {
  if (!isValidElement(trigger)) return trigger
  return cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    'aria-expanded': open,
    'aria-haspopup': true,
    'aria-controls': controlsId,
  })
}

function renderClickTrigger(
  trigger: ClickDropdownProps['trigger'],
  api: DropdownTriggerApi,
): ReactNode {
  if (typeof trigger === 'function') return trigger(api)
  if (!isValidElement(trigger)) {
    return (
      <DropdownTriggerButton
        ref={api.triggerRef}
        type="button"
        onClick={api.toggle}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        minH="44px"
        minW="44px"
        borderRadius="md"
        color="text.default"
        cursor="pointer"
        transitionProperty="color, background-color, box-shadow"
        transitionDuration={sdlMotion.duration.moderate}
        transitionTimingFunction={sdlMotion.easing.standard}
        _hover={{ bg: 'bg.subtle' }}
        _focusVisible={sdlFocusRing}
        {...api.triggerProps}
      >
        {trigger}
      </DropdownTriggerButton>
    )
  }

  const element = trigger as ReactElement<{
    onClick?: (event: React.MouseEvent<HTMLElement>) => void
    ref?: Ref<HTMLButtonElement>
  }>

  return cloneElement(element, {
    ref: mergeRefs(api.triggerRef, element.props.ref),
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      element.props.onClick?.(event)
      if (!event.defaultPrevented) api.toggle()
    },
    ...api.triggerProps,
  })
}

function renderClickChildren(
  children: ClickDropdownProps['children'],
  close: () => void,
): ReactNode {
  if (typeof children === 'function') return children({ close })
  return (
    <DropdownCloseContext.Provider value={close}>
      {children}
    </DropdownCloseContext.Provider>
  )
}

function ClickDropdown({
  trigger,
  children,
  contentLabel,
  align = 'end',
  width = '300px',
  defaultOpen = false,
  onOpenChange,
  contentProps,
}: ClickDropdownProps) {
  const [open, setOpen] = useState(defaultOpen)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  const setOpenState = useCallback(
    (next: boolean) => {
      setOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange],
  )

  const close = useCallback(() => setOpenState(false), [setOpenState])
  const toggle = useCallback(() => setOpenState(!open), [open, setOpenState])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (panelRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, close])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  useEffect(() => {
    if (!open) return
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      'a, button:not([disabled])',
    )
    firstFocusable?.focus()
  }, [open])

  const alignProps =
    align === 'start'
      ? { left: 0, right: undefined }
      : align === 'center'
        ? { left: '50%', right: undefined, transform: 'translateX(-50%)' }
        : { left: undefined, right: 0 }

  const triggerApi: DropdownTriggerApi = {
    open,
    toggle,
    close,
    triggerRef,
    triggerProps: {
      'aria-expanded': open,
      'aria-haspopup': 'menu',
      'aria-controls': panelId,
    },
  }

  return (
    <Box position="relative" display="inline-block">
      {renderClickTrigger(trigger, triggerApi)}

      {open ? (
        <Box
          ref={panelRef}
          id={panelId}
          role="menu"
          aria-label={contentLabel}
          position="absolute"
          top="calc(100% + 8px)"
          zIndex={50}
          w={width}
          bg="bg.surface"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="lg"
          boxShadow="e3"
          p={1}
          overflow="hidden"
          css={sdlPanelMotion}
          {...alignProps}
          {...contentProps}
        >
          {renderClickChildren(children, close)}
        </Box>
      ) : null}
    </Box>
  )
}

function HoverDropdown({
  trigger,
  children,
  align = 'start',
  gutter = 2,
  openDelayMs = 0,
  closeDelayMs = 150,
  contentProps,
  contentLabel = 'Submenu',
  onOpenChange,
  defaultOpen = false,
  rootProps,
}: HoverDropdownProps) {
  const contentDomId = useId()
  const [open, setOpen] = useState(defaultOpen)
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setOpenState = useCallback(
    (next: boolean) => {
      setOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange],
  )

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const scheduleOpen = useCallback(() => {
    clearCloseTimer()
    clearOpenTimer()
    if (openDelayMs <= 0) {
      setOpenState(true)
      return
    }
    openTimerRef.current = setTimeout(() => {
      setOpenState(true)
      openTimerRef.current = null
    }, openDelayMs)
  }, [clearCloseTimer, clearOpenTimer, openDelayMs, setOpenState])

  const scheduleClose = useCallback(() => {
    clearOpenTimer()
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setOpenState(false)
      closeTimerRef.current = null
    }, closeDelayMs)
  }, [clearCloseTimer, clearOpenTimer, closeDelayMs, setOpenState])

  const onFocusCapture = useCallback(() => {
    clearCloseTimer()
    clearOpenTimer()
    setOpenState(true)
  }, [clearCloseTimer, clearOpenTimer, setOpenState])

  const onBlurCapture = useCallback(
    (e: FocusEvent<HTMLDivElement>) => {
      const next = e.relatedTarget
      if (next instanceof Node && e.currentTarget.contains(next)) return
      scheduleClose()
    },
    [scheduleClose],
  )

  const alignProps: BoxProps =
    align === 'end'
      ? { right: 0, left: 'auto' }
      : align === 'center'
        ? { left: '50%', transform: 'translateX(-50%)' }
        : { left: 0, right: 'auto' }

  const {
    position = 'relative',
    display = 'inline-block',
    ...restRootProps
  } = rootProps ?? {}

  return (
    <Box
      position={position}
      display={display}
      onPointerEnter={scheduleOpen}
      onPointerLeave={scheduleClose}
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
      {...restRootProps}
    >
      {mergeTriggerAria(trigger, open, contentDomId)}
      {open ? (
        <Box
          position="absolute"
          top="100%"
          zIndex={50}
          pt={gutter}
          {...alignProps}
        >
          <Box
            as="section"
            id={contentDomId}
            aria-label={contentLabel}
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="lg"
            boxShadow="e4"
            py={2}
            px={1}
            minW="200px"
            css={sdlPanelMotion}
            {...contentProps}
          >
            {children}
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}

/**
 * Universal dropdown popover. Default: click to open with click-outside + Escape.
 * Set `hoverExpand` for nav-style hover/focus menus.
 */
export function Dropdown(props: DropdownProps) {
  if (props.hoverExpand) {
    return <HoverDropdown {...props} />
  }
  return <ClickDropdown {...props} />
}
