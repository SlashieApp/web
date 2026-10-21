'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useState } from 'react'

import { AppStatusBanners } from '@/app/(auth)/components/ui/AppStatusBanners'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { validateTimeSlotDrafts } from '@/utils/timeSlots'
import { StepFlowHeader, StepFlowLayout } from '@ui'

import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import {
  TASK_QUOTE_FIRST_SUB_STEP,
  type TaskQuoteSubStepId,
  taskQuoteIsSubStepUnlocked,
  taskQuoteNextSubStep,
  taskQuotePreviousSubStep,
  taskQuoteProgressPercent,
} from '../helpers/taskQuoteSteps.config'
import { TaskQuoteProgressBar } from './layout/stepper/TaskQuoteProgressBar'
import { TaskQuoteStepper } from './layout/stepper/TaskQuoteStepper'
import { TaskQuoteTaskDetailPanel } from './ui/shared/TaskQuoteTaskDetailPanel'
import { TaskQuoteStepContent } from './ui/steps/TaskQuoteStepContent'

import bag from '../i11n.json'

const MESSAGE_MAX = 250

type TaskQuoteScreenProps = {
  backToTask: string
  /** Prefill the price step (edit an existing quote). */
  initialPounds?: string
  /** Final-step button label. Defaults to the bag's `submit` ("Send quote"). */
  submitLabel?: string
  /** Extra controls under every step (e.g. withdraw an existing quote). */
  footer?: ReactNode
}

export function TaskQuoteScreen({
  backToTask,
  initialPounds = '',
  submitLabel,
  footer,
}: TaskQuoteScreenProps) {
  const router = useRouter()
  const {
    setQuoteAmountInput,
    quoteMessageInput,
    quoteSlots,
    onSubmitQuote,
    quoting,
    quoteError,
  } = useTaskDetail()
  const flowCopy = useI11n(bag)

  const [activeSubStep, setActiveSubStep] = useState<TaskQuoteSubStepId>(
    TASK_QUOTE_FIRST_SUB_STEP,
  )
  const [completedSubSteps, setCompletedSubSteps] = useState<
    Set<TaskQuoteSubStepId>
  >(() => new Set())
  const [poundsInput, setPoundsInput] = useState(initialPounds)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [fieldError, setFieldError] = useState<string | null>(null)

  const progressPercent = taskQuoteProgressPercent(activeSubStep)
  const copy = flowCopy.steps[activeSubStep]
  const isFirstStep = activeSubStep === TASK_QUOTE_FIRST_SUB_STEP
  const isReviewStep = activeSubStep === 'review.check'
  const continueLabel = isReviewStep
    ? (submitLabel ?? flowCopy.submit)
    : flowCopy.continue

  const revokeUrl = useCallback((url: string) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }, [])

  const removePhotoAt = useCallback(
    (index: number) => {
      setPhotoUrls((prev) => {
        const next = [...prev]
        const [removed] = next.splice(index, 1)
        if (removed) revokeUrl(removed)
        return next
      })
    },
    [revokeUrl],
  )

  const onPhotoFiles = useCallback((list: FileList | null) => {
    if (!list?.length) return
    setPhotoUrls((prev) => {
      const next = [...prev]
      for (const file of Array.from(list)) {
        if (next.length >= 6) break
        if (!file.type.startsWith('image/')) continue
        next.push(URL.createObjectURL(file))
      }
      return next
    })
  }, [])

  const goToSubStep = useCallback(
    (id: TaskQuoteSubStepId) => {
      if (!taskQuoteIsSubStepUnlocked(id, activeSubStep, completedSubSteps)) {
        return
      }
      setFieldError(null)
      setActiveSubStep(id)
    },
    [activeSubStep, completedSubSteps],
  )

  const goBack = useCallback(() => {
    const prev = taskQuotePreviousSubStep(activeSubStep)
    if (prev) goToSubStep(prev)
  }, [activeSubStep, goToSubStep])

  const validateCurrentStep = useCallback((): boolean => {
    setFieldError(null)

    if (activeSubStep === 'quote.price') {
      const raw = poundsInput.trim().replace(/[£,\s]/g, '')
      const pounds = Number.parseFloat(raw)
      if (!Number.isFinite(pounds) || pounds <= 0) {
        setFieldError(flowCopy.price.invalid)
        return false
      }
      setQuoteAmountInput(String(Math.round(pounds * 100)))
      return true
    }

    if (activeSubStep === 'quote.message') {
      const msg = quoteMessageInput.trim()
      if (msg.length > MESSAGE_MAX) {
        setFieldError(
          formatMessage(flowCopy.message.tooLong, { max: MESSAGE_MAX }),
        )
        return false
      }
      return true
    }

    if (activeSubStep === 'quote.availability') {
      if (
        quoteSlots.length === 0 ||
        validateTimeSlotDrafts(quoteSlots).some((error) => error != null)
      ) {
        setFieldError(flowCopy.slotsInvalid)
        return false
      }
      return true
    }

    return true
  }, [
    activeSubStep,
    flowCopy.message.tooLong,
    flowCopy.price.invalid,
    flowCopy.slotsInvalid,
    poundsInput,
    quoteMessageInput,
    quoteSlots,
    setQuoteAmountInput,
  ])

  const continueFlow = useCallback(async () => {
    if (!validateCurrentStep()) return

    if (isReviewStep) {
      const ok = await onSubmitQuote()
      if (ok) {
        router.replace(backToTask)
      }
      return
    }

    setCompletedSubSteps((prev) => {
      const next = new Set(prev)
      next.add(activeSubStep)
      return next
    })

    const next = taskQuoteNextSubStep(activeSubStep)
    if (next) {
      setActiveSubStep(next)
      setFieldError(null)
    }
  }, [
    activeSubStep,
    backToTask,
    isReviewStep,
    onSubmitQuote,
    router,
    validateCurrentStep,
  ])

  const stepContent = (
    <TaskQuoteStepContent
      activeSubStep={activeSubStep}
      poundsInput={poundsInput}
      onPoundsInputChange={setPoundsInput}
      photoUrls={photoUrls}
      onPhotoFiles={onPhotoFiles}
      onRemovePhotoAt={removePhotoAt}
      fieldError={fieldError}
      quoteError={quoteError}
    />
  )

  return (
    <StepFlowLayout
      banner={<AppStatusBanners />}
      header={
        <StepFlowHeader
          title={flowCopy.eyebrow}
          exitHref={backToTask}
          closeLabel={flowCopy.closeLabel}
        />
      }
      mobileTop={
        <TaskQuoteTaskDetailPanel backHref={backToTask} variant="section" />
      }
      progress={
        <TaskQuoteProgressBar
          activeSubStep={activeSubStep}
          progressPercent={progressPercent}
        />
      }
      stepper={
        <TaskQuoteStepper
          activeSubStep={activeSubStep}
          completedSubSteps={completedSubSteps}
          onSelectSubStep={goToSubStep}
        />
      }
      aside={<TaskQuoteTaskDetailPanel backHref={backToTask} />}
      title={copy.title}
      description={copy.description}
      actions={{
        showBack: !isFirstStep,
        backLabel: flowCopy.back,
        continueLabel,
        continueLoading: isReviewStep && quoting,
        isFinal: isReviewStep,
        onBack: goBack,
        onContinue: () => void continueFlow(),
      }}
    >
      {stepContent}
      {footer}
    </StepFlowLayout>
  )
}
