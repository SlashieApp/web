'use client'

import { Switch } from '@chakra-ui/react'

import { SettingRow } from './SettingRow'

export type SettingToggleProps = {
  label: string
  /** One line under the label: what it does, or why it can't change now. */
  description: string
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
}

/** A labelled on/off setting row (Account notifications, Profile visibility). */
export function SettingToggle({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: SettingToggleProps) {
  return (
    <SettingRow label={label} description={description}>
      <Switch.Root
        checked={checked}
        disabled={disabled}
        onCheckedChange={(details) => onChange(details.checked)}
      >
        {/* The visible label sits outside Switch.Root: name the input. */}
        <Switch.HiddenInput aria-label={label} />
        <Switch.Control _checked={{ bg: 'action.primary' }}>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
    </SettingRow>
  )
}
