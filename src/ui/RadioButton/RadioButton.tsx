'use client'

import {
  Box,
  type BoxProps,
  type SystemStyleObject,
  Text,
  chakra,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuCheck } from 'react-icons/lu'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'

const RadioButtonShell = chakra('button')

/**
 * SDL RadioButton. A radio-style selectable row with a built-in indicator dot.
 *
 * Variants:
 *  - `primary` (default): selected state uses the SDL success tint + green ink.
 *  - `subtle`: low-emphasis selected state on a neutral surface.
 *
 * Legacy size name `default` is accepted as an alias for `md`.
 *
 * Accessibility: rendered as a native `<button>` with `aria-pressed` reflecting
 * the selected state, a visible `sdlFocusRing` on keyboard focus, and a >=44px
 * touch target. For an exclusive group, wrap the rows in a `role="radiogroup"`
 * container with a group label.
 *
 * NOTE: for a canonical single-select group this should become a native
 * `<input type="radio">` set (Biome `useSemanticElements`), which also brings
 * roving-tabindex/arrow-key selection. That is a structural + behavioral change
 * (requires a shared `name` at the call site) and is intentionally deferred.
 */
export type UiRadioButtonVariant =
  | 'primary'
  | 'subtle'
  // legacy alias (migration): resolves to an SDL variant below
  | 'success'

export type UiRadioButtonSize =
  | 'sm'
  | 'md'
  | 'lg'
  // legacy alias (migration): resolves to `md`
  | 'default'

export type RadioButtonProps = Omit<
  BoxProps,
  'onChange' | 'onClick' | 'children' | 'value'
> & {
  /** Whether this option is currently selected. */
  checked: boolean
  /** Visible label content for the option. */
  label: ReactNode
  /** Fired when the row is activated (click / Enter / Space). */
  onChange?: () => void
  /** Visual emphasis of the selected state. */
  variant?: UiRadioButtonVariant
  /** Row density / touch target. `md`/`lg` meet the 44px touch target. */
  size?: UiRadioButtonSize
  /** Disable interaction and dim the row. */
  disabled?: boolean
  /**
   * What marks the row as chosen: the dot of a single choice (default), or a
   * ticked box for one of several (`CheckButtonGroup`), so the two are told
   * apart by shape, not only by how they behave.
   */
  indicator?: 'dot' | 'check'
}

type SdlVariant = 'primary' | 'subtle'

const variantAlias: Record<UiRadioButtonVariant, SdlVariant> = {
  primary: 'primary',
  success: 'primary',
  subtle: 'subtle',
}

type SdlSize = 'sm' | 'md' | 'lg'

const sizeAlias: Record<UiRadioButtonSize, SdlSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  default: 'md',
}

/** `md`/`lg` clear the 44px touch target; `sm` (40) is for dense desktop rows. */
const radioSizes: Record<
  SdlSize,
  {
    row: SystemStyleObject
    indicator: { boxSize: number; dot: number }
    fontSize: string
  }
> = {
  sm: {
    row: { minH: '40px', px: 3, py: 2, gap: 2 },
    indicator: { boxSize: 4, dot: 2 },
    fontSize: 'sm',
  },
  md: {
    row: { minH: '44px', px: 3, py: 2.5, gap: 2.5 },
    indicator: { boxSize: 4, dot: 2 },
    fontSize: 'sm',
  },
  lg: {
    row: { minH: '52px', px: 4, py: 3, gap: 3 },
    indicator: { boxSize: 5, dot: 2.5 },
    fontSize: 'md',
  },
}

type RadioVisual = {
  row: SystemStyleObject
  rowChecked: SystemStyleObject
  rowHover: SystemStyleObject
  indicatorBorder: string
  indicatorBorderChecked: string
  dotBg: string
}

function variantVisual(variant: SdlVariant): RadioVisual {
  if (variant === 'subtle') {
    return {
      row: {
        bg: 'transparent',
        color: 'text.muted',
        borderColor: 'border.default',
      },
      rowChecked: {
        bg: 'bg.subtle',
        color: 'text.default',
        borderColor: 'border.strong',
      },
      rowHover: { bg: 'bg.subtle' },
      indicatorBorder: 'border.strong',
      indicatorBorderChecked: 'border.strong',
      dotBg: 'text.default',
    }
  }
  // primary: SDL success tint when selected, green ink (status.success.fg). The
  // lines (row border, ring) are green 600; green 400 is the dot's fill only.
  return {
    row: {
      bg: 'transparent',
      color: 'text.muted',
      borderColor: 'border.default',
    },
    rowChecked: {
      bg: 'status.success.soft',
      color: 'status.success.fg',
      borderColor: 'accent.active',
    },
    rowHover: { bg: 'bg.subtle' },
    indicatorBorder: 'border.default',
    indicatorBorderChecked: 'accent.active',
    dotBg: 'status.success.solid',
  }
}

/** Reusable radio-style button row with built-in indicator dot. */
export function RadioButton({
  checked,
  label,
  onChange,
  variant = 'primary',
  size = 'md',
  disabled = false,
  indicator = 'dot',
  borderRadius = 'md',
  ...rest
}: RadioButtonProps) {
  const visual = variantVisual(variantAlias[variant])
  const sizing = radioSizes[sizeAlias[size]]

  const rowState = checked ? visual.rowChecked : visual.row
  // Inside a RadioButtonGroup each row is a radio, inside a CheckButtonGroup
  // a checkbox: checked, not pressed.
  const role = (rest as { role?: string }).role
  const isRadio = role === 'radio' || role === 'checkbox'
  const isCheck = indicator === 'check'

  return (
    <RadioButtonShell
      type="button"
      aria-pressed={isRadio ? undefined : checked}
      aria-checked={isRadio ? checked : undefined}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      cursor={disabled ? 'not-allowed' : 'pointer'}
      pointerEvents="auto"
      onClick={() => {
        if (!disabled) onChange?.()
      }}
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      textAlign="left"
      w="full"
      borderWidth="1px"
      borderRadius={borderRadius}
      transitionProperty="color, background-color, border-color, box-shadow"
      transitionDuration={sdlMotion.duration.moderate}
      transitionTimingFunction={sdlMotion.easing.standard}
      _hover={disabled || checked ? undefined : visual.rowHover}
      _focusVisible={sdlFocusRing}
      _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
      {...sizing.row}
      {...rowState}
      {...(rest as Record<string, unknown>)}
    >
      <Box
        as="span"
        aria-hidden
        boxSize={sizing.indicator.boxSize}
        borderRadius={isCheck ? 'sm' : 'full'}
        borderWidth="2px"
        borderColor={
          isCheck && checked
            ? 'action.primary'
            : checked
              ? visual.indicatorBorderChecked
              : visual.indicatorBorder
        }
        // A ticked box is filled, like the form checkbox.
        bg={isCheck && checked ? 'action.primary' : undefined}
        color={isCheck ? 'text.onGreen' : undefined}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        {checked && isCheck ? (
          <LuCheck size={12} strokeWidth={3} />
        ) : checked ? (
          <Box
            as="span"
            boxSize={sizing.indicator.dot}
            borderRadius="full"
            bg={visual.dotBg}
          />
        ) : null}
      </Box>
      {/* The label takes the rest of the row, so a rich label can put a
          note at the row's end (the quote chooser's "Asked"). A plain text
          label still reads from the left. */}
      <Text
        as="span"
        flex="1"
        minW={0}
        fontSize={sizing.fontSize}
        fontWeight={500}
      >
        {label}
      </Text>
    </RadioButtonShell>
  )
}
