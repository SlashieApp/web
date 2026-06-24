'use client'

import { Box, Grid, Stack, Text, useBreakpointValue } from '@chakra-ui/react'

import { EmailVerificationBanner } from '@/app/(auth)/components/EmailVerificationBanner'

import { useWorkerSetup } from '../context/WorkerSetupProvider'
import { STEP_COPY } from '../helpers/workerSetupSteps.config'
import { WorkerSetupHeader } from './WorkerSetupHeader'
import { WorkerSetupMobileAccordion } from './WorkerSetupMobileAccordion'
import { WorkerSetupProgressBar } from './WorkerSetupProgressBar'
import { WorkerSetupStepActions } from './WorkerSetupStepActions'
import { WorkerSetupStepContent } from './WorkerSetupStepContent'
import { WorkerSetupStepPanel } from './WorkerSetupStepPanel'
import { WorkerSetupStepper } from './WorkerSetupStepper'

export function WorkerSetupScreen() {
  const {
    activeSubStep,
    exitHref,
    goBack,
    isHydrated,
    isSaving,
    saveAndContinue,
    saveError,
  } = useWorkerSetup()

  const showDesktopStepper =
    useBreakpointValue({ base: false, lg: true }, { fallback: 'base' }) ?? false

  if (!isHydrated) {
    return <Box minH="100dvh" bg="neutral.100" />
  }

  const copy = STEP_COPY[activeSubStep]
  const isFirstStep = activeSubStep === 'profile.details'
  const isLastStep = activeSubStep === 'review.submit'

  const stepActions = (
    <WorkerSetupStepActions
      showBack={!isFirstStep}
      continueLabel={isLastStep ? 'Start quoting' : 'Continue'}
      continueLoading={isSaving}
      onBack={goBack}
      onContinue={() => void saveAndContinue()}
      sticky={!showDesktopStepper}
    />
  )

  return (
    <Stack gap={0} flex={1} minH="100dvh" bg="neutral.100">
      <EmailVerificationBanner />
      <WorkerSetupHeader exitHref={exitHref} />

      {!showDesktopStepper ? (
        <Stack flex={1} minH={0} gap={0}>
          <WorkerSetupProgressBar />
          <Box flex={1} minH={0} overflowY="auto">
            <WorkerSetupMobileAccordion />
          </Box>
          {stepActions}
        </Stack>
      ) : (
        <Box flex={1} minH={0} overflow="hidden">
          <Grid
            templateColumns="minmax(280px, 320px) minmax(0, 1fr)"
            gap={8}
            maxW="7xl"
            mx="auto"
            w="full"
            h="full"
            px={8}
            py={8}
          >
            <Box pt={2} px={2} overflowY="auto">
              <WorkerSetupStepper />
            </Box>
            <Box
              bg="bg.surface"
              borderRadius="2xl"
              boxShadow="e2"
              borderWidth="1px"
              borderColor="border.default"
              minH="640px"
              h="full"
              display="flex"
              flexDirection="column"
              overflow="hidden"
            >
              <WorkerSetupStepPanel
                title={copy.title}
                description={copy.description}
                showBack={!isFirstStep}
                continueLabel={isLastStep ? 'Start quoting' : 'Continue'}
                continueLoading={isSaving}
                onBack={goBack}
                onContinue={() => void saveAndContinue()}
              >
                {saveError ? (
                  <Text color="status.danger.fg" fontSize="sm" mb={4}>
                    {saveError}
                  </Text>
                ) : null}
                <WorkerSetupStepContent />
              </WorkerSetupStepPanel>
            </Box>
          </Grid>
        </Box>
      )}
    </Stack>
  )
}
