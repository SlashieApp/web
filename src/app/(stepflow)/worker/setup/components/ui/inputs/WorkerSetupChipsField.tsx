'use client'

import { Box, HStack, Text, Wrap, chakra } from '@chakra-ui/react'
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
      <Box w="full">
        {value.length > 0 ? (
          <Wrap gap={2} pb={3}>
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

        <HStack gap={2} align="stretch">
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
            onClick={commitDraft}
            disabled={atCap || !draft.trim()}
            minH="44px"
            flexShrink={0}
          >
            {copy.add}
          </Button>
        </HStack>

        <Box aria-live="polite">
          {droppedText ? (
            <Text fontSize="sm" color="status.danger.fg" pt={2} px={1}>
              {droppedText}
            </Text>
          ) : null}
        </Box>

        {countText ? (
          <Text fontSize="xs" color="text.muted" pt={2} px={1}>
            {countText}
          </Text>
        ) : null}

        {remaining.length > 0 && !atCap ? (
          <Box pt={3}>
            {suggestionsLabel ? (
              <Text fontSize="xs" fontWeight={500} color="text.muted" pb={2}>
                {suggestionsLabel}
              </Text>
            ) : null}
            <Wrap gap={2}>
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
          </Box>
        ) : null}
      </Box>
    </FormField>
  )
}
