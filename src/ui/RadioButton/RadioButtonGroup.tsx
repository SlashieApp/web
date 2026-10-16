'use client'

import { Box, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { type ReactNode, useId } from 'react'

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

  return (
    <Stack gap={2} w="full">
      <Text
        id={labelId}
        fontSize="14px"
        fontWeight={500}
        color="text.default"
        px={1}
      >
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
        gap={2}
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
      {helperText ? (
        <Text
          id={helperId}
          fontSize="sm"
          color="text.muted"
          lineHeight="tall"
          px={1}
        >
          {helperText}
        </Text>
      ) : null}
      {hints.map((option) => (
        <Text key={option.value} fontSize="sm" color="text.muted" px={1}>
          {option.disabledHint}
        </Text>
      ))}
      {errorText ? (
        <Text
          id={errorId}
          color="status.danger.fg"
          fontSize="sm"
          display="flex"
          alignItems="center"
          gap={1.5}
          px={1}
        >
          <Box
            as="span"
            aria-hidden
            flexShrink={0}
            boxSize="6px"
            borderRadius="full"
            bg="status.danger.solid"
          />
          {errorText}
        </Text>
      ) : null}
    </Stack>
  )
}
