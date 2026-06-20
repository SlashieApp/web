import type { SystemStyleObject } from '@chakra-ui/react'

import {
  dsButtonGlint,
  dsButtonSizes,
  dsColors,
  dsInput,
  dsShadows,
} from '@/theme/designSystem'

export type UiButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'ghost'
  | 'subtle'
  | 'solid'
  | 'success'
  | 'danger'

export type UiButtonSize = keyof typeof dsButtonSizes

const focusRingBrand: SystemStyleObject = {
  outline: 'none',
  boxShadow: `0 0 0 4px ${dsColors.brandSofter}`,
}

const focusRingNeutral: SystemStyleObject = {
  outline: 'none',
  boxShadow: `0 0 0 4px ${dsColors.disabledBg}`,
}

export function buttonSizeProps(size: UiButtonSize = 'md') {
  const s = dsButtonSizes[size]
  return {
    fontSize: s.fontSize,
    px: s.px,
    py: s.py,
  }
}

export function buttonVariantStyles(
  variant: UiButtonVariant,
): SystemStyleObject {
  switch (variant) {
    case 'primary':
    case 'solid':
      return {
        bg: dsColors.brand,
        color: 'white',
        borderWidth: '1px',
        borderColor: 'transparent',
        boxShadow: dsButtonGlint(),
        fontWeight: 500,
        _hover: {
          bg: dsColors.brandStrong,
          boxShadow: dsButtonGlint(),
        },
        _active: { bg: dsColors.brandStrong },
        _focusVisible: focusRingBrand,
        _disabled: {
          bg: dsColors.disabledBg,
          color: dsColors.disabledFg,
          borderColor: dsColors.borderDefaultMedium,
          boxShadow: 'none',
          cursor: 'not-allowed',
          opacity: 1,
        },
      }
    case 'secondary':
    case 'outline':
      return {
        bg: dsColors.inputBg,
        color: dsColors.heading,
        borderWidth: '1px',
        borderColor: dsColors.borderDefaultMedium,
        boxShadow: dsShadows.xs,
        fontWeight: 500,
        _hover: {
          bg: dsColors.pageBg,
          color: dsColors.heading,
          boxShadow: dsShadows.xs,
        },
        _focusVisible: focusRingNeutral,
        _disabled: {
          bg: dsColors.disabledBg,
          color: dsColors.disabledFg,
          boxShadow: 'none',
          cursor: 'not-allowed',
        },
      }
    case 'tertiary':
    case 'subtle':
      return {
        bg: dsColors.cardBg,
        color: dsColors.heading,
        borderWidth: '1px',
        borderColor: dsColors.borderDefault,
        boxShadow: dsShadows.xs,
        fontWeight: 500,
        _hover: {
          bg: dsColors.inputBg,
          color: dsColors.heading,
        },
        _focusVisible: focusRingNeutral,
        _disabled: {
          bg: dsColors.disabledBg,
          color: dsColors.disabledFg,
          boxShadow: 'none',
          cursor: 'not-allowed',
        },
      }
    case 'ghost':
      return {
        bg: 'transparent',
        color: dsColors.heading,
        borderWidth: '0',
        boxShadow: 'none',
        fontWeight: 500,
        _hover: { bg: dsColors.inputBg },
        _focusVisible: focusRingNeutral,
        _disabled: {
          color: dsColors.disabledFg,
          cursor: 'not-allowed',
        },
      }
    case 'success':
      return {
        bg: dsColors.success,
        color: 'white',
        borderWidth: '1px',
        borderColor: 'transparent',
        boxShadow: dsButtonGlint(),
        fontWeight: 500,
        _hover: { filter: 'brightness(0.95)' },
        _focusVisible: focusRingBrand,
      }
    case 'danger':
      return {
        bg: dsColors.danger,
        color: 'white',
        borderWidth: '1px',
        borderColor: 'transparent',
        boxShadow: dsButtonGlint(),
        fontWeight: 500,
        _hover: { filter: 'brightness(0.95)' },
        _focusVisible: {
          outline: 'none',
          boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.25)',
        },
      }
    default:
      return {}
  }
}

/** Shared bordered control shell (inputs.md) */
export const dsFormControlShell: SystemStyleObject = {
  minH: dsInput.minH,
  borderRadius: dsInput.radius,
  borderWidth: '1px',
  borderColor: 'formControlBorder',
  bg: 'formControlBg',
  boxShadow: 'xs',
  fontSize: dsInput.fontSize,
  transitionProperty: 'border-color, box-shadow',
  transitionDuration: '200ms',
  _hover: { borderColor: 'formControlBorderStrong' },
  _focusWithin: {
    borderColor: 'formControlFocusBorder',
    boxShadow: `0 0 0 1px ${dsColors.borderBrand}`,
  },
}

/** cards.md static card */
export const dsCardSurface: SystemStyleObject = {
  bg: 'cardBg',
  borderWidth: '1px',
  borderColor: 'cardBorder',
  borderRadius: 'md',
  boxShadow: 'xs',
}

/** cards.md interactive card hover */
export const dsCardInteractive: SystemStyleObject = {
  ...dsCardSurface,
  cursor: 'pointer',
  transitionProperty: 'background-color',
  transitionDuration: '160ms',
  _hover: { bg: 'surfaceHover' },
}

export type UiBadgeVariant =
  | 'brand'
  | 'alternative'
  | 'gray'
  | 'danger'
  | 'success'
  | 'warning'
  | 'dark'

export type UiBadgeSize = 'sm' | 'lg'
export type UiBadgeShape = 'default' | 'pill'

const badgeSizes: Record<UiBadgeSize, SystemStyleObject> = {
  sm: { fontSize: '12px', px: 1.5, py: 0.5 },
  lg: { fontSize: '14px', px: 2, py: 1 },
}

export function badgeVariantStyles(
  variant: UiBadgeVariant = 'brand',
): SystemStyleObject {
  switch (variant) {
    case 'brand':
      return {
        bg: dsColors.brandSofter,
        color: dsColors.brandStrong,
        borderColor: dsColors.brandSoft,
      }
    case 'alternative':
      return {
        bg: dsColors.cardBg,
        color: dsColors.heading,
        borderColor: dsColors.borderDefault,
      }
    case 'gray':
      return {
        bg: dsColors.inputBg,
        color: dsColors.heading,
        borderColor: dsColors.borderDefault,
      }
    case 'danger':
      return {
        bg: '#FEE2E2',
        color: '#B91C1C',
        borderColor: '#FECACA',
      }
    case 'success':
      return {
        bg: '#DCFCE7',
        color: '#15803D',
        borderColor: '#BBF7D0',
      }
    case 'warning':
      return {
        bg: '#FEF3C7',
        color: '#B45309',
        borderColor: '#FDE68A',
      }
    case 'dark':
      return {
        bg: dsColors.heading,
        color: 'white',
        borderColor: 'transparent',
      }
    default:
      return {}
  }
}

export function badgeSizeStyles(size: UiBadgeSize = 'sm') {
  return badgeSizes[size]
}
