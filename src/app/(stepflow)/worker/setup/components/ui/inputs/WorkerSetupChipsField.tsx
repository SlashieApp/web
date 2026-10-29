'use client'

import { Box, HStack, Stack, Text, Wrap, chakra } from '@chakra-ui/react'
import { type ReactNode, useState } from 'react'
import { LuPlus, LuX } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { sdlFocusRing, sdlMotion } from '@/theme/styles'
import { Button, FormField, Input, formControlRootProps } from '@ui'

import {
  type ChipDrop,
  type ChipRules,
  addChips,
} from '../../../helpers/workerSetupChips'

/** Copy for one chip list (setup bag `skills` or `qualifications`). */
export type ChipsFieldCopy = {
  placeholder: string
  add: string
  addItem: string
  removeItem: string
  tooShort: string
  tooLong: string
  duplicate: string
  full: string
}

export type WorkerSetupChipsFieldProps = {
  label: ReactNode
  helperText?: string
  errorText?: string
  value: string[]
  onChange: (items: string[]) => void
  rules: ChipRules
  suggestions: readonly string[]
  /** Heading above the suggestions, if any. */
  suggestionsLabel?: string
  /** e.g. "3 of 12 · at least 3". */
  countText?: string
  copy: ChipsFieldCopy
}

const ChipButton = chakra('button')

const chipStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1.5,
  px: 3.5,
  minH: '44px',
  borderRadius: 'full',
  fontSize: 'sm',
  cursor: 'pointer',
  transitionProperty: 'background-color, border-color, color',
  transitionDuration: sdlMotion.duration.base,
  transitionTimingFunction: sdlMotion.easing.standard,
  _focusVisible: sdlFocusRing,
} as const

/**
 * A chip list: chosen chips (tap one to remove it), add-your-own and
 * suggestions. Says why a typed chip was turned away.
 *
 * Form spacing (FE-481): one composite field. Its pieces (the chosen chips, the
 * add row, the suggestions) are `labelToControl` (8) apart, chips wrap 8 apart,
 * the input and Add sit `inlineGap` (12) apart and are 48 tall, the refused-chip
 * error and the count are `controlToHelper` (4) under the add row, and the
 * suggestions' heading is 8 above them.
 */
export function WorkerSetupChipsField({
  label,
  helperText,
  errorText,
  value,
  onChange,
  rules,
  suggestions,
  suggestionsLabel,
  countText,
  copy,
}: WorkerSetupChipsFieldProps) {
  const [draft, setDraft] = useState('')
  const [dropped, setDropped] = useState<ChipDrop | null>(null)

  const atCap = value.length >= rules.max
  const chosen = new Set(value.map((item) => item.toLowerCase()))
  const remaining = suggestions.filter(
    (item) => !chosen.has(item.toLowerCase()),
  )

  const add = (raw: string) => {
    const result = addChips(value, raw, rules)
    if (result.items.length !== value.length) onChange(result.items)
    setDropped(result.dropped)
    return result
  }

  const commitDraft = () => {
    if (!draft.trim()) return
    const result = add(draft)
    // A single refused entry stays in the box so it can be fixed.
    if (!result.dropped || result.items.length !== value.length) setDraft('')
  }

  const droppedText = dropped
    ? formatMessage(copy[dropped.reason], {
        text: dropped.text,
        min: rules.minChars,
        max: dropped.reason === 'full' ? rules.max : rules.maxChars,
      })
    : null

  return (
    <FormField label={label} helperText={helperText} errorText={errorText}>
      <Stack gap="form.labelToControl" w="full">
        {value.length > 0 ? (
          <Wrap gap="form.alternativesGap">
            {value.map((item) => (
              <ChipButton
                key={item}
                type="button"
                aria-label={formatMessage(copy.removeItem, { item })}
                onClick={() => onChange(value.filter((v) => v !== item))}
                {...chipStyles}
                pr={3}
                bg="status.success.soft"
                color="status.success.fg"
                fontWeight={500}
                _hover={{ bg: 'status.success.border' }}
              >
                {item}
                <LuX size={14} strokeWidth={2.5} aria-hidden />
              </ChipButton>
            ))}
          </Wrap>
        ) : null}

        {/* The add row, with what it says about the entry under it. Each line
            is `controlToHelper` (4) under the one above by its own margin: the
            live region below is always in the page and takes no gap while it
            is empty. */}
        <Stack gap={0}>
          <HStack gap="form.inlineGap" align="stretch">
            <Input
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                setDropped(null)
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                e.preventDefault()
                commitDraft()
              }}
              placeholder={copy.placeholder}
              disabled={atCap}
              rootProps={{ ...formControlRootProps, flex: 1 }}
            />
            <Button
              type="button"
              variant="secondary"
              size="form"
              onClick={commitDraft}
              disabled={atCap || !draft.trim()}
              flexShrink={0}
            >
              {copy.add}
            </Button>
          </HStack>

          {/* Always in the page, so a refused chip is announced. */}
          <Box aria-live="polite">
            {droppedText ? (
              <Text
                mt="form.controlToHelper"
                fontSize="sm"
                lineHeight="20px"
                color="status.danger.fg"
                px={1}
              >
                {droppedText}
              </Text>
            ) : null}
          </Box>

          {countText ? (
            <Text
              mt="form.controlToHelper"
              fontSize="xs"
              lineHeight="16px"
              color="text.muted"
              px={1}
            >
              {countText}
            </Text>
          ) : null}
        </Stack>

        {remaining.length > 0 && !atCap ? (
          <Stack gap="form.labelToControl">
            {suggestionsLabel ? (
              <Text fontSize="xs" fontWeight={500} color="text.muted">
                {suggestionsLabel}
              </Text>
            ) : null}
            <Wrap gap="form.alternativesGap">
              {remaining.map((item) => (
                <ChipButton
                  key={item}
                  type="button"
                  aria-label={formatMessage(copy.addItem, { item })}
                  onClick={() => add(item)}
                  {...chipStyles}
                  pl={3}
                  borderWidth="1px"
                  borderColor="border.strong"
                  bg="bg.surface"
                  color="text.muted"
                  fontWeight={500}
                  _hover={{
                    bg: 'bg.subtle',
                    borderColor: 'border.hover',
                    color: 'text.default',
                  }}
                >
                  <LuPlus size={14} strokeWidth={2.5} aria-hidden />
                  {item}
                </ChipButton>
              ))}
            </Wrap>
          </Stack>
        ) : null}
      </Stack>
    </FormField>
  )
}
