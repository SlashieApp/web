'use client'

import type { ComponentProps, MouseEventHandler, ReactNode } from 'react'
import { useId, useMemo } from 'react'

import {
  Box,
  type BoxProps,
  FieldErrorText,
  FieldLabel,
  FieldRoot,
  HStack,
  Stack,
  Text,
  type TextProps,
} from '@chakra-ui/react'

import { formHelperTextStyle, sdlFocusRing, sdlMotion } from '@/theme/styles'

import { FormErrorDot, formControlErrorTextProps } from './FormErrorText'
import { type FormFieldState, FormFieldStateContext } from './formFieldContext'

/** When true, the click is treated as interacting with a real editable control (skip `onControlClick`). */
function isTypingSurfaceTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  const el = target.closest('input, textarea, select, [contenteditable="true"]')
  if (!el) return false
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    if (el.disabled) return true
    if (el.readOnly) return false
    return true
  }
  if (el instanceof HTMLSelectElement) return !el.disabled
  return true
}

export type FormFieldProps = {
  label: ReactNode
  helperText?: string
  errorText?: string
  /**
   * Control slot: any `@ui` input or custom control that reads {@link useFormFieldControlProps}.
   * Optional render prop receives the resolved field state.
   */
  children: ReactNode | ((field: FormFieldState) => ReactNode)
  labelProps?: React.ComponentProps<typeof FieldLabel>
  helperTextProps?: TextProps
  /**
   * An inline action in the helper slot, right-aligned beside the helper text
   * (or alone): "Forgot password?" under a password field. It sits
   * `controlToHelper` (4) below the control, like the helper.
   */
  helperAction?: ReactNode
  /** Applied to the icon slot wrapper (e.g. `color` on dark panels). */
  iconProps?: Omit<BoxProps, 'children'>
  /** Optional leading icon inside the control row (e.g. calendar, currency). */
  icon?: ReactNode
  /**
   * Fires when the control row is activated (e.g. open a picker).
   * Clicks on editable inputs (not `readOnly`), textareas, selects, and contenteditable are ignored so typing still works; `readOnly` inputs still receive this handler (e.g. date triggers).
   */
  onControlClick?: MouseEventHandler<HTMLDivElement>
} & Omit<React.ComponentProps<typeof FieldRoot>, 'children'>

