'use client'

import { Box, HStack, Stack, Text, chakra } from '@chakra-ui/react'
import { LuPlus } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing } from '@/theme/styles'
import { Badge, ProgressBar } from '@ui'

import type { ProfileStrength } from '../../../helpers/workerProfileStrength'
import { SKILLS_MIN } from '../../../helpers/workerSetupSkills'
import { BIO_MIN_CHARS } from '../../../helpers/workerSetupValidation'
import bag from '../../../i11n.json'
import type { WorkerSetupScreenId } from '../../../views'

const FixLink = chakra('button')

export type WorkerSetupStrengthMeterProps = {
  strength: ProfileStrength
  onGoToScreen: (screen: WorkerSetupScreenId) => void
}

/** Starter, Good or All-star; every missing item links to the screen that fixes it. */
export function WorkerSetupStrengthMeter({
  strength,
  onGoToScreen,
}: WorkerSetupStrengthMeterProps) {
  const copy = useI11n(bag).review
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
            {copy.strengthTitle}
          </Text>
          <Badge
            variant={strength.tier === 'starter' ? 'neutral' : 'brand'}
            shape="pill"
            size="lg"
          >
            {copy.tiers[strength.tier]}
          </Badge>
        </HStack>

        <ProgressBar
          value={strength.percent}
          tone={strength.tier === 'starter' ? 'warning' : 'success'}
          size="sm"
          trackLabel={copy.strengthTitle}
        />

        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {copy.tierDescriptions[strength.tier]}{' '}
          {formatMessage(copy.doneCount, {
            done: strength.doneCount,
            total: strength.items.length,
          })}
        </Text>

        {missing.length > 0 ? (
          <Stack gap={0}>
            {missing.map((item) => (
              <FixLink
                key={item.key}
                type="button"
                onClick={() => onGoToScreen(item.screen)}
                display="inline-flex"
                alignItems="center"
                gap={2}
                alignSelf="flex-start"
                minH="44px"
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
                {formatMessage(copy.items[item.key], {
                  min: item.key === 'skills' ? SKILLS_MIN : BIO_MIN_CHARS,
                })}
              </FixLink>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  )
}
