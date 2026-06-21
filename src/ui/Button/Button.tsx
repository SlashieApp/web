'use client'

import {
  type ButtonProps,
  Button as ChakraButton,
  type SystemStyleObject,
} from '@chakra-ui/react'

import { useUserStore } from '@/app/(auth)/store/user'
import { statusDangerSolidFocusRing } from '@/theme/system'

export type UiButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'ghost'
  | 'subtle'
  | 'success'
  | 'danger'

export type UiButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type UiButtonProps = Omit<ButtonProps, 'variant' | 'size'> & {
  variant?: UiButtonVariant
  size?: UiButtonSize
  /** When true, render only for authenticated users. */
  auth?: boolean
}

const buttonSizes = {
  xs: { fontSize: '12px', px: 3, py: 1.5 },
  sm: { fontSize: '14px', px: 3, py: 2 },
  md: { fontSize: '14px', px: 4, py: 2.5 },
  lg: { fontSize: '16px', px: 5, py: 3 },
  xl: { fontSize: '16px', px: 6, py: 3.5 },
} as const

const focusRingBrand: SystemStyleObject = {
  outline: 'none',
  boxShadow: '0 0 0 4px var(--chakra-colors-primary-100)',
}

const focusRingNeutral: SystemStyleObject = {
  outline: 'none',
  boxShadow: '0 0 0 4px var(--chakra-colors-neutral-200)',
}

function buttonSizeProps(size: UiButtonSize = 'md') {
  const s = buttonSizes[size]
  return {
    fontSize: s.fontSize,
    px: s.px,
    py: s.py,
  }
}

function buttonVariantStyles(variant: UiButtonVariant): SystemStyleObject {
  switch (variant) {
    case 'primary':
      return {
        bg: 'primary',
        color: 'white',
        borderWidth: '1px',
        borderColor: 'transparent',
        fontWeight: 500,
        _hover: {
          bg: 'primaryHover',
        },
        _active: { bg: 'primaryHover' },
        _focusVisible: focusRingBrand,
        _disabled: {
          bg: 'neutral.200',
          color: 'neutral.400',
          borderColor: 'formControlBorder',
          boxShadow: 'none',
          cursor: 'not-allowed',
          opacity: 1,
        },
      }
    case 'secondary':
    case 'outline':
      return {
        bg: 'formControlBg',
        color: 'cardFg',
        borderWidth: '1px',
        borderColor: 'formControlBorder',
        boxShadow: 'xs',
        fontWeight: 500,
        _hover: {
          bg: 'bg',
          color: 'cardFg',
          boxShadow: 'xs',
        },
        _focusVisible: focusRingNeutral,
        _disabled: {
          bg: 'neutral.200',
          color: 'neutral.400',
          boxShadow: 'none',
          cursor: 'not-allowed',
        },
      }
    case 'tertiary':
    case 'subtle':
      return {
        bg: 'cardBg',
        color: 'cardFg',
        borderWidth: '1px',
        borderColor: 'cardBorder',
        boxShadow: 'xs',
        fontWeight: 500,
        _hover: {
          bg: 'formControlBg',
          color: 'cardFg',
        },
        _focusVisible: focusRingNeutral,
        _disabled: {
          bg: 'neutral.200',
          color: 'neutral.400',
          boxShadow: 'none',
          cursor: 'not-allowed',
        },
      }
    case 'ghost':
      return {
        bg: 'transparent',
        color: 'cardFg',
        borderWidth: '0',
        boxShadow: 'none',
        fontWeight: 500,
        _hover: { bg: 'formControlBg' },
        _focusVisible: focusRingNeutral,
        _disabled: {
          color: 'neutral.400',
          cursor: 'not-allowed',
        },
      }
    case 'success':
      return {
        bg: 'statusSuccessSolid',
        color: 'white',
        borderWidth: '1px',
        borderColor: 'transparent',
        fontWeight: 500,
        _hover: { filter: 'brightness(0.95)' },
        _focusVisible: focusRingBrand,
      }
    case 'danger':
      return {
        bg: 'statusDangerSolid',
        color: 'white',
        borderWidth: '1px',
        borderColor: 'transparent',
        fontWeight: 500,
        _hover: { filter: 'brightness(0.95)' },
        _focusVisible: statusDangerSolidFocusRing,
      }
    default:
      return {}
  }
}

export function Button(props: UiButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    auth = false,
    borderRadius = 'md',
    fontFamily = 'body',
    gap = 2,
    ...restProps
  } = props
  const user = useUserStore((state) => state.user)
  if (auth && !user) return null

  const variantStyles = buttonVariantStyles(variant)
  const sizeStyles = buttonSizeProps(size)

  return (
    <ChakraButton
      type="button"
      pointerEvents="auto"
      variant="plain"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      lineHeight="1.25"
      borderRadius={borderRadius}
      fontFamily={fontFamily}
      gap={gap}
      transitionProperty="color, background-color, border-color, box-shadow"
      transitionDuration="200ms"
      {...sizeStyles}
      {...variantStyles}
      {...restProps}
    />
  )
}
