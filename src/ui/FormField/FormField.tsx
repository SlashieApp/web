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
  Text,
  type TextProps,
} from '@chakra-ui/react'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'

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
  iconProps,
  icon,
  onControlClick,
  disabled,
  required,
  ...props
}: FormFieldProps) {
  const baseId = useId()
  const controlId = `${baseId}-control`
  const helperId = helperText ? `${baseId}-helper` : undefined
  const errorId = errorText ? `${baseId}-error` : undefined
  const invalid = Boolean(errorText)
  const isDisabled = Boolean(disabled)
  const isRequired = Boolean(required)

  const fieldState = useMemo<FormFieldState>(
    () => ({
      controlId,
      invalid,
      disabled: isDisabled,
      required: isRequired,
      errorText,
      helperText,
      describedBy: [helperId, errorId].filter(Boolean).join(' ') || undefined,
    }),
    [
      controlId,
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
      <FieldRoot
        invalid={invalid}
        disabled={disabled}
        required={required}
        gap={2}
        w="full"
        {...props}
      >
        <FieldLabel
          htmlFor={controlId}
          fontSize="14px"
          fontWeight={500}
          color="text.default"
          px={1}
          {...labelProps}
        >
          {label}
        </FieldLabel>
        {control}
        {helperText ? (
          <Text
            id={helperId}
            fontSize="sm"
            color="text.muted"
            lineHeight="tall"
            px={1}
            {...helperTextProps}
          >
            {helperText}
          </Text>
        ) : null}
        {errorText ? (
          <FieldErrorText
            id={errorId}
            color="status.danger.fg"
            display="flex"
            alignItems="center"
            gap={1.5}
            px={1}
          >
            {/* Status not by color alone: pair an icon + label. */}
            <Box
              as="span"
              aria-hidden
              flexShrink={0}
              boxSize="6px"
              borderRadius="full"
              bg="status.danger.solid"
            />
            {errorText}
          </FieldErrorText>
        ) : null}
      </FieldRoot>
    </FormFieldStateContext.Provider>
  )
}

/** Shared bordered field shell — Design-System/inputs.md (8px radius, 40px min height). */
export const formControlRootProps = {
  minH: '40px',
  w: 'full',
  borderRadius: 'md',
  pl: 3,
  pr: 3,
} satisfies ComponentProps<typeof Box>

/** Default label treatment — 14px medium, heading color, 8px bottom margin. */
export const formControlLabelProps = {
  fontSize: '14px',
  fontWeight: 500,
  color: 'text.default',
  mb: 2,
} as const

/** Helper copy under fields. */
export const formControlHelperTextProps = {
  fontSize: 'sm',
  color: 'text.muted',
  lineHeight: 'tall',
} satisfies TextProps

/** Multiline field shell aligned with inputs.md. */
export const formControlTextareaProps = {
  borderRadius: 'md',
  px: 3,
  py: 2.5,
  fontSize: '14px',
  minH: '140px',
} as const
