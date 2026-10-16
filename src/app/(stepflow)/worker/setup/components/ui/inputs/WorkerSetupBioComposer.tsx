'use client'

import { Box, HStack, Stack, Text, Wrap, chakra } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import { LuChevronDown, LuChevronUp, LuPlus } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing, sdlMotion } from '@/theme/styles'
import { FormField, ProgressBar, Textarea, formControlTextareaProps } from '@ui'

import {
  BIO_MAX_CHARS,
  BIO_MIN_CHARS,
  textWeight,
} from '../../../helpers/workerSetupValidation'
import bag from '../../../i11n.json'

const ChipButton = chakra('button')

/** Under the minimum: too short; to 160: good; past that: great. */
function bioQuality(weight: number) {
  const percent = Math.min(100, Math.round((weight / 160) * 100))
  if (weight < BIO_MIN_CHARS)
    return { key: 'tooShort', tone: 'warning', percent } as const
  if (weight < 160) return { key: 'good', tone: 'success', percent } as const
  return { key: 'great', tone: 'success', percent: 100 } as const
}

export type WorkerSetupBioComposerProps = {
  value: string
  onChange: (bio: string) => void
  errorText?: string
}

/** Guided bio: sentence starters, a quality meter and an example. */
export function WorkerSetupBioComposer({
  value,
  onChange,
  errorText,
}: WorkerSetupBioComposerProps) {
  const copy = useI11n(bag).bio
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [exampleOpen, setExampleOpen] = useState(false)
  const quality = bioQuality(textWeight(value.trim()))

  const insertStarter = (starter: string) => {
    const current = value.trimEnd()
    const next = current ? `${current}\n${starter}` : starter
    if (next.length > BIO_MAX_CHARS) return
    onChange(next)
    textareaRef.current?.focus()
  }

  return (
    <FormField
      label={copy.label}
      helperText={copy.helper}
      errorText={errorText}
    >
      <Stack gap={3} w="full">
        <Wrap gap={2}>
          {copy.starters.map((starter) => (
            <ChipButton
              key={starter}
              type="button"
              aria-label={formatMessage(copy.insertStarter, {
                starter: starter.trim(),
              })}
              onClick={() => insertStarter(starter)}
              display="inline-flex"
              alignItems="center"
              gap={1.5}
              px={3.5}
              minH="44px"
              borderRadius="full"
              borderWidth="1px"
              borderColor="border.default"
              bg="bg.surface"
              color="text.muted"
              fontSize="sm"
              fontWeight={500}
              cursor="pointer"
              transitionProperty="background-color, border-color, color"
              transitionDuration={sdlMotion.duration.base}
              transitionTimingFunction={sdlMotion.easing.standard}
              _hover={{
                bg: 'status.success.soft',
                borderColor: 'status.success.border',
                color: 'status.success.fg',
              }}
              _focusVisible={sdlFocusRing}
            >
              <LuPlus size={14} strokeWidth={2.5} aria-hidden />
              {starter.trim().replace(/[:：]$/, '')}…
            </ChipButton>
          ))}
        </Wrap>

        <Box position="relative" w="full">
          <Textarea
            ref={textareaRef}
            value={value}
            maxLength={BIO_MAX_CHARS}
            onChange={(e) => onChange(e.target.value)}
            placeholder={copy.placeholder}
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
            {formatMessage(copy.count, {
              count: value.length,
              max: BIO_MAX_CHARS,
            })}
          </Text>
        </Box>

        <HStack gap={3} align="center">
          <Box flex={1}>
            <ProgressBar
              value={quality.percent}
              tone={quality.tone}
              size="sm"
              trackLabel={copy.qualityLabel}
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
            {copy[quality.key]}
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
            minH="44px"
            fontSize="sm"
            fontWeight={600}
            color="text.link"
            bg="transparent"
            cursor="pointer"
            borderRadius="md"
            _focusVisible={sdlFocusRing}
          >
            {exampleOpen ? copy.hideExample : copy.showExample}
            {exampleOpen ? (
              <LuChevronUp size={14} aria-hidden />
            ) : (
              <LuChevronDown size={14} aria-hidden />
            )}
          </ChipButton>
          {exampleOpen ? (
            <Box
              mt={1}
              p={3.5}
              borderRadius="lg"
              bg="bg.subtle"
              borderWidth="1px"
              borderColor="border.default"
            >
              <Text fontSize="sm" color="text.muted" lineHeight="tall">
                {copy.example}
              </Text>
            </Box>
          ) : null}
        </Box>
      </Stack>
    </FormField>
  )
}
