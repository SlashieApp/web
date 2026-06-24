'use client'

import { Box, HStack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { sdlMotion } from '@/theme/styles'
import {
  DEFAULT_CALLING_CODE,
  combinePhoneParts,
  splitPhoneE164,
} from '@/utils/phoneCountries'

import { FormField } from '../FormField'
import { Input } from '../Input'

/**
 * SDL PhoneInput. A UK (+44) phone number field: a non-interactive dialling-code
 * prefix sits beside the national-number {@link Input}, which carries the focus
 * ring and the 44px touch target via the shared bordered shell.
 *
 * Wiring: pass `label` to wrap the field in a `FormField` for a persistent
 * `<label>` and helper/error text tied to the input via `aria-describedby`
 * (never rely on the placeholder as a label). Without `label`, the field falls
 * back to its `aria-label` so existing call sites keep working unchanged.
 */
export type PhoneInputProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  id?: string
  name?: string
  'aria-label'?: string
  nationalPlaceholder?: string
  /** Persistent label. When set, the field is wrapped in a `FormField`. */
  label?: ReactNode
  /** Helper copy under the field (tied via `aria-describedby`). */
  helperText?: string
  /** Error message (sets the invalid state + `aria-describedby`). */
  errorText?: string
}

/** Non-interactive dialling-code prefix; neutral chrome, not a status surface. */
function DialPrefix({ disabled }: { disabled: boolean }) {
  return (
    <Box
      flexShrink={0}
      display="flex"
      alignItems="center"
      px={3}
      minH="44px"
      borderRadius="md"
      borderWidth="1px"
      /* TODO(sdl): verify role — `badgeBg` maps to status.success.soft, but a
         dialling-code prefix is neutral chrome (not a status), so it uses the
         subtle surface to match the sibling Input shell. */
      borderColor="border.default"
      bg="bg.subtle"
      color="text.muted"
      transitionProperty="border-color, background-color, color"
      transitionDuration={sdlMotion.duration.moderate}
      transitionTimingFunction={sdlMotion.easing.standard}
      opacity={disabled ? 0.6 : 1}
      aria-hidden
    >
      <Text fontSize="sm" fontWeight={600} whiteSpace="nowrap">
        {DEFAULT_CALLING_CODE}
      </Text>
    </Box>
  )
}

export function PhoneInput({
  value,
  onChange,
  disabled = false,
  id,
  name,
  'aria-label': ariaLabel,
  nationalPlaceholder = '7700 900123',
  label,
  helperText,
  errorText,
}: PhoneInputProps) {
  const parsed = splitPhoneE164(value)
  const national =
    parsed?.dial === DEFAULT_CALLING_CODE
      ? (parsed.national ?? '')
      : value.trim() &&
          !value
            .trim()
            .replace(/[\s()-]/g, '')
            .startsWith('+')
        ? (parsed?.national ?? '')
        : ''

  const hasLabel = label != null

  const field = (
    <HStack gap={2} align="stretch" w="full">
      <DialPrefix disabled={disabled} />
      <Input
        // With a label, let FormField own the id/label association.
        id={hasLabel ? undefined : id}
        name={name}
        aria-label={hasLabel ? undefined : (ariaLabel ?? 'UK mobile number')}
        value={national}
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={nationalPlaceholder}
        onChange={(e) =>
          onChange(combinePhoneParts(DEFAULT_CALLING_CODE, e.target.value))
        }
        disabled={disabled}
        rootProps={{ flex: 1, minW: 0 }}
      />
    </HStack>
  )

  if (!hasLabel) return field

  return (
    <FormField
      label={label}
      helperText={helperText}
      errorText={errorText}
      disabled={disabled}
    >
      {field}
    </FormField>
  )
}
