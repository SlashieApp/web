'use client'

import { HStack, Stack, Switch, Text } from '@chakra-ui/react'

export type WebPushSettingProps = {
  label: string
  description: string
  unavailable?: string
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
}

/** Settings opt-in for browser notifications. The parent owns permission and the API. */
export function WebPushSetting({
  label,
  description,
  unavailable,
  checked,
  disabled = false,
  onChange,
}: WebPushSettingProps) {
  return (
    <HStack justify="space-between" align="flex-start" gap={4}>
      <Stack gap={0} flex="1" minW={0}>
        <Text fontSize="sm" fontWeight={700}>
          {label}
        </Text>
        <Text fontSize="xs" color="text.muted">
          {unavailable ?? description}
        </Text>
      </Stack>
      <Switch.Root
        checked={checked}
        disabled={disabled || Boolean(unavailable)}
        onCheckedChange={(details) => onChange(details.checked)}
      >
        <Switch.HiddenInput />
        <Switch.Control _checked={{ bg: 'action.primary' }}>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
    </HStack>
  )
}
