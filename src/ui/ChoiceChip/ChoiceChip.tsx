'use client'

import { chakra } from '@chakra-ui/react'
import { type ReactNode, useRef } from 'react'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'

const ChipLabel = chakra('label')
const ChipInput = chakra('input')

const chipTransition = {
  transitionProperty: 'background-color, border-color, color',
  transitionDuration: sdlMotion.duration.base,
  transitionTimingFunction: sdlMotion.easing.standard,
} as const

export type ChoiceChipProps = {
  /** Green when this pin is the one chosen. */
  selected: boolean
  children: ReactNode
  disabled?: boolean
  /**
   * Set for one choice of several (a radio in this group). Leave it off for
   * a toggle, such as a category or the Others pin that opens a field.
   */
  name?: string
  /** `byPointer`: tapped or clicked, not reached with the arrow keys. */
  onSelect: (byPointer: boolean) => void
}

/**
 * A thin pill for a form choice. Budget's "What's it for?" and the category
 * pins share it: the same height, type and selected green. A radio when
 * `name` is set, otherwise a toggle.
 */
export function ChoiceChip({
  selected,
  children,
  disabled = false,
  name,
  onSelect,
}: ChoiceChipProps) {
  const pointer = useRef(false)
  return (
    <ChipLabel
      position="relative"
      display="inline-flex"
      alignItems="center"
      px={2.5}
      h="32px"
      borderRadius="full"
      borderWidth="1px"
      borderColor={selected ? 'transparent' : 'border.strong'}
      bg={selected ? 'status.success.soft' : 'bg.surface'}
      color={selected ? 'status.success.fg' : 'text.muted'}
      fontSize="sm"
      fontWeight={500}
      lineHeight="1"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      opacity={disabled ? 0.5 : 1}
      _hover={
        selected || disabled
          ? undefined
          : {
              bg: 'bg.subtle',
              borderColor: 'border.hover',
              color: 'text.default',
            }
      }
      _focusWithin={{ '&:has(:focus-visible)': sdlFocusRing }}
      {...chipTransition}
    >
      <ChipInput
        type={name ? 'radio' : 'checkbox'}
        name={name}
        checked={selected}
        disabled={disabled}
        // A real click has a count; one made by the keyboard has none.
        onClick={(event) => {
          pointer.current = event.detail > 0
        }}
        onChange={() => {
          if (disabled) return
          onSelect(pointer.current)
          pointer.current = false
        }}
        position="absolute"
        inset={0}
        w="full"
        h="full"
        m={0}
        opacity={0}
        cursor={disabled ? 'not-allowed' : 'pointer'}
      />
      {children}
    </ChipLabel>
  )
}
