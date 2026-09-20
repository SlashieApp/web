'use client'

import { Box } from '@chakra-ui/react'

import { AppStatusBanners } from '@/app/(auth)/components/ui/AppStatusBanners'
import { StepFlowLayout } from '@ui'

import { useWorkerSetup } from '../context/WorkerSetupProvider'
import { STEP_COPY } from '../helpers/workerSetupSteps.config'
import { WorkerSetupMobileAccordion } from './layout/steppers/WorkerSetupMobileAccordion'
import { WorkerSetupProgressBar } from './layout/steppers/WorkerSetupProgressBar'
import { WorkerSetupStepper } from './layout/steppers/WorkerSetupStepper'
import { WorkerSetupHeader } from './ui/shared/WorkerSetupHeader'
import { WorkerSetupStepContent } from './ui/steps/WorkerSetupStepContent'

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
      banner={<AppStatusBanners />}
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
