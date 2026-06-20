'use client'

import { type ButtonProps, Button as ChakraButton } from '@chakra-ui/react'

import { useUserStore } from '@/app/(auth)/store/user'

import {
  type UiButtonSize,
  type UiButtonVariant,
  buttonSizeProps,
  buttonVariantStyles,
} from '../designSystemStyles'

export type { UiButtonVariant, UiButtonSize }

export type UiButtonProps = Omit<ButtonProps, 'variant' | 'size'> & {
  variant?: UiButtonVariant
  size?: UiButtonSize
  /** When true, render only for authenticated users. */
  auth?: boolean
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
