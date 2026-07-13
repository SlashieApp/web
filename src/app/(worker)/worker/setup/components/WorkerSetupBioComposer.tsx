'use client'

import { Box, HStack, Stack, Text, Wrap, chakra } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { LuChevronDown, LuChevronUp, LuPlus } from 'react-icons/lu'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'
import { FormField, ProgressBar, Textarea, formControlTextareaProps } from '@ui'

import { BIO_MAX_CHARS, BIO_MIN_CHARS } from '../helpers/workerSetupValidation'

const PROMPT_STARTERS = [
  'The work I do best is ',
  'Customers choose me because ',
  'Tools and qualifications: ',
] as const

const EXAMPLE_BIO =
  'I fit and repair kitchens and bathrooms across North London, with 8 years ' +
  'on the tools. Customers choose me for tidy work, honest quotes and turning ' +
  'up when I say I will. Fully insured, City & Guilds qualified.'

const CHIP_BUTTON_STYLES = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1,
  px: 3,
  h: 9,
  borderRadius: 'full',
  borderWidth: '1px',
  borderColor: 'border.default',
  bg: 'bg.surface',
  color: 'text.muted',
  fontSize: 'sm',
  fontWeight: 500,
  cursor: 'pointer',
  transitionProperty: 'background-color, border-color, color',
  transitionDuration: sdlMotion.duration.base,
  transitionTimingFunction: sdlMotion.easing.standard,
  _hover: {
    bg: 'status.success.soft',
    borderColor: 'status.success.border',
    color: 'status.success.fg',
  },
  _focusVisible: sdlFocusRing,
} as const

const ChipButton = chakra('button')

type BioQuality = {
  label: string
  tone: 'danger' | 'warning' | 'success'
  percent: number
}

/** Ticket 1.3 thresholds: <80 too short, 80–160 good, 160–300 great. */
function bioQuality(length: number): BioQuality {
  const percent = Math.min(100, Math.round((length / 160) * 100))
  if (length < BIO_MIN_CHARS) {
    return { label: 'Too short to build trust', tone: 'warning', percent }
  }
  if (length < 160) return { label: 'Good', tone: 'success', percent }
  return { label: 'Great', tone: 'success', percent: 100 }
}

export type WorkerSetupBioComposerProps = {
  value: string
  onChange: (bio: string) => void
  errorText?: string
}

/** Guided bio composer: prompt-starter chips, quality meter, example bio. */
export function WorkerSetupBioComposer({
  value,
  onChange,
  errorText,
}: WorkerSetupBioComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [exampleOpen, setExampleOpen] = useState(false)

  const quality = bioQuality(value.trim().length)

  const insertStarter = (starter: string) => {
    const current = value.trimEnd()
    const next = current ? `${current}\n${starter}` : starter
    if (next.length > BIO_MAX_CHARS) return
    onChange(next)
    textareaRef.current?.focus()
  }

  return (
    <FormField
      label="Short bio"
      helperText="Customers read this before accepting your quote."
      errorText={errorText}
    >
      <Stack gap={2.5} w="full">
        <Wrap gap={1.5}>
          {PROMPT_STARTERS.map((starter) => (
            <ChipButton
              key={starter}
              type="button"
              aria-label={`Insert "${starter.trim()}"`}
              onClick={() => insertStarter(starter)}
              {...CHIP_BUTTON_STYLES}
            >
              <LuPlus size={13} strokeWidth={2.5} aria-hidden />
              {starter.trim().replace(/[:]$/, '')}…
            </ChipButton>
          ))}
        </Wrap>

        <Box position="relative" w="full">
          <Textarea
            ref={textareaRef}
            value={value}
            maxLength={BIO_MAX_CHARS}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Two or three sentences about the work you do best and why customers choose you."
            rows={6}
            pb={10}
            {...formControlTextareaProps}
          />
          <Text
            position="absolute"
            bottom={3}
            right={4}
            fontSize="xs"
            color="text.muted"
            pointerEvents="none"
            aria-hidden
          >
            {value.length} / {BIO_MAX_CHARS}
          </Text>
        </Box>

        <HStack gap={3} align="center">
          <Box flex={1}>
            <ProgressBar
              value={quality.percent}
              tone={quality.tone}
              size="sm"
              trackLabel="Bio quality"
            />
          </Box>
          <Text
            fontSize="xs"
            fontWeight={600}
            color={
              quality.tone === 'success' ? 'status.success.fg' : 'text.muted'
            }
            flexShrink={0}
          >
            {quality.label}
          </Text>
        </HStack>

        <Box>
          <ChipButton
            type="button"
            onClick={() => setExampleOpen((open) => !open)}
            aria-expanded={exampleOpen}
            display="inline-flex"
            alignItems="center"
            gap={1}
            fontSize="sm"
            fontWeight={600}
            color="text.link"
            bg="transparent"
            cursor="pointer"
            _focusVisible={sdlFocusRing}
          >
            {exampleOpen ? 'Hide example' : 'See an example bio'}
            {exampleOpen ? (
              <LuChevronUp size={14} aria-hidden />
            ) : (
              <LuChevronDown size={14} aria-hidden />
            )}
          </ChipButton>
          {exampleOpen ? (
            <Box
              mt={2}
              p={3.5}
              borderRadius="lg"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.default"
            >
              <Text fontSize="sm" color="text.muted" lineHeight="tall">
                {EXAMPLE_BIO}
              </Text>
            </Box>
          ) : null}
        </Box>
      </Stack>
    </FormField>
  )
}
