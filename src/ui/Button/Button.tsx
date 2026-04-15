'use client'

import { type ButtonProps, Button as ChakraButton } from '@chakra-ui/react'

export type UiButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'ghost'
  | 'subtle'
  | 'solid'

export type UiButtonProps = Omit<ButtonProps, 'variant'> & {
  variant?: UiButtonVariant
}

export function Button(props: UiButtonProps) {
  const { variant, ...restProps } = props
  const resolvedVariant = variant ?? 'primary'
  const isPrimary = resolvedVariant === 'primary' || resolvedVariant === 'solid'
  const isSecondary = resolvedVariant === 'secondary'
  const isTertiary = resolvedVariant === 'tertiary'
  const isOutline = resolvedVariant === 'outline'
  const isGhost = resolvedVariant === 'ghost'
  const isSubtle = resolvedVariant === 'subtle'

  let chakraVariant: ButtonProps['variant'] = 'solid'
  if (isSecondary || isOutline) chakraVariant = 'outline'
  else if (isTertiary || isGhost || isSubtle) chakraVariant = 'ghost'
  else chakraVariant = 'solid'

  let visualProps: Partial<ButtonProps> = {}

  switch (resolvedVariant) {
    case 'primary':
    case 'solid':
      visualProps = {
        bg: 'primary',
        color: 'black',
        boxShadow: 'primary',
        borderWidth: '0px',
      }
      break
    case 'secondary':
      visualProps = {
        bg: 'transparent',
        color: 'secondary.500',
        borderWidth: '1px',
        borderColor: 'secondary.500',
      }
      break
    case 'tertiary':
      visualProps = {
        bg: 'transparent',
        color: 'secondary.500',
        borderWidth: '0px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        fontWeight: 700,
      }
      break
    case 'outline':
      visualProps = {
        bg: 'transparent',
        color: 'jobCardTitle',
        borderWidth: '1px',
        borderColor: 'formControlBorder',
      }
      break
    case 'ghost':
      visualProps = {
        bg: 'transparent',
        color: 'secondary.500',
        borderWidth: '0px',
      }
      break
    case 'subtle':
      visualProps = {
        bg: 'transparent',
        color: 'secondary.600',
        borderWidth: '0px',
        fontWeight: 600,
      }
      break
    default:
      visualProps = {}
  }

  return (
    <ChakraButton
      variant={chakraVariant}
      fontFamily="heading"
      fontWeight={700}
      borderRadius="sm"
      px={4}
      {...visualProps}
      _hover={{
        transform: 'none',
        opacity: 1,
        ...(isPrimary ? { bg: 'primaryHover' } : undefined),
        ...(isSecondary
          ? {
              bg: 'transparent',
              borderColor: 'secondary.600',
              color: 'secondary.600',
            }
          : undefined),
        ...(isTertiary
          ? { bg: 'transparent', color: 'primary.500' }
          : undefined),
        ...(isOutline
          ? {
              bg: 'badgeBg',
              borderColor: 'formControlBorder',
            }
          : undefined),
        ...(isGhost ? { bg: 'badgeBg', color: 'primary.500' } : undefined),
        ...(isSubtle ? { bg: 'badgeBg', color: 'primary.600' } : undefined),
      }}
      _active={{
        transform: 'none',
        opacity: 1,
        ...(isPrimary ? { bg: 'primary.600' } : undefined),
      }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: 'primary.500',
        outlineOffset: '2px',
      }}
      {...restProps}
    />
  )
}
