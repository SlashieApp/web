'use client'

import { SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { type ReactNode, useId } from 'react'

import { formHelperTextStyle } from '@/theme/styles'

import { FormErrorText } from '../FormField/FormErrorText'
import { formControlLabelProps } from '../FormField/FormField'
import { RadioButton } from './RadioButton'

export type RadioButtonGroupOption<T extends string> = {
  value: T
  label: ReactNode
  disabled?: boolean
  /** Shown under the group while the option is disabled (why, and how to unlock it). */
  disabledHint?: ReactNode
}

export type RadioButtonGroupProps<T extends string> = {
  label: ReactNode
  /** Null: nothing chosen yet. */
  value: T | null
  options: readonly RadioButtonGroupOption<T>[]
  onChange: (value: T) => void
  helperText?: ReactNode
  errorText?: ReactNode
  /** Options per row from `sm` up (phones stack them), or per breakpoint. */
  columns?: number | { base: number; sm: number }
}

/**
 * A labelled single choice made of RadioButton rows (`role="radiogroup"`),
 * so the selected option is announced and shown by the dot, not by colour
 * alone. Rows meet the 44px touch target.
 *
 * Form spacing (FE-481): a choice group lays out like a field. The label is
 * `labelToControl` (8) above the rows, the rows are `alternativesGap` (8)
 * apart, and the helper, a disabled option's hint and the error sit
 * `controlToHelper` (4) under the rows, `helperGap` (4) apart, on the compact
 * line height so 4 reads as 4.
 */
export function RadioButtonGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  helperText,
  errorText,
  columns = options.length,
}: RadioButtonGroupProps<T>) {
  const id = useId()
  const labelId = `${id}-label`
  const helperId = helperText ? `${id}-helper` : undefined
  const errorId = errorText ? `${id}-error` : undefined
  const hints = options.filter(
    (option) => option.disabled && option.disabledHint,
  )

  const hasMeta = Boolean(helperText) || hints.length > 0 || Boolean(errorText)

  return (
    <Stack gap={0} w="full">
      <Text id={labelId} {...formControlLabelProps} px={1}>
        {label}
      </Text>
      <SimpleGrid
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={
          [helperId, errorId].filter(Boolean).join(' ') || undefined
        }
        aria-invalid={errorText ? true : undefined}
        columns={
          typeof columns === 'number' ? { base: 1, sm: columns } : columns
        }
        gap="form.alternativesGap"
      >
        {options.map((option) => (
          <RadioButton
            key={option.value}
            role="radio"
            checked={option.value === value}
            label={option.label}
            disabled={option.disabled}
            onChange={() => onChange(option.value)}
          />
        ))}
      </SimpleGrid>
      {hasMeta ? (
        <Stack gap="form.helperGap" mt="form.controlToHelper">
          {helperText ? (
            <Text id={helperId} {...formHelperTextStyle} px={1}>
              {helperText}
            </Text>
          ) : null}
          {hints.map((option) => (
            <Text key={option.value} {...formHelperTextStyle} px={1}>
              {option.disabledHint}
            </Text>
          ))}
          {errorText ? (
            <FormErrorText id={errorId}>{errorText}</FormErrorText>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  )
}
