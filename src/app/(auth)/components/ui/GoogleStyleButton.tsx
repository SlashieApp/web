'use client'

import { chakra } from '@chakra-ui/react'
import type { ComponentProps, ReactNode } from 'react'

import { socialButtonPx } from '@/app/(auth)/helpers/socialButton'
import { sdlFocusRing } from '@/theme/styles'

/**
 * Google's outline button, matched exactly: their widget can't be restyled (it
 * provides the ID token the API verifies), so Apple and Continue with email
 * (FE-563) follow it. Apple's
 * guidelines allow this white, outlined style. The colours are Google's
 * fixed values, not theme tokens: their widget stays white in dark mode too.
 * Google's button is scaled to the form control height (48), so Apple is built
 * at 48 with the same scale on its padding, text and logo.
 */
export function GoogleStyleButton({
  label,
  icon,
  disabled = false,
  describedBy,
  onClick,
  ...rest
}: {
  label: string
  /** The mark before the label, at `socialButtonPx(18)`. */
  icon: ReactNode
  disabled?: boolean
  /** The id of the text that explains the button (why it is blocked). */
  describedBy?: string
  onClick: () => void
} & Pick<ComponentProps<'button'>, 'aria-expanded' | 'aria-controls' | 'id'> &
  Record<`data-${string}`, string>) {
  return (
    <chakra.button
      type="button"
      aria-describedby={describedBy}
      w="full"
      maxW="400px"
      h="form.controlHeight"
      px={`${socialButtonPx(12)}px`}
      display="flex"
      alignItems="center"
      gap={`${socialButtonPx(8)}px`}
      borderRadius="full"
      borderWidth="1px"
      borderColor="#dadce0"
      bg="white"
      color="#3c4043"
      fontFamily='"Google Sans", arial, sans-serif'
      fontSize={`${socialButtonPx(14)}px`}
      fontWeight={500}
      letterSpacing={`${socialButtonPx(0.25)}px`}
      cursor="pointer"
      transition="background-color 0.218s, border-color 0.218s"
      _hover={{ bg: '#f8faff', borderColor: '#d2e3fc' }}
      disabled={disabled}
      _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
      _focusVisible={sdlFocusRing}
      onClick={onClick}
      {...rest}
    >
      {icon}
      {/* Centred in the space after the logo, like Google's label. */}
      <chakra.span flex={1} textAlign="center">
        {label}
      </chakra.span>
    </chakra.button>
  )
}
