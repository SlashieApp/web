'use client'

import {
  type ButtonProps,
  Button as ChakraButton,
  type SystemStyleObject,
} from '@chakra-ui/react'
import type { Ref } from 'react'

import {
  mergeSdlPressCss,
  sdlFocusRing,
  sdlTransitionWithPress,
} from '@/theme/styles'

/**
 * SDL Button. Variants: primary | secondary | ghost | danger | premium.
 * Legacy variant names (outline/subtle/tertiary/success) are accepted as aliases
 * during migration and resolve to an SDL variant below. Every size and variant
 * is a pill with a 500 label; secondary is white with a 1px `border.strong`
 * hairline and no shadow, and its border steps to `border.hover` on hover.
 *
 * GREEN-INK + AA: solid fills (primary/danger) pair with `text.onGreen` ink, which
 * is mode-invariant and passes WCAG AA on green (10.2:1) and red (4.95:1). Premium
 * (plum) uses white (6.1:1). White on green/red fails AA and is never used.
 */
export type UiButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'premium'
  // legacy aliases (migration): resolve to an SDL variant
  | 'outline'
  | 'subtle'
  | 'tertiary'
  | 'success'

/**
 * `form` is the main button of a form, and Google and Apple under it: the form
 * control height (48), the same as a field. `lg` (52) stays for marketing CTAs.
 */
export type UiButtonSize = 'sm' | 'md' | 'lg' | 'xs' | 'xl' | 'form'

export type UiButtonProps = Omit<ButtonProps, 'variant' | 'size'> & {
  variant?: UiButtonVariant
  size?: UiButtonSize
  /** Reaches the `<button>` (React 19 passes `ref` as a prop). */
  ref?: Ref<HTMLButtonElement>
}

type SdlVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'premium'

const variantAlias: Record<UiButtonVariant, SdlVariant> = {
  primary: 'primary',
  success: 'primary',
  secondary: 'secondary',
  outline: 'secondary',
  subtle: 'secondary',
  tertiary: 'secondary',
  ghost: 'ghost',
  danger: 'danger',
  premium: 'premium',
}

/** Heights meet the 44px touch target at md/lg/form; sm (36) is for dense/desktop rows. */
const buttonSizes: Record<'sm' | 'md' | 'lg' | 'form', SystemStyleObject> = {
  sm: { minH: '36px', px: 3, fontSize: 'sm', gap: 1.5 },
  md: { minH: '44px', px: 4, fontSize: 'md', gap: 2 },
  lg: { minH: '52px', px: 6, fontSize: 'md', gap: 2 },
  form: { minH: 'form.controlHeight', px: 6, fontSize: 'md', gap: 2 },
}

const sizeAlias: Record<UiButtonSize, 'sm' | 'md' | 'lg' | 'form'> = {
  xs: 'sm',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'lg',
  form: 'form',
}

const disabledSolid: SystemStyleObject = {
  bg: 'bg.subtle',
  color: 'text.subtle',
  borderColor: 'transparent',
  boxShadow: 'none',
  cursor: 'not-allowed',
  opacity: 1,
}

function variantStyles(variant: SdlVariant): SystemStyleObject {
  switch (variant) {
    case 'primary':
      return {
        bg: 'action.primary',
        color: 'text.onGreen',
        borderWidth: '1px',
        borderColor: 'transparent',
        _hover: { bg: 'action.primaryHover' },
        _active: { bg: 'action.primaryPressed' },
        _focusVisible: sdlFocusRing,
        _disabled: disabledSolid,
        _loading: { bg: 'action.primary', opacity: 0.85 },
      }
    case 'secondary':
      return {
        bg: 'bg.surface',
        color: 'text.default',
        borderWidth: '1px',
        borderColor: 'border.strong',
        _hover: { bg: 'bg.surface', borderColor: 'border.hover' },
        _active: { bg: 'bg.subtle' },
        _focusVisible: sdlFocusRing,
        _disabled: { ...disabledSolid, bg: 'bg.surface' },
      }
    case 'ghost':
      return {
        bg: 'transparent',
        color: 'text.default',
        borderWidth: '1px',
        borderColor: 'transparent',
        _hover: { bg: 'bg.subtle' },
        _active: { bg: 'bg.subtle' },
        _focusVisible: sdlFocusRing,
        _disabled: {
          color: 'text.subtle',
          cursor: 'not-allowed',
          bg: 'transparent',
        },
      }
    case 'danger':
      return {
        bg: 'status.danger.solid',
        color: 'text.onGreen',
        borderWidth: '1px',
        borderColor: 'transparent',
        _hover: { filter: 'brightness(0.94)' },
        _active: { filter: 'brightness(0.9)' },
        _focusVisible: sdlFocusRing,
        _disabled: disabledSolid,
      }
    case 'premium':
      return {
        bg: 'accent.premium',
        color: 'white',
        borderWidth: '1px',
        borderColor: 'transparent',
        _hover: { filter: 'brightness(1.08)' },
        _active: { filter: 'brightness(0.96)' },
        _focusVisible: sdlFocusRing,
        _disabled: disabledSolid,
        // Loading keeps the plum with its spinner, as primary keeps its green.
        _loading: { bg: 'accent.premium', color: 'white', opacity: 0.85 },
      }
  }
}

export function Button(props: UiButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    borderRadius = 'full',
    fontFamily = 'body',
    fontWeight = 500,
    css,
    ...restProps
  } = props

  return (
    <ChakraButton
      type="button"
      variant="plain"
      pointerEvents="auto"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      lineHeight="1.2"
      borderRadius={borderRadius}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
      {...buttonSizes[sizeAlias[size]]}
      {...variantStyles(variantAlias[variant])}
      {...restProps}
      {...sdlTransitionWithPress(
        'color, background-color, border-color, box-shadow, filter',
      )}
      css={mergeSdlPressCss(css)}
    />
  )
}
