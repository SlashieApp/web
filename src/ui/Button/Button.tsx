'use client'

import {
  type ButtonProps,
  Button as ChakraButton,
  type SystemStyleObject,
} from '@chakra-ui/react'

import { useUserStore } from '@/app/(auth)/store/user'
import { sdlFocusRing, sdlMotion } from '@/theme/styles'

/**
 * SDL Button. Variants: primary | secondary | ghost | danger | premium.
 * Legacy variant names (outline/subtle/tertiary/success) are accepted as aliases
 * during migration and resolve to an SDL variant below.
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

export type UiButtonSize = 'sm' | 'md' | 'lg' | 'xs' | 'xl'

export type UiButtonProps = Omit<ButtonProps, 'variant' | 'size'> & {
  variant?: UiButtonVariant
  size?: UiButtonSize
  /** When true, render only for authenticated users. */
  auth?: boolean
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

/** Heights meet the 44px touch target at md/lg; sm (36) is for dense/desktop rows. */
const buttonSizes: Record<'sm' | 'md' | 'lg', SystemStyleObject> = {
  sm: { minH: '36px', px: 3, fontSize: 'sm', gap: 1.5 },
  md: { minH: '44px', px: 4, fontSize: 'md', gap: 2 },
  lg: { minH: '52px', px: 6, fontSize: 'md', gap: 2 },
}

const sizeAlias: Record<UiButtonSize, 'sm' | 'md' | 'lg'> = {
  xs: 'sm',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'lg',
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
        boxShadow: 'e1',
        _hover: { bg: 'bg.subtle' },
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
      }
  }
}

export function Button(props: UiButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    auth = false,
    borderRadius = 'md',
    fontFamily = 'body',
    fontWeight = 600,
    ...restProps
  } = props
  const user = useUserStore((state) => state.user)
  if (auth && !user) return null

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
      transitionProperty="color, background-color, border-color, box-shadow, filter"
      transitionDuration={sdlMotion.duration.moderate}
      transitionTimingFunction={sdlMotion.easing.standard}
      {...buttonSizes[sizeAlias[size]]}
      {...variantStyles(variantAlias[variant])}
      {...restProps}
    />
  )
}
