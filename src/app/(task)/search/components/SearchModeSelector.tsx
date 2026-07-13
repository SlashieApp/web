'use client'

import { Box, HStack, Heading } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'

import { sdlElevation } from '@/theme/styles'

import {
  SEARCH_MODE_INLINE_LABEL,
  SEARCH_MODE_TOGGLE_OPTIONS,
} from '../helpers/searchModeLabels'
import type { SearchMode } from '../helpers/searchQueryParams'
import { searchModeWordHeadingProps } from '../helpers/searchTitleTypography'
import { useSelectSearchMode } from '../hooks/useSelectSearchMode'

const morphEase = [0.22, 1, 0.36, 1] as const
const wordEase = [0.2, 0, 0, 1] as const
const morphTransition = {
  duration: 0.24,
  ease: morphEase,
  type: 'tween',
} as const

/** Fixed shell height — collapsed button and expanded toggle share this box. */
const MODE_CONTROL_HEIGHT = '36px'
const SEGMENT_PAD_X_COLLAPSED = 12
const SEGMENT_PAD_X_EXPANDED = 14
const SEGMENT_PAD_Y_EXPANDED = 6

function segmentPadding(visible: boolean, expanded: boolean) {
  if (!visible) {
    return {
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
    }
  }
  if (expanded) {
    return {
      paddingTop: SEGMENT_PAD_Y_EXPANDED,
      paddingRight: SEGMENT_PAD_X_EXPANDED,
      paddingBottom: SEGMENT_PAD_Y_EXPANDED,
      paddingLeft: SEGMENT_PAD_X_EXPANDED,
    }
  }
  return {
    paddingTop: 0,
    paddingRight: SEGMENT_PAD_X_COLLAPSED,
    paddingBottom: 0,
    paddingLeft: SEGMENT_PAD_X_COLLAPSED,
  }
}

function segmentTargetWidth(
  option: SearchMode,
  textWidths: Record<SearchMode, number>,
  visible: boolean,
  expanded: boolean,
) {
  if (!visible) return 0
  const padX = expanded ? SEGMENT_PAD_X_EXPANDED : SEGMENT_PAD_X_COLLAPSED
  return textWidths[option] + padX * 2
}

export type SearchModeSelectorBaseProps = {
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
}

type ModeWordControlProps = SearchModeSelectorBaseProps & {
  expanded: boolean
  onOpen: () => void
}

/**
 * One shell: both segments stay mounted; hover widens the inactive segment in.
 * Widths are measured in px so motion never snaps on `auto`.
 */
