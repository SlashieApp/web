'use client'

import { Box, HStack, Stack, Text, chakra } from '@chakra-ui/react'
import { LuPlus } from 'react-icons/lu'

import { sdlFocusRing } from '@/theme/styles'
import { Badge, ProgressBar } from '@ui'

import type { ProfileStrength } from '../helpers/workerProfileStrength'
import type { WorkerSetupSubStepId } from '../helpers/workerSetupSteps.config'

const FixLink = chakra('button')

const TIER_DESCRIPTIONS: Record<ProfileStrength['tier'], string> = {
  starter: 'A few more details and customers will take you seriously.',
  good: 'Solid profile — a couple more details make it stand out.',
  allStar: 'Your profile has everything customers look for.',
}

export type WorkerSetupStrengthMeterProps = {
  strength: ProfileStrength
  onGoToStep: (subStep: WorkerSetupSubStepId) => void
}

/**
 * Review-step profile strength (Starter / Good / All-star). Every missing
 * signal is a one-click link back to its setup step.
 */
export function WorkerSetupStrengthMeter({
  strength,
  onGoToStep,
}: WorkerSetupStrengthMeterProps) {
  const missing = strength.items.filter((item) => !item.done)

  return (
    <Box
      borderWidth="1px"
      borderColor="border.strong"
      borderRadius="lg"
      bg="bg.surface"
      p={{ base: 4, md: 5 }}
    >
      <Stack gap={3}>
        <HStack justify="space-between" align="center" gap={3}>
          <Text fontSize="md" fontWeight={700} color="text.default">
            Profile strength
          </Text>
          <Badge
            variant={strength.tier === 'starter' ? 'neutral' : 'brand'}
            shape="pill"
            size="lg"
          >
            {strength.tierLabel}
          </Badge>
        </HStack>

        <ProgressBar
          value={strength.percent}
          tone={strength.tier === 'starter' ? 'warning' : 'success'}
          size="sm"
          trackLabel="Profile strength"
        />

        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {TIER_DESCRIPTIONS[strength.tier]} ({strength.doneCount} of{' '}
          {strength.totalCount} complete)
        </Text>

        {missing.length > 0 ? (
          <Stack gap={1.5} pt={1}>
            {missing.map((item) => (
              <FixLink
                key={item.key}
                type="button"
                onClick={() => onGoToStep(item.subStep)}
                display="inline-flex"
                alignItems="center"
                gap={2}
                alignSelf="flex-start"
                fontSize="sm"
                fontWeight={600}
                color="text.link"
                bg="transparent"
                cursor="pointer"
                borderRadius="md"
                _hover={{ textDecoration: 'underline' }}
                _focusVisible={sdlFocusRing}
              >
                <Box as="span" display="inline-flex" aria-hidden>
                  <LuPlus size={14} strokeWidth={2.5} />
                </Box>
                {item.label}
              </FixLink>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  )
}
