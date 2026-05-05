'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import {
  type FocusEvent,
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
  useCallback,
  useId,
  useRef,
  useState,
} from 'react'

export type HoverDropdownMenuProps = Omit<BoxProps, 'children'> & {
  /** Hover/focus target (e.g. nav link). ARIA props are merged when this is a single React element. */
  trigger: ReactNode
  /** Dropdown panel body. */
  children: ReactNode
  /** Horizontal alignment of the panel under the trigger. */
  align?: 'start' | 'end' | 'center'
  /** Chakra spacing token: invisible gap between trigger and panel for easier pointer travel. */
  gutter?: BoxProps['pt']
  openDelayMs?: number
  closeDelayMs?: number
  /** Styles for the elevated panel (merged after defaults). */
  contentProps?: BoxProps
  /** Accessible name for the panel (`aria-label`). */
  contentLabel?: string
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

export function HoverDropdownMenu({
  trigger,
  children,
  align = 'start',
  gutter = 2,
  openDelayMs = 0,
  closeDelayMs = 150,
  contentProps,
  contentLabel = 'Submenu',
  position = 'relative',
  display = 'inline-block',
  ...rootProps
}: HoverDropdownMenuProps) {
  const contentDomId = useId()
  const [open, setOpen] = useState(false)
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      setOpen(true)
      return
    }
    openTimerRef.current = setTimeout(() => {
      setOpen(true)
      openTimerRef.current = null
    }, openDelayMs)
  }, [clearCloseTimer, clearOpenTimer, openDelayMs])

  const scheduleClose = useCallback(() => {
    clearOpenTimer()
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setOpen(false)
      closeTimerRef.current = null
    }, closeDelayMs)
  }, [clearCloseTimer, clearOpenTimer, closeDelayMs])

  const onFocusCapture = useCallback(() => {
    clearCloseTimer()
    clearOpenTimer()
    setOpen(true)
  }, [clearCloseTimer, clearOpenTimer])

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

  return (
    <Box
      position={position}
      display={display}
      onPointerEnter={scheduleOpen}
      onPointerLeave={scheduleClose}
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
      {...rootProps}
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
            bg="cardBg"
            borderWidth="1px"
            borderColor="cardBorder"
            borderRadius="md"
            boxShadow="lg"
            py={2}
            px={1}
            minW="200px"
            {...contentProps}
          >
            {children}
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}
