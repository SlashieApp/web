'use client'

import { Box, HStack, Text, Wrap, chakra } from '@chakra-ui/react'
import { useState } from 'react'
import { LuPlus, LuX } from 'react-icons/lu'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'
import { Button, FormField, Input, formControlRootProps } from '@ui'

import {
  SKILLS_MAX,
  SKILLS_MIN,
  SUGGESTED_SKILLS,
  addSkills,
  removeSkill,
} from '../../helpers/workerSetupSkills'

export type WorkerSetupSkillsInputProps = {
  value: string[]
  onChange: (skills: string[]) => void
  /** Suggested chips; seeded from the primary category when one is chosen. */
  suggestions?: readonly string[]
  errorText?: string
}

const chipTransition = {
  transitionProperty: 'background-color, border-color, color',
  transitionDuration: sdlMotion.duration.base,
  transitionTimingFunction: sdlMotion.easing.standard,
} as const

/** Real <button> so `type="button"` and keyboard semantics are native. */
const ChipButton = chakra('button')

/**
 * Structured skills picker: suggested chips + add-your-own, min 3 / max 12.
 * Emits the same `string[]` shape as the existing `skills` payload.
 */
export function WorkerSetupSkillsInput({
  value,
  onChange,
  suggestions = SUGGESTED_SKILLS,
  errorText,
}: WorkerSetupSkillsInputProps) {
  const [draft, setDraft] = useState('')

  const atCap = value.length >= SKILLS_MAX
  const selectedKeys = new Set(value.map((s) => s.toLowerCase()))
  const remainingSuggestions = suggestions.filter(
    (s) => !selectedKeys.has(s.toLowerCase()),
  )

  const commitDraft = () => {
    if (!draft.trim()) return
    onChange(addSkills(value, draft))
    setDraft('')
  }

  return (
    <FormField
      label="Skills & services"
      helperText={`Pick at least ${SKILLS_MIN} so customers can find you for the right tasks.`}
      errorText={errorText}
    >
      <Box w="full">
        {value.length > 0 ? (
          <Wrap gap={1.5} pb={3}>
            {value.map((skill) => (
              <HStack
                key={skill}
                as="span"
                gap={1}
                pl={3}
                pr={1.5}
                h={9}
                borderRadius="full"
                bg="status.success.soft"
                color="status.success.fg"
                fontSize="sm"
                fontWeight={600}
              >
                <Text as="span">{skill}</Text>
                <ChipButton
                  type="button"
                  aria-label={`Remove ${skill}`}
                  onClick={() => onChange(removeSkill(value, skill))}
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize="24px"
                  borderRadius="full"
                  cursor="pointer"
                  color="status.success.fg"
                  _hover={{ bg: 'bg.surface' }}
                  _focusVisible={sdlFocusRing}
                  {...chipTransition}
                >
                  <LuX size={13} strokeWidth={2.5} aria-hidden />
                </ChipButton>
              </HStack>
            ))}
          </Wrap>
        ) : null}

        <HStack gap={2} align="stretch">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              e.preventDefault()
              commitDraft()
            }}
            placeholder="e.g. Boiler servicing"
            disabled={atCap}
            rootProps={{ ...formControlRootProps, flex: 1 }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={commitDraft}
            disabled={atCap || !draft.trim()}
            flexShrink={0}
          >
            Add
          </Button>
        </HStack>

        <Text fontSize="xs" color="text.muted" pt={2}>
          {value.length} / {SKILLS_MAX} · minimum {SKILLS_MIN}
        </Text>

        {remainingSuggestions.length > 0 && !atCap ? (
          <Box pt={3}>
            <Text fontSize="xs" fontWeight={600} color="text.muted" pb={1.5}>
              Suggestions
            </Text>
            <Wrap gap={1.5}>
              {remainingSuggestions.map((skill) => (
                <ChipButton
                  key={skill}
                  type="button"
                  aria-label={`Add ${skill}`}
                  onClick={() => onChange(addSkills(value, skill))}
                  display="inline-flex"
                  alignItems="center"
                  gap={1}
                  px={3}
                  h={9}
                  borderRadius="full"
                  borderWidth="1px"
                  borderColor="border.default"
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
                  {skill}
                </ChipButton>
              ))}
            </Wrap>
          </Box>
        ) : null}
      </Box>
    </FormField>
  )
}
