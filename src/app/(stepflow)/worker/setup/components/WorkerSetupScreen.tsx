'use client'

import { AppStatusBanners } from '@/app/(auth)/components/ui/AppStatusBanners'
import { StatusScreen } from '@/app/StatusScreen'
import { useI11n } from '@/i18n/useI11n'
import { BrandLoading } from '@/ui/BrandLoading/BrandLoading'
import { Button, Link, StepFlowHeader, StepFlowLayout } from '@ui'

import { useWorkerSetup } from '../context/WorkerSetupProvider'
import bag from '../i11n.json'
import { WorkerSetupMobileAccordion } from './layout/steppers/WorkerSetupMobileAccordion'
import { WorkerSetupProgressBar } from './layout/steppers/WorkerSetupProgressBar'
import { WorkerSetupStepper } from './layout/steppers/WorkerSetupStepper'
import { WorkerSetupStepContent } from './ui/steps/WorkerSetupStepContent'

export function WorkerSetupScreen() {
  const t = useI11n(bag)
  const {
    activeSubStep,
    exitHref,
    goBack,
    isHydrated,
    isSaving,
    loadError,
    retryLoad,
    saveAndContinue,
    saveError,
  } = useWorkerSetup()

  // A failed load used to leave a blank screen forever (FE-207).
  if (!isHydrated && loadError) {
    return (
      <StatusScreen
        title={t.loadErrorTitle}
        body={t.loadErrorBody}
        actions={
          <>
            <Button variant="primary" onClick={retryLoad}>
              {t.retry}
            </Button>
            <Button asChild variant="ghost">
              <Link href={exitHref} _hover={{ textDecoration: 'none' }}>
                {t.leave}
              </Link>
            </Button>
          </>
        }
      />
    )
  }

  if (!isHydrated) {
    return <BrandLoading label={t.loading} />
  }

  const copy = t.steps[activeSubStep]
  const isFirstStep = activeSubStep === 'profile.details'
  const isLastStep = activeSubStep === 'review.submit'

  return (
    <StepFlowLayout
      banner={<AppStatusBanners />}
      header={
        <StepFlowHeader
          title={t.title}
          exitHref={exitHref}
          closeLabel={t.closeLabel}
        />
      }
      progress={<WorkerSetupProgressBar />}
      stepper={<WorkerSetupStepper />}
      mobileBody={<WorkerSetupMobileAccordion />}
      title={copy.title}
      description={copy.description}
      errorText={saveError}
      actions={{
        showBack: !isFirstStep,
        backLabel: t.back,
        continueLabel: isLastStep ? t.finish : t.continue,
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