export function FormField({
  label,
  helperText,
  errorText,
  children,
  labelProps,
  helperTextProps,
  helperAction,
  iconProps,
  icon,
  onControlClick,
  disabled,
  required,
  ...props
}: FormFieldProps) {
  const baseId = useId()
  const controlId = `${baseId}-control`
  const labelId = `${baseId}-label`
  const helperId = helperText ? `${baseId}-helper` : undefined
  const errorId = errorText ? `${baseId}-error` : undefined
  const invalid = Boolean(errorText)
  const isDisabled = Boolean(disabled)
  const isRequired = Boolean(required)

  const fieldState = useMemo<FormFieldState>(
    () => ({
      controlId,
      labelId,
      invalid,
      disabled: isDisabled,
      required: isRequired,
      errorText,
      helperText,
      describedBy: [helperId, errorId].filter(Boolean).join(' ') || undefined,
    }),
    [
      controlId,
      labelId,
      errorId,
      errorText,
      helperId,
      helperText,
      invalid,
      isDisabled,
      isRequired,
    ],
  )

  const handleControlClick: MouseEventHandler<HTMLDivElement> | undefined =
    onControlClick
      ? (e) => {
          if (isTypingSurfaceTarget(e.target)) return
          onControlClick(e)
        }
      : undefined

  const useControlRow = icon != null || onControlClick != null

  const controlBody =
    typeof children === 'function' ? children(fieldState) : children

  const control = useControlRow ? (
    <HStack
      gap={2}
      w="full"
      align="center"
      cursor={onControlClick ? 'pointer' : undefined}
      onClick={handleControlClick}
      transitionProperty="box-shadow, outline-color"
      transitionDuration={sdlMotion.duration.moderate}
      transitionTimingFunction={sdlMotion.easing.standard}
      _focusVisible={onControlClick ? sdlFocusRing : undefined}
      borderRadius={onControlClick ? 'md' : undefined}
    >
      {icon != null ? (
        <Box
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="text.muted"
          fontSize="md"
          pointerEvents="none"
          aria-hidden
          {...iconProps}
        >
          {icon}
        </Box>
      ) : null}
      <Box flex="1" minW={0} w="full">
        {controlBody}
      </Box>
    </HStack>
  ) : (
    <Box w="full">{controlBody}</Box>
  )

  return (
    <FormFieldStateContext.Provider value={fieldState}>
      {/*
        Form spacing (FE-481): the label sits `labelToControl` above the control,
        and the messages sit `controlToHelper` below it, `helperGap` apart. The
        root has no gap of its own, so a one-line field is just label + control.
      */}
      <FieldRoot
        invalid={invalid}
        disabled={disabled}
        required={required}
        gap={0}
        w="full"
        {...props}
      >
        <FieldLabel
          id={labelId}
          htmlFor={controlId}
          {...formControlLabelProps}
          px={1}
          {...labelProps}
        >
          {label}
        </FieldLabel>
        {control}
        {helperText || helperAction || errorText ? (
          <Stack gap="form.helperGap" mt="form.controlToHelper" w="full">
            {helperText || helperAction ? (
              <HStack gap={3} align="flex-start" w="full">
                {helperText ? (
                  <Text
                    id={helperId}
                    {...formControlHelperTextProps}
                    flex={1}
                    minW={0}
                    px={1}
                    {...helperTextProps}
                  >
                    {helperText}
                  </Text>
                ) : null}
                {helperAction ? (
                  <Box
                    flexShrink={0}
                    ml="auto"
                    px={1}
                    {...formControlHelperTextProps}
                  >
                    {helperAction}
                  </Box>
                ) : null}
              </HStack>
            ) : null}
            {errorText ? (
              <FieldErrorText
                id={errorId}
                // Announced as it appears, like every other error under a
                // control (`FormErrorText`). Ark's own `aria-live="polite"`
                // region mounts already holding its message, which readers do
                // not reliably announce; an alert is.
                role="alert"
                aria-live="assertive"
                {...formControlErrorTextProps}
              >
                {/* Status not by color alone: pair a dot + label. */}
                <FormErrorDot />
                {errorText}
              </FieldErrorText>
            ) : null}
          </Stack>
        ) : null}
      </FieldRoot>
    </FormFieldStateContext.Provider>
  )
}

/**
 * Shared bordered field shell: 8px radius and the form control height (48).
 * Spread it as `rootProps` on an `Input` that must not shrink below the field
 * height. An `Input` inside a {@link FormField} already has that height.
 */
export const formControlRootProps = {
  minH: 'form.controlHeight',
  w: 'full',
  borderRadius: 'md',
} satisfies ComponentProps<typeof Box>

/**
 * Default label treatment: 14px on a 20px line, medium, heading color,
 * `labelToControl` (8) above the control. {@link FormField} applies it; a
 * hand-rolled label that sits on a control (a choice group's, the security
 * check's) reads it too, so the gap and the line are one token. The line is
 * explicit: left to the page's 1.5 it is 21, and a field around it would sit
 * 1px off the 20 rhythm.
 */
export const formControlLabelProps = {
  fontSize: '14px',
  lineHeight: '20px',
  fontWeight: 500,
  color: 'text.default',
  mb: 'form.labelToControl',
} as const

/** Helper copy under fields: compact line height, so the 4px below the control reads as 4. */
export const formControlHelperTextProps = {
  ...formHelperTextStyle,
} satisfies TextProps

/** Multiline field shell aligned with inputs.md. */
export const formControlTextareaProps = {
  borderRadius: 'md',
  px: 3,
  py: 2.5,
  fontSize: '14px',
  minH: '140px',
} as const