function ModeWordControl({
  mode,
  onModeChange,
  expanded,
  onOpen,
}: ModeWordControlProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [textWidths, setTextWidths] = useState<Record<SearchMode, number>>({
    tasks: 0,
    workers: 0,
  })

  const measureTextWidths = useCallback(() => {
    const root = measureRef.current
    if (!root) return
    const next = { tasks: 0, workers: 0 }
    for (const option of SEARCH_MODE_TOGGLE_OPTIONS) {
      const el = root.querySelector<HTMLElement>(
        `[data-mode-label="${option.value}"]`,
      )
      if (el) next[option.value] = el.offsetWidth
    }
    setTextWidths(next)
  }, [])

  useLayoutEffect(() => {
    measureTextWidths()
    const root = measureRef.current
    if (!root || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measureTextWidths)
    observer.observe(root)
    return () => observer.disconnect()
  }, [measureTextWidths])

  return (
    <>
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          height: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {SEARCH_MODE_TOGGLE_OPTIONS.map((option) => (
          <Heading
            key={option.value}
            data-mode-label={option.value}
            as="span"
            {...searchModeWordHeadingProps}
            lineHeight="1"
            display="inline-block"
          >
            {SEARCH_MODE_INLINE_LABEL[option.value]}
          </Heading>
        ))}
      </div>

      <motion.div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          height: MODE_CONTROL_HEIGHT,
          minHeight: MODE_CONTROL_HEIGHT,
          flexShrink: 0,
        }}
      >
        <motion.div
          animate={{
            paddingTop: expanded ? 2 : 0,
            paddingRight: expanded ? 2 : 0,
            paddingBottom: expanded ? 2 : 0,
            paddingLeft: expanded ? 2 : 0,
            gap: expanded ? 2 : 0,
            borderRadius: expanded ? 9999 : 8,
          }}
          transition={morphTransition}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: '100%',
            border: '1px solid var(--chakra-colors-border-default)',
            background: 'var(--chakra-colors-bg-surface)',
            boxShadow: expanded ? sdlElevation.e2 : sdlElevation.e1,
            overflow: 'hidden',
          }}
        >
          {SEARCH_MODE_TOGGLE_OPTIONS.map((option) => {
            const active = option.value === mode
            const visible = expanded || active
            const label = SEARCH_MODE_INLINE_LABEL[option.value]
            const targetWidth = segmentTargetWidth(
              option.value,
              textWidths,
              visible,
              expanded,
            )

            return (
              <motion.button
                key={option.value}
                type="button"
                aria-pressed={active}
                aria-label={`Search ${label}`}
                aria-hidden={visible ? undefined : true}
                tabIndex={visible ? 0 : -1}
                onClick={(event) => {
                  event.stopPropagation()
                  if (!expanded) {
                    onOpen()
                    return
                  }
                  if (!active) onModeChange(option.value)
                }}
                initial={false}
                animate={{
                  width: targetWidth,
                  opacity: visible ? 1 : 0,
                  ...segmentPadding(visible, expanded),
                }}
                transition={morphTransition}
                style={{
                  height: '100%',
                  border: 'none',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: visible ? 'auto' : 'none',
                  background:
                    expanded && active
                      ? 'var(--chakra-colors-action-primary)'
                      : 'transparent',
                  color:
                    expanded && active
                      ? 'var(--chakra-colors-text-onGreen)'
                      : 'var(--chakra-colors-text-link)',
                }}
              >
                {active && !expanded ? (
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={mode}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, ease: wordEase }}
                      style={{ display: 'inline-block' }}
                    >
                      <Heading
                        as="span"
                        {...searchModeWordHeadingProps}
                        color="inherit"
                        lineHeight="1"
                      >
                        {label}
                      </Heading>
                    </motion.span>
                  </AnimatePresence>
                ) : (
                  <Heading
                    as="span"
                    {...searchModeWordHeadingProps}
                    color="inherit"
                    lineHeight="1"
                  >
                    {label}
                  </Heading>
                )}
              </motion.button>
            )
          })}
        </motion.div>
      </motion.div>
    </>
  )
}

/**
 * “Searching for [tasks] nearby” — flanking copy always visible (title type).
 * Only the middle control expands into a toggle on hover.
 */
export function SearchModeSelectorBase({
  mode,
  onModeChange,
}: SearchModeSelectorBaseProps) {
  const [expanded, setExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inlineLabel = SEARCH_MODE_INLINE_LABEL[mode]

  const open = useCallback(() => setExpanded(true), [])
  const close = useCallback(() => setExpanded(false), [])

  const onBlurCapture = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget
      if (next instanceof Node && containerRef.current?.contains(next)) return
      close()
    },
    [close],
  )

  return (
    <Box
      ref={containerRef}
      as="fieldset"
      border="none"
      m={0}
      p={0}
      my={2}
      minW={0}
      position="relative"
      minH={MODE_CONTROL_HEIGHT}
      display="flex"
      alignItems="center"
      w="max-content"
      pointerEvents="auto"
      onMouseEnter={open}
      onMouseLeave={close}
      onFocusCapture={open}
      onBlurCapture={onBlurCapture}
      aria-label={`Searching for ${inlineLabel} nearby`}
    >
      <HStack
        as="p"
        gap={{ base: 1.5, md: 2 }}
        m={0}
        flexWrap="nowrap"
        alignItems="baseline"
      >
        <Heading as="span" {...searchModeWordHeadingProps}>
          Searching for
        </Heading>

        <ModeWordControl
          mode={mode}
          onModeChange={onModeChange}
          expanded={expanded}
          onOpen={open}
        />

        <Heading as="span" {...searchModeWordHeadingProps}>
          nearby
        </Heading>
      </HStack>
    </Box>
  )
}

/** /search mode selector wired to browse + worker contexts. */
export function SearchModeSelector() {
  const { mode, selectMode } = useSelectSearchMode()
  return <SearchModeSelectorBase mode={mode} onModeChange={selectMode} />
}
