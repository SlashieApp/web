'use client'

import type { MouseEventHandler, ReactNode } from 'react'

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
  children: React.ReactNode
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
  ...props
}: FormFieldProps) {
  const handleControlClick: MouseEventHandler<HTMLDivElement> | undefined =
    onControlClick
      ? (e) => {
          if (isTypingSurfaceTarget(e.target)) return
          onControlClick(e)
        }
      : undefined

  const useControlRow = icon != null || onControlClick != null

  const control = useControlRow ? (
    <HStack
      gap={3}
      w="full"
      align="center"
      cursor={onControlClick ? 'pointer' : undefined}
      onClick={handleControlClick}
    >
      {icon != null ? (
        <Box
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="secondary.600"
          fontSize="md"
          pointerEvents="none"
          aria-hidden
          {...iconProps}
        >
          {icon}
        </Box>
      ) : null}
      <Box flex="1" minW={0} w="full">
        {children}
      </Box>
    </HStack>
  ) : (
    children
  )

  return (
    <FieldRoot invalid={Boolean(errorText)} {...props}>
      <FieldLabel
        fontSize="sm"
        fontWeight={700}
        color="secondary.900"
        {...labelProps}
      >
        {label}
      </FieldLabel>
      {control}
      {helperText ? (
        <Text fontSize="sm" color="secondary.700" {...helperTextProps}>
          {helperText}
        </Text>
      ) : null}
      {errorText ? <FieldErrorText>{errorText}</FieldErrorText> : null}
    </FieldRoot>
  )
}
