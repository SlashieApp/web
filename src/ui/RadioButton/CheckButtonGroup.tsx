'use client'

import { SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { type ReactNode, useId } from 'react'

import { formHelperTextStyle } from '@/theme/styles'

import { FormErrorText } from '../FormField/FormErrorText'
import { formControlLabelProps } from '../FormField/FormField'
import { RadioButton } from './RadioButton'

export type CheckButtonGroupOption<T extends string> = {
  value: T
  label: ReactNode
}

export type CheckButtonGroupProps<T extends string> = {
  label: ReactNode
  /** Every option that is chosen. Empty: nothing chosen yet. */
  values: readonly T[]
  options: readonly CheckButtonGroupOption<T>[]
  /** The chosen options after a tap, in the order the options are listed. */
  onChange: (values: T[]) => void
  helperText?: ReactNode
  errorText?: ReactNode
  /** Options per row from `sm` up (phones stack them), or per breakpoint. */
  columns?: number | { base: number; sm: number }
}

/**
 * A labelled choice of several (FE-599): the rows of a `RadioButtonGroup`,
 * each with a box that is ticked when chosen, so it reads as "pick any" and
 * not "pick one". Tapping a row adds it or takes it off. A `role="group"` of
 * `role="checkbox"` rows, each announced as ticked or not.
 *
 * Same form spacing as `RadioButtonGroup` (FE-481): the label is
 * `labelToControl` (8) above the rows, the rows `alternativesGap` (8) apart,
 * the helper and the error `controlToHelper` (4) under them.
 */
export function CheckButtonGroup<T extends string>({
  label,
  values,
  options,
  onChange,
  helperText,
  errorText,
  columns = options.length,
}: CheckButtonGroupProps<T>) {
  const id = useId()
  const labelId = `${id}-label`
  const helperId = helperText ? `${id}-helper` : undefined
  const errorId = errorText ? `${id}-error` : undefined
  const hasMeta = Boolean(helperText) || Boolean(errorText)

  const toggle = (value: T) =>
    onChange(
      options
        .map((option) => option.value)
        .filter((candidate) =>
          candidate === value
            ? !values.includes(candidate)
            : values.includes(candidate),
        ),
    )

  return (
    <Stack gap={0} w="full">
      <Text id={labelId} {...formControlLabelProps} px={1}>
        {label}
      </Text>
      <SimpleGrid
        // biome-ignore lint/a11y/useSemanticElements: a fieldset's own layout (min-width, its legend) would break the grid these rows share with RadioButtonGroup
        role="group"
        aria-labelledby={labelId}
        aria-describedby={
          [helperId, errorId].filter(Boolean).join(' ') || undefined
        }
        columns={
          typeof columns === 'number' ? { base: 1, sm: columns } : columns
        }
        gap="form.alternativesGap"
      >
        {options.map((option) => (
          <RadioButton
            key={option.value}
            role="checkbox"
            indicator="check"
            checked={values.includes(option.value)}
            label={option.label}
            aria-invalid={errorText ? true : undefined}
            onChange={() => toggle(option.value)}
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
          {errorText ? (
            <FormErrorText id={errorId}>{errorText}</FormErrorText>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  )
}
