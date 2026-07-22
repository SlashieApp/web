'use client'

import { Box } from '@chakra-ui/react'

import { EmailVerificationBanner } from '@/app/(auth)/components/EmailVerificationBanner'
import { StepFlowLayout } from '@ui'

import { useWorkerSetup } from '../context/WorkerSetupProvider'
import { STEP_COPY } from '../helpers/workerSetupSteps.config'
import { WorkerSetupHeader } from './shared/WorkerSetupHeader'
import { WorkerSetupMobileAccordion } from './steppers/WorkerSetupMobileAccordion'
import { WorkerSetupProgressBar } from './steppers/WorkerSetupProgressBar'
import { WorkerSetupStepper } from './steppers/WorkerSetupStepper'
import { WorkerSetupStepContent } from './steps/WorkerSetupStepContent'

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

  if (!isHydrated) {
    return <Box minH="100dvh" bg="bg.subtle" />
  }

  const copy = STEP_COPY[activeSubStep]
  const isFirstStep = activeSubStep === 'profile.details'
  const isLastStep = activeSubStep === 'review.submit'

  return (
    <StepFlowLayout
      banner={<EmailVerificationBanner />}
      header={<WorkerSetupHeader exitHref={exitHref} />}
      progress={<WorkerSetupProgressBar />}
      stepper={<WorkerSetupStepper />}
      mobileBody={<WorkerSetupMobileAccordion />}
      title={copy.title}
      description={copy.description}
      errorText={saveError}
      actions={{
        showBack: !isFirstStep,
        continueLabel: isLastStep ? 'Start quoting' : 'Continue',
        continueLoading: isSaving,
        isFinal: isLastStep,
        onBack: goBack,
        onContinue: () => void saveAndContinue(),
      }}
    >
      <WorkerSetupStepContent />
    </StepFlowLayout>
  )
}
