'use client'

import { Box, HStack, Text } from '@chakra-ui/react'

import {
  DEFAULT_CALLING_CODE,
  combinePhoneParts,
  splitPhoneE164,
} from '@/utils/phoneCountries'

import { Input } from '../Input'

export type PhoneInputProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  id?: string
  name?: string
  'aria-label'?: string
  nationalPlaceholder?: string
}

export function PhoneInput({
  value,
  onChange,
  disabled = false,
  id,
  name,
  'aria-label': ariaLabel,
  nationalPlaceholder = '7700 900123',
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

  return (
    <HStack gap={2} align="stretch" w="full">
      <Box
        flexShrink={0}
        display="flex"
        alignItems="center"
        px={3}
        minH={{ base: 10, md: 11 }}
        borderRadius={{ base: 'lg', md: 'xl' }}
        borderWidth="1px"
        borderColor="formControlBorder"
        bg="badgeBg"
        color="formLabelMuted"
        aria-hidden
      >
        <Text fontSize="sm" fontWeight={600} whiteSpace="nowrap">
          +44
        </Text>
      </Box>
      <Input
        id={id}
        name={name}
        aria-label={ariaLabel ?? 'UK mobile number'}
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
}
