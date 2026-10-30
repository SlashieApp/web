'use client'

import {
  Box,
  Input as ChakraInput,
  HStack,
  type SystemStyleObject,
  Text,
} from '@chakra-ui/react'
import * as React from 'react'

import { formControlFieldInteraction, sdlMotion } from '@/theme/styles'
import {
  formControlInvalidFieldProps,
  useFormFieldControlProps,
} from '../FormField/formFieldContext'

export type OtpInputSize = 'md' | 'lg'

export type OtpInputProps = {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  autoFocus?: boolean
  /**
   * Cell size. `md` is up to 44 wide and the form control height (48) tall, like
   * every field in a form (default); `lg` is up to 52 wide, for hero /
   * single-field verification screens. Defaults to `md`. The cells are that wide
   * when the row has room and shrink together, never past their container, when
   * it does not (a dialog on a 320 phone).
   */
  size?: OtpInputSize
  /** Fires when Enter is pressed and all digits are filled. */
  onEnter?: (value: string) => void
  /** Fires when the last digit is entered. */
  onComplete?: (value: string) => void
  /** Names the group of cells, when no visible label does (the dialog's lead-in). */
  'aria-label'?: string
  /** The id of the element that names the group. */
  'aria-labelledby'?: string
  /**
   * Marks every cell invalid (the red border, `aria-invalid`), for a code that
   * is not in a `FormField`. Inside one, the field's error does it.
   */
  invalid?: boolean
  /**
   * The ids of the text that describes the group (its help line and its
   * error), when it is not in a `FormField`. Joined with the field's own.
   */
  'aria-describedby'?: string
}

/**
 * Per-cell sizes. Both are 44 wide or more where the row has room, so the field
 * is comfortable on mobile; `md` is as tall as the other fields in a form
 * (`formSpace.controlHeight`, 48); `lg` is reserved for prominent verification
 * screens. The width is a ceiling, not a fixed size: the cells share the row
 * (`flex: 1 1 0`, `minW: 0`) and stop at `maxW`, so on a row too narrow for
 * six of them (320 wide: a dialog has 248) they get the largest width that fits
 * instead of running out of the container.
 */
const cellSizes: Record<OtpInputSize, SystemStyleObject> = {
  md: {
    flex: '1 1 0',
    minW: 0,
    maxW: '44px',
    h: 'form.controlHeight',
    fontSize: 'lg',
  },
  lg: {
    flex: '1 1 0',
    minW: 0,
    maxW: '52px',
    h: '56px',
    fontSize: 'xl',
  },
}

/**
 * Shared cell shell. `formControlFieldInteraction` supplies the SDL green
 * `_focusVisible` ring (`border.focus`) + hover treatment + `sdlMotion`
 * transition, so each cell shows a visible keyboard focus ring.
 */
const cellStyles: SystemStyleObject = {
  ...formControlFieldInteraction,
  textAlign: 'center',
  // A code: Geist Mono at 500.
  fontFamily: 'mono',
  fontWeight: 500,
  borderRadius: 'md',
  borderWidth: '1px',
  borderColor: 'border.strong',
  bg: 'bg.surface',
  color: 'text.default',
  px: 0,
  transitionTimingFunction: sdlMotion.easing.standard,
  _disabled: {
    bg: 'bg.subtle',
    color: 'text.subtle',
    borderColor: 'border.default',
    cursor: 'not-allowed',
    opacity: 1,
  },
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
 *
 * SDL: cells reference semantic roles only (`bg.surface`, `text.default`,
 * `border.default`); the green keyboard focus ring + transition come from
 * `formControlFieldInteraction`. The cells are a `role="group"` (named by
 * `aria-label` or `aria-labelledby`), so the field's helper and error are its
 * description; an error (the field's, or `invalid`) marks every cell
 * `aria-invalid` (a group cannot be).
 * Each cell carries an explicit `aria-label`.
 */
export const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  function OtpInput(
    {
      value,
      onChange,
      length = 6,
      disabled = false,
      autoFocus = true,
      size = 'md',
      onEnter,
      onComplete,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      invalid: invalidProp,
      'aria-describedby': ariaDescribedBy,
    },
    ref,
  ) {
    const {
      invalid: fieldInvalid,
      id,
      ...controlProps
    } = useFormFieldControlProps({
      disabled,
      'aria-describedby': ariaDescribedBy,
    })
    const invalid = invalidProp ?? fieldInvalid
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
        aria-invalid={invalid ? true : undefined}
        {...cellStyles}
        {...cellSizes[size]}
        {...formControlInvalidFieldProps(invalid)}
      />
    )

    return (
      <Box
        ref={onContainerRef}
        // The padding leaves room for the focus ring; the negative margin takes
        // it back out of the layout, so the gaps around the cells are measured
        // from the cells' own edges, as the form spacing says.
        p={2}
        m={-2}
        id={id}
        // biome-ignore lint/a11y/useSemanticElements: a fieldset's own layout (min-width, no flex) fights the padded, negative-margin box that holds the focus rings
        role="group"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={controlProps['aria-describedby']}
      >
        {/* Gaps of 4 below `sm` (480): they and the dash take less of a narrow
            row, so the cells are 44 wide down to a 370 phone. From `sm` the
            dialog is wide enough for 8. */}
        <HStack gap={{ base: 1, sm: 2 }} justify="center" w="full">
          {firstGroup.map(renderCell)}
          {length > 3 ? (
            <Text
              color="text.muted"
              fontWeight={500}
              px={{ base: 0, sm: 1 }}
              flexShrink={0}
              aria-hidden
            >
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
