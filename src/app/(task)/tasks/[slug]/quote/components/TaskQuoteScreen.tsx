'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { EmailVerificationBanner } from '@/app/(auth)/components/EmailVerificationBanner'
import { StepFlowLayout } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  TASK_QUOTE_FIRST_SUB_STEP,
  TASK_QUOTE_STEP_COPY,
  type TaskQuoteSubStepId,
  taskQuoteIsSubStepUnlocked,
  taskQuoteNextSubStep,
  taskQuotePreviousSubStep,
  taskQuoteProgressPercent,
} from '../helpers/taskQuoteSteps.config'
import { TaskQuoteTaskDetailPanel } from './shared/TaskQuoteTaskDetailPanel'
import { TaskQuoteProgressBar } from './stepper/TaskQuoteProgressBar'
import { TaskQuoteStepper } from './stepper/TaskQuoteStepper'
import { TaskQuoteStepContent } from './steps/TaskQuoteStepContent'

const MESSAGE_MAX = 250

type TaskQuoteScreenProps = {
  backToTask: string
}

export function TaskQuoteScreen({ backToTask }: TaskQuoteScreenProps) {
  const router = useRouter()
  const {
    setQuoteAmountInput,
    quoteMessageInput,
    onSubmitQuote,
    quoting,
    quoteError,
  } = useTaskDetail()

  const [activeSubStep, setActiveSubStep] = useState<TaskQuoteSubStepId>(
    TASK_QUOTE_FIRST_SUB_STEP,
  )
  const [completedSubSteps, setCompletedSubSteps] = useState<
    Set<TaskQuoteSubStepId>
  >(() => new Set())
  const [poundsInput, setPoundsInput] = useState('')
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [fieldError, setFieldError] = useState<string | null>(null)

  const progressPercent = taskQuoteProgressPercent(activeSubStep)
  const copy = TASK_QUOTE_STEP_COPY[activeSubStep]
  const isFirstStep = activeSubStep === TASK_QUOTE_FIRST_SUB_STEP
  const isReviewStep = activeSubStep === 'review.check'
  const continueLabel = isReviewStep ? 'Send quote' : 'Continue'

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
        setFieldError('Enter a valid total price.')
        return false
      }
      setQuoteAmountInput(String(Math.round(pounds * 100)))
      return true
    }

    if (activeSubStep === 'quote.message') {
      const msg = quoteMessageInput.trim()
      if (msg.length > MESSAGE_MAX) {
        setFieldError(`Message must be ${MESSAGE_MAX} characters or fewer.`)
        return false
      }
      return true
    }

    return true
  }, [activeSubStep, poundsInput, quoteMessageInput, setQuoteAmountInput])

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
      banner={<EmailVerificationBanner />}
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
        continueLabel,
        continueLoading: isReviewStep && quoting,
        isFinal: isReviewStep,
        onBack: goBack,
        onContinue: () => void continueFlow(),
      }}
    >
      {stepContent}
    </StepFlowLayout>
  )
}
