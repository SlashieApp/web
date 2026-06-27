'use client'

import { Box, type BoxProps, HStack, chakra } from '@chakra-ui/react'
import { useReducedMotion } from 'motion/react'
import {
  type KeyboardEvent,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { sdlMotion } from '@/theme/styles'
import { Badge } from '../Badge/Badge'

/**
 * SDL Tabs — WAI-ARIA tabs with a sliding green active indicator and
 * cross-fade/slide panels. Panels stay mounted (hidden inactive) so switching
 * never loses form input or scroll. Honors `prefers-reduced-motion`.
 *
 * Controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).
 * Panels are declared with `<Tabs.Panel value="...">`.
 */
export type TabItem = {
  key: string
  label: string
  badge?: number | string
  disabled?: boolean
}

export type TabsProps = Omit<BoxProps, 'onChange' | 'children'> & {
  tabs: TabItem[]
  value?: string
  defaultValue?: string
  onChange?: (key: string) => void
  /** Equal-width tabs — good for 2 tabs on mobile. */
  fitted?: boolean
  /** Stick the tab bar under the page header while the panels scroll. */
  sticky?: boolean
  /** Sticky offset from the top (CSS length). */
  stickyTop?: BoxProps['top']
  /** Accessible name for the tablist. */
  'aria-label'?: string
  children?: ReactNode
}

type TabsContextValue = {
  activeValue: string
  direction: number
  reducedMotion: boolean
  baseId: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs.Panel must be used within <Tabs>')
  return ctx
}

const tabId = (baseId: string, key: string) => `${baseId}-tab-${key}`
const panelId = (baseId: string, key: string) => `${baseId}-panel-${key}`

function TabsBase({
  tabs,
  value,
  defaultValue,
  onChange,
  fitted = false,
  sticky = false,
  stickyTop = 0,
  children,
  'aria-label': ariaLabel,
  ...boxProps
}: TabsProps) {
  const baseId = useId()
  const reducedMotion = useReducedMotion() ?? false

  const firstEnabled = tabs.find((t) => !t.disabled)?.key ?? tabs[0]?.key ?? ''
  const [internal, setInternal] = useState(defaultValue ?? firstEnabled)
  const activeValue = value ?? internal

  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.key === activeValue),
  )
  const prevIndexRef = useRef(activeIndex)
  const direction = activeIndex >= prevIndexRef.current ? 1 : -1
  useEffect(() => {
    prevIndexRef.current = activeIndex
  }, [activeIndex])

  const select = useCallback(
    (key: string) => {
      const tab = tabs.find((t) => t.key === key)
      if (!tab || tab.disabled) return
      if (value === undefined) setInternal(key)
      onChange?.(key)
    },
    [tabs, value, onChange],
  )

  // Roving focus refs + sliding indicator measurement.
  const listRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(
    null,
  )

  const measure = useCallback(() => {
    const el = tabRefs.current[activeValue]
    const list = listRef.current
    if (!el || !list) return
    setIndicator({ x: el.offsetLeft, w: el.offsetWidth })
  }, [activeValue])

  useLayoutEffect(() => {
    measure()
  }, [measure])

  useEffect(() => {
    const list = listRef.current
    if (!list || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => measure())
    ro.observe(list)
    return () => ro.disconnect()
  }, [measure])

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      const enabled = tabs.filter((t) => !t.disabled)
      const currentPos = enabled.findIndex((t) => t.key === activeValue)
      let nextKey: string | null = null
      switch (e.key) {
        case 'ArrowRight':
          nextKey = enabled[(currentPos + 1) % enabled.length]?.key ?? null
          break
        case 'ArrowLeft':
          nextKey =
            enabled[(currentPos - 1 + enabled.length) % enabled.length]?.key ??
            null
          break
        case 'Home':
          nextKey = enabled[0]?.key ?? null
          break
        case 'End':
          nextKey = enabled[enabled.length - 1]?.key ?? null
          break
        case 'Enter':
        case ' ':
          select(activeValue)
          return
        default:
          return
      }
      if (nextKey) {
        e.preventDefault()
        select(nextKey)
        tabRefs.current[nextKey]?.focus()
      }
    },
    [tabs, activeValue, select],
  )

  const contextValue = useMemo<TabsContextValue>(
    () => ({ activeValue, direction, reducedMotion, baseId }),
    [activeValue, direction, reducedMotion, baseId],
  )

  return (
    <TabsContext.Provider value={contextValue}>
      <Box {...boxProps}>
        <Box
          position={sticky ? 'sticky' : undefined}
          top={sticky ? stickyTop : undefined}
          zIndex={sticky ? 5 : undefined}
          bg={sticky ? 'bg.canvas' : undefined}
        >
          <HStack
            ref={listRef}
            role="tablist"
            aria-label={ariaLabel}
            position="relative"
            gap={fitted ? 0 : 6}
            borderBottomWidth="1px"
            borderColor="border.default"
            align="stretch"
          >
            {tabs.map((tab) => {
              const selected = tab.key === activeValue
              return (
                <chakra.button
                  type="button"
                  key={tab.key}
                  ref={(el: HTMLButtonElement | null) => {
                    tabRefs.current[tab.key] = el
                  }}
                  role="tab"
                  id={tabId(baseId, tab.key)}
                  aria-selected={selected}
                  aria-controls={panelId(baseId, tab.key)}
                  aria-disabled={tab.disabled || undefined}
                  tabIndex={selected ? 0 : -1}
                  disabled={tab.disabled}
                  onClick={() => select(tab.key)}
                  onKeyDown={onKeyDown}
                  flex={fitted ? '1' : undefined}
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                  minH="44px"
                  px={fitted ? 2 : 1}
                  pb={2}
                  fontFamily="body"
                  fontSize="sm"
                  fontWeight={600}
                  lineHeight="1.2"
                  color={selected ? 'text.default' : 'text.muted'}
                  cursor={tab.disabled ? 'not-allowed' : 'pointer'}
                  opacity={tab.disabled ? 0.5 : 1}
                  bg="transparent"
                  transitionProperty="color"
                  transitionDuration={sdlMotion.duration.base}
                  transitionTimingFunction={sdlMotion.easing.standard}
                  _hover={tab.disabled ? undefined : { color: 'text.default' }}
                  _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'border.focus',
                    outlineOffset: '-2px',
                    borderRadius: 'sm',
                  }}
                >
                  {tab.label}
                  {tab.badge !== undefined && tab.badge !== null ? (
                    <Badge variant={selected ? 'success' : 'neutral'} size="sm">
                      {tab.badge}
                    </Badge>
                  ) : null}
                </chakra.button>
              )
            })}

            {/* Sliding active indicator (brand moment). */}
            {indicator ? (
              <Box
                aria-hidden
                position="absolute"
                bottom="-1px"
                left={0}
                height="2px"
                borderRadius="full"
                bg="action.primary"
                width={`${indicator.w}px`}
                transform={`translateX(${indicator.x}px)`}
                transitionProperty={reducedMotion ? 'none' : 'transform, width'}
                transitionDuration={sdlMotion.duration.moderate}
                transitionTimingFunction={sdlMotion.easing.standard}
              />
            ) : null}
          </HStack>
        </Box>

        <Box position="relative">{children}</Box>
      </Box>
    </TabsContext.Provider>
  )
}

