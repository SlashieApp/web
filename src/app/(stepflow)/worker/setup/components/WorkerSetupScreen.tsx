'use client'

import { AppStatusBanners } from '@/app/(auth)/components/AppStatusBanners'
import { PageLoading } from '@/ui/PageLoading/PageLoading'
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
    return <PageLoading />
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
