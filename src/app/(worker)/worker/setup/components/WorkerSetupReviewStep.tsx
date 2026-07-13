'use client'

import { Stack, Text } from '@chakra-ui/react'

import { isPhoneVerified } from '@/app/(auth)/helpers/phoneVerification'
import { useUserStore } from '@/app/(auth)/store/user'

import { useWorkerSetup } from '../context/WorkerSetupProvider'
import { computeProfileStrength } from '../helpers/workerProfileStrength'
import { WorkerSetupProfilePreview } from './WorkerSetupProfilePreview'
import { WorkerSetupStrengthMeter } from './WorkerSetupStrengthMeter'

/**
 * Review step: profile strength (with one-click links back to incomplete
 * steps) above a live preview rendered with the public-profile components —
 * the worker sees exactly what customers will see before "Start quoting".
 */
export function WorkerSetupReviewStep() {
  const { form, bootstrap, goToSubStep, workerEligibility } = useWorkerSetup()
  const me = useUserStore((s) => s.me)

  const strength = computeProfileStrength({
    form,
    avatarUrl: bootstrap?.profile?.avatarUrl,
    phoneVerified: isPhoneVerified(me),
  })

  return (
    <Stack gap={6}>
      <WorkerSetupStrengthMeter strength={strength} onGoToStep={goToSubStep} />

      <Stack gap={2}>
        <Text fontSize="md" fontWeight={700} color="text.default">
          How customers will see you
        </Text>
        <WorkerSetupProfilePreview />
      </Stack>

      <Stack gap={2} pt={1}>
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {workerEligibility
            ? 'You meet the profile requirements to start quoting.'
            : 'Some profile requirements may still need attention. You can finish setup and update your profile if needed.'}
        </Text>
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          After you start quoting, customers pay you directly for the work.
          Slashie does not process job payments.
        </Text>
      </Stack>
    </Stack>
  )
}
