'use client'

import { Box, HStack, Stack, Text, chakra } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { LuX } from 'react-icons/lu'

import { workerSetupHref } from '@/app/(worker)/worker/setup/helpers/workerSetupHref'
import { sdlFocusRing } from '@/theme/styles'
import { Link, ProgressBar } from '@ui'

import type { WorkerProfileGap } from '../../helpers/workerProfileOwner'

const DISMISS_KEY_PREFIX = 'slashie.profile-strength-banner.'

const DismissButton = chakra('button')

/**
 * Owner-only, dismissible profile-strength banner (dismissal persists per
 * worker in localStorage). Hidden entirely at 100%.
 */
export function WorkerProfileOwnerBanner({
  workerId,
  percent,
  nextGap,
}: {
  workerId: string
  percent: number
  nextGap: WorkerProfileGap | null
}) {
  // Render nothing until mounted so SSR/CSR markup match, then respect
  // a previous dismissal.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (percent >= 100) return
    try {
      if (localStorage.getItem(`${DISMISS_KEY_PREFIX}${workerId}`)) return
    } catch {
      // Private mode etc. — just show the banner.
    }
    setVisible(true)
  }, [percent, workerId])

  if (!visible) return null

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(`${DISMISS_KEY_PREFIX}${workerId}`, '1')
    } catch {
      // Ignore storage failures — dismissal just won't persist.
    }
  }

  return (
    <Box
      borderWidth="1px"
      borderColor="status.success.border"
      borderRadius="lg"
      bg="status.success.soft"
      p={{ base: 4, md: 5 }}
    >
      <HStack gap={3} align="flex-start">
        <Stack gap={2} flex={1} minW={0}>
          <Text fontWeight={700} fontSize="sm" color="status.success.fg">
            Your profile is {percent}% complete
          </Text>
          <ProgressBar
            value={percent}
            tone="success"
            size="sm"
            trackLabel="Profile completeness"
            maxW="320px"
          />
          {nextGap ? (
            <Text fontSize="sm" color="text.default">
              Next:{' '}
              <Link href={workerSetupHref()} fontWeight={700}>
                {nextGap.label}
              </Link>{' '}
              to win more work.
            </Text>
          ) : null}
        </Stack>
        <DismissButton
          type="button"
          aria-label="Dismiss profile strength banner"
          onClick={dismiss}
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          boxSize="28px"
          borderRadius="full"
          cursor="pointer"
          color="status.success.fg"
          flexShrink={0}
          _hover={{ bg: 'bg.surface' }}
          _focusVisible={sdlFocusRing}
        >
          <LuX size={15} strokeWidth={2.5} aria-hidden />
        </DismissButton>
      </HStack>
    </Box>
  )
}
