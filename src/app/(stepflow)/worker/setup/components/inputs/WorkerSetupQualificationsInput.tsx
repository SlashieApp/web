'use client'

import { Box, HStack, Text, Wrap, chakra } from '@chakra-ui/react'
import { useState } from 'react'
import { LuPlus, LuX } from 'react-icons/lu'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'
import { Button, FormField, Input, formControlRootProps } from '@ui'

import {
  QUALIFICATIONS_MAX,
  SUGGESTED_QUALIFICATIONS,
  addQualifications,
} from '../../helpers/workerSetupQualifications'
import { WorkerSetupOptionalLabel } from '../shared/WorkerSetupOptionalBadge'

const chipTransition = {
  transitionProperty: 'background-color, border-color, color',
  transitionDuration: sdlMotion.duration.base,
  transitionTimingFunction: sdlMotion.easing.standard,
} as const

const ChipButton = chakra('button')

export type WorkerSetupQualificationsInputProps = {
  value: string[]
  onChange: (qualifications: string[]) => void
}

/**
 * Optional qualification/certification chips (ticket 1.5), persisted to the
 * `qualifications` string[] payload on the experience sub-step.
 */
export function WorkerSetupQualificationsInput({
  value,
  onChange,
}: WorkerSetupQualificationsInputProps) {
  const [draft, setDraft] = useState('')

  const atCap = value.length >= QUALIFICATIONS_MAX
  const selectedKeys = new Set(value.map((q) => q.toLowerCase()))
  const remainingSuggestions = SUGGESTED_QUALIFICATIONS.filter(
    (q) => !selectedKeys.has(q.toLowerCase()),
  )

  const commitDraft = () => {
    if (!draft.trim()) return
    onChange(addQualifications(value, draft))
    setDraft('')
  }

  return (
    <FormField
      label={
        <WorkerSetupOptionalLabel>
          Qualifications & certifications
        </WorkerSetupOptionalLabel>
      }
      helperText="Accreditations customers recognise build trust — they appear on your public profile."
    >
      <Box w="full">
        {value.length > 0 ? (
          <Wrap gap={1.5} pb={3}>
            {value.map((qualification) => (
              <HStack
                key={qualification}
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
                <Text as="span">{qualification}</Text>
                <ChipButton
                  type="button"
                  aria-label={`Remove ${qualification}`}
                  onClick={() =>
                    onChange(value.filter((q) => q !== qualification))
                  }
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
            placeholder="e.g. City & Guilds Level 2"
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

        {remainingSuggestions.length > 0 && !atCap ? (
          <Wrap gap={1.5} pt={3}>
            {remainingSuggestions.map((qualification) => (
              <ChipButton
                key={qualification}
                type="button"
                aria-label={`Add ${qualification}`}
                onClick={() =>
                  onChange(addQualifications(value, qualification))
                }
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
                {qualification}
              </ChipButton>
            ))}
          </Wrap>
        ) : null}
      </Box>
    </FormField>
  )
}
