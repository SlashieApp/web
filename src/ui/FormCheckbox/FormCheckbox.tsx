'use client'

import { Checkbox, HStack, Stack } from '@chakra-ui/react'
import { type ComponentProps, type ReactNode, type Ref, useId } from 'react'

import { hitAreaGrowth } from '@/theme/styles'

import { FormErrorText } from '../FormField/FormErrorText'

/** A checkbox row is one line of its label: 20 tall, like a field's control line. */
export const FORM_CHECKBOX_LINE_HEIGHT = 20

export type FormCheckboxProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** The label. It may wrap: the box stays level with its first line. */
  label: ReactNode
  /** The input's name (react-hook-form `Controller`, a native form). */
  name?: string
  inputRef?: Ref<HTMLInputElement>
  /**
   * The error, already in the reader's language. It sits `controlToHelper` (4)
   * under the row, is announced when it appears (`role="alert"`), marks the box
   * invalid and is the box's description.
   */
  errorText?: string
  /**
   * How far the 44px tap target reaches above and below the row (px). By
   * default it grows evenly, into the field gap (20) around the row. Rows that
   * sit closer than that (a group of choices 8 apart) pass half the gap, so
   * their targets touch and never overlap; the target is then shorter than 44
   * by what the gap lacks.
   */
  reachAbove?: number
  reachBelow?: number
  /** Overrides for the box and the label, for a form that draws them differently. */
  controlProps?: ComponentProps<typeof Checkbox.Control>
  labelProps?: ComponentProps<typeof Checkbox.Label>
}

/**
 * SDL form checkbox (FE-481): one field group in a form. The visible row is the
 * label's lines (20 each), so the gap above and below it is the form's field
 * gap (a `FormStack` child) and its error sits `controlToHelper` (4) under it.
 * The 44px tap target grows past the row into the gaps around it
 * ({@link hitAreaGrowth}), so it adds no space.
 *
 * Used for log in's "Keep me signed in", sign up's age, Terms and marketing
 * boxes, post a task's confirmation and the admin cohorts, so the geometry of a
 * checkbox row is one thing.
 */
export function FormCheckbox({
  checked,
  onCheckedChange,
  label,
  name,
  inputRef,
  errorText,
  reachAbove,
  reachBelow,
  controlProps,
  labelProps,
}: FormCheckboxProps) {
  const errorId = useId()
  return (
    <Stack gap="form.controlToHelper">
      <Checkbox.Root
        name={name}
        checked={checked}
        onCheckedChange={(detail) => onCheckedChange(Boolean(detail.checked))}
        colorPalette="green"
        invalid={Boolean(errorText)}
      >
        <Checkbox.HiddenInput
          ref={inputRef}
          aria-describedby={errorText ? errorId : undefined}
        />
        <HStack
          gap={3}
          align="flex-start"
          {...hitAreaGrowth(FORM_CHECKBOX_LINE_HEIGHT, reachAbove, reachBelow)}
        >
          <Checkbox.Control
            borderRadius="md"
            borderWidth="1px"
            borderColor="border.strong"
            bg="bg.surface"
            cursor="pointer"
            _checked={{
              bg: 'action.primary',
              borderColor: 'action.primary',
              color: 'text.onGreen',
            }}
            {...controlProps}
          >
            <Checkbox.Indicator color="inherit" />
          </Checkbox.Control>
          <Checkbox.Label
            fontSize="sm"
            fontWeight={500}
            color="text.default"
            lineHeight={`${FORM_CHECKBOX_LINE_HEIGHT}px`}
            cursor="pointer"
            {...labelProps}
          >
            {label}
          </Checkbox.Label>
        </HStack>
      </Checkbox.Root>
      {errorText ? (
        <FormErrorText id={errorId}>{errorText}</FormErrorText>
      ) : null}
    </Stack>
  )
}
