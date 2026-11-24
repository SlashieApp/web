'use client'

import { useQuery } from '@apollo/client/react'
import { Stack, Wrap } from '@chakra-ui/react'
import type { PopularTaskCategoriesQuery } from '@codegen/schema'
import { useEffect, useRef, useState } from 'react'

import {
  TASK_CATEGORIES_MAX,
  TASK_CATEGORY_MAX_CHARS,
  addTaskCategories,
  taskCategoryPins,
} from '@/app/(task)/helpers/taskCategories'
import { useI11n } from '@/i18n/useI11n'
import { ChoiceChip, FormField, Input, Reveal, formControlRootProps } from '@ui'

import PopularTaskCategories from '../../../graphql/PopularTaskCategories.gql'
import { taskFieldError } from '../../../helpers/taskFieldError'
import bag from '../../../i11n.json'

export type CreateTaskCategoriesInputProps = {
  value: string[]
  onChange: (categories: string[]) => void
  errorText?: string
}

/** `addTaskCategories` limits → copy keys in `errors`. */
const LIMIT_ERROR = {
  tooMany: 'tooManyCategories',
  tooLong: 'categoryTooLong',
} as const

function sameCategory(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase()
}

/**
 * Task categories as thin pins (FE-211, BE-79): the suggestions first, each
 * one a toggle, then any the poster typed, then Others. Others is not a
 * category. It is the same pin, and it opens the field. 1 to 10, each up to
 * 64 characters. The pins are the budget section's `ChoiceChip`.
 */
export function CreateTaskCategoriesInput({
  value,
  onChange,
  errorText,
}: CreateTaskCategoriesInputProps) {
  const t = useI11n(bag)
  const f = t.fields
  const [draft, setDraft] = useState('')
  const [othersOn, setOthersOn] = useState(false)
  const [limitError, setLimitError] = useState<keyof typeof LIMIT_ERROR | null>(
    null,
  )
  const inputRef = useRef<HTMLInputElement | null>(null)
  const focusInput = useRef(false)
  const { data } = useQuery<PopularTaskCategoriesQuery>(PopularTaskCategories, {
    variables: { first: 12 },
    fetchPolicy: 'cache-first',
  })

  const atCap = value.length >= TASK_CATEGORIES_MAX
  const { suggestions, custom } = taskCategoryPins(
    data?.popularTaskCategories ?? [],
    value,
  )
  const chosen = (category: string) =>
    value.some((c) => sameCategory(c, category))

  const add = (raw: string) => {
    const result = addTaskCategories(value, raw)
    setLimitError(result.error ?? null)
    if (result.categories.length !== value.length) onChange(result.categories)
    return !result.error
  }

  const toggleSuggestion = (category: string) => {
    setLimitError(null)
    if (chosen(category)) {
      onChange(value.filter((c) => !sameCategory(c, category)))
      return
    }
    add(category)
  }

  const commitDraft = () => {
    if (!draft.trim()) return
    if (add(draft)) setDraft('')
  }

  useEffect(() => {
    if (!othersOn || !focusInput.current) return
    focusInput.current = false
    inputRef.current?.focus()
  })

  return (
    <FormField
      label={f.categories}
      required
      helperText={f.categoriesHelper}
      errorText={taskFieldError(
        t.errors,
        limitError ? LIMIT_ERROR[limitError] : errorText,
      )}
    >
      <Stack gap={0} w="full">
        <Wrap gap="form.alternativesGap">
          {suggestions.map((category) => (
            <ChoiceChip
              key={category.toLowerCase()}
              selected={chosen(category)}
              disabled={atCap && !chosen(category)}
              onSelect={() => toggleSuggestion(category)}
            >
              {category}
            </ChoiceChip>
          ))}
          {custom.map((category) => (
            <ChoiceChip
              key={category.toLowerCase()}
              selected
              onSelect={() => {
                setLimitError(null)
                onChange(value.filter((c) => !sameCategory(c, category)))
              }}
            >
              {category}
            </ChoiceChip>
          ))}
          <ChoiceChip
            selected={othersOn}
            disabled={atCap}
            onSelect={(byPointer) => {
              if (byPointer) focusInput.current = true
              setOthersOn((on) => !on)
            }}
          >
            {f.categoriesOther}
          </ChoiceChip>
        </Wrap>
        <Reveal open={othersOn} spaceAbove="form.labelToControl">
          <Input
            ref={inputRef}
            value={draft}
            maxLength={TASK_CATEGORY_MAX_CHARS * 2}
            onChange={(e) => {
              const next = e.target.value
              if (next.endsWith(',')) {
                if (add(next)) setDraft('')
                else setDraft(next.slice(0, -1))
                return
              }
              setDraft(next)
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              e.preventDefault()
              commitDraft()
            }}
            onBlur={commitDraft}
            placeholder={f.categoryPlaceholder}
            disabled={atCap}
            aria-label={f.categoryInputLabel}
            rootProps={{ ...formControlRootProps, maxW: { md: '360px' } }}
          />
        </Reveal>
      </Stack>
    </FormField>
  )
}
