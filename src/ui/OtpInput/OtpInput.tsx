'use client'

import { Box, Input as ChakraInput, HStack, Text } from '@chakra-ui/react'
import * as React from 'react'

import {
  formControlInvalidFieldProps,
  useFormFieldControlProps,
} from '../FormField/formFieldContext'
import { formControlFieldInteraction } from '../interactionStyles'

export type OtpInputProps = {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  autoFocus?: boolean
  /** Fires when Enter is pressed and all digits are filled. */
  onEnter?: (value: string) => void
  /** Fires when the last digit is entered. */
  onComplete?: (value: string) => void
}

const cellStyles = {
  w: '44px',
  h: '48px',
  textAlign: 'center' as const,
  fontSize: 'lg',
  fontWeight: 700,
  borderRadius: 'md',
  borderWidth: '1px',
  borderColor: 'formControlBorder',
  bg: 'formControlBg',
  color: 'formControlFg',
  px: 0,
  ...formControlFieldInteraction,
}

function normalizeDigits(raw: string, length: number): string {
  return raw.replace(/\D/g, '').slice(0, length)
}

function digitsToCells(value: string, length: number): string[] {
  const digits = normalizeDigits(value, length)
  return Array.from({ length }, (_, index) => digits[index] ?? '')
}

function cellsToDigits(cells: string[]): string {
  return cells.join('').replace(/\D/g, '')
}

/**
 * Six-digit OTP field with 3+3 grouping, auto-advance, backspace navigation,
 * paste support, and Enter to submit when complete.
 */
export const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  function OtpInput(
    {
      value,
      onChange,
      length = 6,
      disabled = false,
      autoFocus = true,
      onEnter,
      onComplete,
    },
    ref,
  ) {
    const { invalid, id, ...controlProps } = useFormFieldControlProps({
      disabled,
    })
    const isDisabled = controlProps.disabled

    const inputRefs = React.useRef<Array<HTMLInputElement | null>>([])
    const cells = digitsToCells(value, length)
    const indices = Array.from({ length }, (_, i) => i)
    const firstGroup = indices.slice(0, 3)
    const secondGroup = indices.slice(3)

    const focusCell = (index: number) => {
      const el = inputRefs.current[index]
      if (el) {
        el.focus()
        el.select()
      }
    }

    const emitChange = (nextCells: string[]) => {
      const next = cellsToDigits(nextCells)
      onChange(next)
      if (next.length === length) {
        onComplete?.(next)
      }
    }

    const applyDigits = (raw: string, startIndex = 0) => {
      const incoming = normalizeDigits(raw, length)
      if (!incoming) return

      const nextCells = [...cells]
      let cursor = startIndex
      for (const digit of incoming) {
        if (cursor >= length) break
        nextCells[cursor] = digit
        cursor += 1
      }
      emitChange(nextCells)
      focusCell(Math.min(cursor, length - 1))
    }

    const handleCellChange = (index: number, nextValue: string) => {
      const digit = normalizeDigits(nextValue, 1)
      const nextCells = [...cells]

      if (!digit) {
        nextCells[index] = ''
        emitChange(nextCells)
        return
      }

      nextCells[index] = digit[0] ?? ''
      emitChange(nextCells)

      if (index < length - 1) {
        focusCell(index + 1)
      }
    }

    const handleKeyDown = (
      index: number,
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        const current = cellsToDigits(cells)
        if (current.length === length) {
          onEnter?.(current)
        }
        return
      }

      if (event.key === 'Backspace' && !cells[index] && index > 0) {
        event.preventDefault()
        const nextCells = [...cells]
        nextCells[index - 1] = ''
        emitChange(nextCells)
        focusCell(index - 1)
        return
      }

      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault()
        focusCell(index - 1)
        return
      }

      if (event.key === 'ArrowRight' && index < length - 1) {
        event.preventDefault()
        focusCell(index + 1)
      }
    }

    const handlePaste = (
      index: number,
      event: React.ClipboardEvent<HTMLInputElement>,
    ) => {
      const pasted = event.clipboardData.getData('text')
      if (!normalizeDigits(pasted, length)) return
      event.preventDefault()
      applyDigits(pasted, index)
    }

    const didAutoFocusRef = React.useRef(false)

    const onContainerRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
        if (!node || didAutoFocusRef.current || !autoFocus || isDisabled) return
        didAutoFocusRef.current = true
        const first = inputRefs.current[0]
        if (first) {
          first.focus()
          first.select()
        }
      },
      [autoFocus, isDisabled, ref],
    )

    const renderCell = (index: number) => (
      <ChakraInput
        key={index}
        ref={(el) => {
          inputRefs.current[index] = el
        }}
        value={cells[index]}
        onChange={(event) => handleCellChange(index, event.target.value)}
        onKeyDown={(event) => handleKeyDown(index, event)}
        onPaste={(event) => handlePaste(index, event)}
        onFocus={(event) => event.currentTarget.select()}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete={index === 0 ? 'one-time-code' : 'off'}
        maxLength={1}
        disabled={isDisabled}
        aria-label={`Digit ${index + 1} of ${length}`}
        {...cellStyles}
        {...formControlInvalidFieldProps(invalid)}
      />
    )

    return (
      <Box
        ref={onContainerRef}
        w="full"
        id={id}
        aria-describedby={controlProps['aria-describedby']}
        aria-invalid={controlProps['aria-invalid']}
      >
        <HStack gap={2} justify="center" w="full">
          {firstGroup.map(renderCell)}
          {length > 3 ? (
            <Text color="formLabelMuted" fontWeight={600} px={1} aria-hidden>
              –
            </Text>
          ) : null}
          {secondGroup.map(renderCell)}
        </HStack>
      </Box>
    )
  },
)

OtpInput.displayName = 'OtpInput'
