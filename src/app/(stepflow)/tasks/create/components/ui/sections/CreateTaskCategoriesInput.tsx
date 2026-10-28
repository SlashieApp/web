'use client'

import { useQuery } from '@apollo/client/react'
import { Box, HStack, Text, Wrap, chakra } from '@chakra-ui/react'
import type { PopularTaskCategoriesQuery } from '@codegen/schema'
import { useState } from 'react'
import { LuPlus, LuX } from 'react-icons/lu'

import {
  TASK_CATEGORIES_MAX,
  TASK_CATEGORY_MAX_CHARS,
  addTaskCategories,
  suggestedTaskCategories,
  taskCategoryDisplayLabel,
} from '@/app/(task)/helpers/taskCategories'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing, sdlMotion } from '@/theme/styles'
import { Button, FormField, Input, formControlRootProps } from '@ui'

import PopularTaskCategories from '../../../graphql/PopularTaskCategories.gql'
import { taskFieldError } from '../../../helpers/taskFieldError'
import bag from '../../../i11n.json'

export type CreateTaskCategoriesInputProps = {
  value: string[]
  onChange: (categories: string[]) => void
  errorText?: string
}

const chipTransition = {
  transitionProperty: 'background-color, border-color, color',
  transitionDuration: sdlMotion.duration.base,
  transitionTimingFunction: sdlMotion.easing.standard,
} as const

const ChipButton = chakra('button')

/** `addTaskCategories` limits → copy keys in `errors`. */
const LIMIT_ERROR = {
  tooMany: 'tooManyCategories',
  tooLong: 'categoryTooLong',
} as const

/**
 * Task categories as tags (FE-211, BE-79): suggested keywords to tap, or
 * type your own (Enter, comma or Add). 1 to 10, each up to 64 characters.
 */
export function CreateTaskCategoriesInput({
  value,
  onChange,
  errorText,
}: CreateTaskCategoriesInputProps) {
  const t = useI11n(bag)
  const f = t.fields
  const [draft, setDraft] = useState('')
  const [limitError, setLimitError] = useState<keyof typeof LIMIT_ERROR | null>(
    null,
  )
  const { data } = useQuery<PopularTaskCategoriesQuery>(PopularTaskCategories, {
    variables: { first: 12 },
    fetchPolicy: 'cache-first',
  })

  const atCap = value.length >= TASK_CATEGORIES_MAX
  const suggestions = atCap
    ? []
    : suggestedTaskCategories(data?.popularTaskCategories ?? [], value)

  const add = (raw: string) => {
    const result = addTaskCategories(value, raw)
    setLimitError(result.error ?? null)
    if (result.categories.length !== value.length) onChange(result.categories)
    return !result.error
  }

  const commitDraft = () => {
    if (!draft.trim()) return
    if (add(draft)) setDraft('')
  }

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
      <Box w="full">
        {value.length > 0 ? (
          <Wrap gap={1.5} pb={3}>
            {value.map((category) => (
              <HStack
                key={category.toLowerCase()}
                as="span"
                gap={0}
                pl={3}
                minH="44px"
                borderRadius="full"
                bg="status.success.soft"
                color="status.success.fg"
                fontSize="sm"
                fontWeight={500}
              >
                <Text as="span">
                  {taskCategoryDisplayLabel(category) ?? category}
                </Text>
                <ChipButton
                  type="button"
                  aria-label={formatMessage(f.removeCategory, { category })}
                  onClick={() => {
                    setLimitError(null)
                    onChange(value.filter((c) => c !== category))
                  }}
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize="44px"
                  borderRadius="full"
                  cursor="pointer"
                  color="status.success.fg"
                  _hover={{ bg: 'bg.surface' }}
                  _focusVisible={sdlFocusRing}
                  {...chipTransition}
                >
                  <LuX size={14} strokeWidth={2.5} aria-hidden />
                </ChipButton>
              </HStack>
            ))}
          </Wrap>
        ) : null}

        <HStack gap={2} align="stretch">
          <Input
            value={draft}
            maxLength={TASK_CATEGORY_MAX_CHARS * 2}
            onChange={(e) => {
              const next = e.target.value
              // A comma finishes a tag, like the Enter key.
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
            // A half-typed category is kept, not dropped on Continue.
            onBlur={commitDraft}
            placeholder={f.categoryPlaceholder}
            disabled={atCap}
            aria-label={f.categoryInputLabel}
            rootProps={{ ...formControlRootProps, flex: 1 }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={commitDraft}
            disabled={atCap || !draft.trim()}
            flexShrink={0}
          >
            {f.addCategory}
          </Button>
        </HStack>

        {suggestions.length > 0 ? (
          <Box pt={3}>
            <Text fontSize="xs" fontWeight={500} color="text.muted" pb={1.5}>
              {f.suggestions}
            </Text>
            <Wrap gap={1.5}>
              {suggestions.map((category) => (
                <ChipButton
                  key={category.toLowerCase()}
                  type="button"
                  aria-label={formatMessage(f.suggestCategory, { category })}
                  onClick={() => add(category)}
                  display="inline-flex"
                  alignItems="center"
                  gap={1}
                  px={3}
                  minH="44px"
                  borderRadius="full"
                  borderWidth="1px"
                  borderColor="border.strong"
                  bg="bg.surface"
                  color="text.muted"
                  fontSize="sm"
                  fontWeight={500}
                  cursor="pointer"
                  _hover={{
                    bg: 'status.success.soft',
                    borderColor: 'status.success.border',
                    color: 'status.success.fg',
                  }}
                  _focusVisible={sdlFocusRing}
                  {...chipTransition}
                >
                  <LuPlus size={13} strokeWidth={2.5} aria-hidden />
                  {category}
                </ChipButton>
              ))}
            </Wrap>
          </Box>
        ) : null}
      </Box>
    </FormField>
  )
}