export type TabPanelProps = {
  value: string
  children: ReactNode
}

/**
 * A tab panel. Stays mounted when inactive (`hidden`), preserving any form input
 * and scroll. Animates a subtle cross-fade + directional slide on entrance.
 */
function TabPanel({ value, children }: TabPanelProps) {
  const { activeValue, direction, reducedMotion, baseId } = useTabsContext()
  const isActive = activeValue === value
  const [entered, setEntered] = useState(isActive)
  const rafA = useRef(0)
  const rafB = useRef(0)

  useEffect(() => {
    if (!isActive) return
    if (reducedMotion) {
      setEntered(true)
      return
    }
    // Start offset, then transition to resting position on the next frame.
    setEntered(false)
    rafA.current = requestAnimationFrame(() => {
      rafB.current = requestAnimationFrame(() => setEntered(true))
    })
    return () => {
      cancelAnimationFrame(rafA.current)
      cancelAnimationFrame(rafB.current)
    }
  }, [isActive, reducedMotion])

  const offset = direction >= 0 ? 12 : -12
  const motionStyle =
    isActive && !reducedMotion
      ? {
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateX(0)' : `translateX(${offset}px)`,
          transition: entered
            ? `opacity ${sdlMotion.duration.moderate} ${sdlMotion.easing.standard}, transform ${sdlMotion.duration.moderate} ${sdlMotion.easing.standard}`
            : 'none',
        }
      : undefined

  return (
    <Box
      role="tabpanel"
      id={panelId(baseId, value)}
      aria-labelledby={tabId(baseId, value)}
      tabIndex={0}
      hidden={!isActive}
      aria-hidden={!isActive}
      pt={5}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: 'border.focus',
        outlineOffset: '2px',
        borderRadius: 'md',
      }}
      style={motionStyle}
    >
      {children}
    </Box>
  )
}

export const Tabs = Object.assign(TabsBase, { Panel: TabPanel })
