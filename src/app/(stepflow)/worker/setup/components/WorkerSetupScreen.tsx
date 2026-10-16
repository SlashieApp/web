'use client'

import { Box } from '@chakra-ui/react'

import { AppStatusBanners } from '@/app/(auth)/components/ui/AppStatusBanners'
import { StatusScreen } from '@/app/StatusScreen'
import { useI11n } from '@/i18n/useI11n'
import { BrandLoading } from '@/ui/BrandLoading/BrandLoading'
import { Button, Link, StepFlowHeader, StepFlowLayout } from '@ui'

import { useWorkerSetup } from '../context/WorkerSetupProvider'
import { previousScreen } from '../helpers/workerSetupScreens'
import bag from '../i11n.json'
import { WORKER_SETUP_VIEWS, getWorkerSetupView } from '../views'
import { WorkerSetupProgressBar } from './layout/steppers/WorkerSetupProgressBar'
import { WorkerSetupStepper } from './layout/steppers/WorkerSetupStepper'
import { WorkerSetupStepContent } from './ui/steps/WorkerSetupStepContent'

/** /worker/setup for a signed-in user: what `getWorkerSetupView` picks. */
export function WorkerSetupScreen() {
  const t = useI11n(bag)
  const {
    status,
    screen,
    exitHref,
    goBack,
    isSaving,
    retryLoad,
    saveAndContinue,
    saveError,
    headingRef,
    contentRef,
  } = useWorkerSetup()
  const view = WORKER_SETUP_VIEWS[getWorkerSetupView({ status, screen })]

  if (view.layout === 'error') {
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

  // Loading, or an existing worker being sent on.
  if (view.layout !== 'screen') return <BrandLoading label={t.loading} />

  const copy = t.screens[view.screen]
  const finish = view.primary === 'finish'

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
      title={copy.title}
      description={copy.description}
      headingRef={headingRef}
      errorText={saveError}
      actions={{
        showBack: previousScreen(view.screen) !== null,
        backLabel: t.back,
        continueLabel: finish ? t.finish : t.continue,
        continueLoading: isSaving,
        isFinal: finish,
        onBack: goBack,
        onContinue: () => void saveAndContinue(),
      }}
    >
      <Box ref={contentRef}>
        <WorkerSetupStepContent view={view} />
      </Box>
    </StepFlowLayout>
  )
}
