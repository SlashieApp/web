'use client'

import { Box, Grid, Stack, useBreakpointValue } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { EmailVerificationBanner } from '@/app/(auth)/components/EmailVerificationBanner'

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
import { TaskQuoteProgressBar } from './TaskQuoteProgressBar'
import { TaskQuoteStepActions } from './TaskQuoteStepActions'
import { TaskQuoteStepContent } from './TaskQuoteStepContent'
import { TaskQuoteStepHeading } from './TaskQuoteStepHeading'
import { TaskQuoteStepPanel } from './TaskQuoteStepPanel'
import { TaskQuoteStepper } from './TaskQuoteStepper'
import { TaskQuoteTaskDetailPanel } from './TaskQuoteTaskDetailPanel'

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

  const showDesktopLayout =
    useBreakpointValue({ base: false, lg: true }, { fallback: 'base' }) ?? false

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

  const stepActions = (
    <TaskQuoteStepActions
      showBack={!isFirstStep}
      continueLabel={continueLabel}
      continueLoading={isReviewStep && quoting}
      onBack={goBack}
      onContinue={() => void continueFlow()}
      sticky={!showDesktopLayout}
    />
  )

  return (
    <Stack gap={0} flex={1} minH="100dvh" bg="bg.subtle">
      <EmailVerificationBanner />

      {!showDesktopLayout ? (
        <Stack flex={1} minH={0} gap={0}>
          <TaskQuoteTaskDetailPanel backHref={backToTask} variant="section" />
          <TaskQuoteProgressBar
            activeSubStep={activeSubStep}
            progressPercent={progressPercent}
          />
          <Box flex={1} minH={0} overflowY="auto" bg="bg.surface">
            <Stack
              gap={6}
              flex={1}
              minH={0}
              overflowY="auto"
              px={4}
              py={5}
              pb={4}
            >
              <TaskQuoteStepHeading
                title={copy.title}
                description={copy.description}
              />
              {stepContent}
            </Stack>
          </Box>
          {stepActions}
        </Stack>
      ) : (
        <Box flex={1} minH={0} overflow="hidden">
          <Grid
            templateColumns="minmax(240px, 280px) minmax(0, 1fr) minmax(280px, 340px)"
            gap={6}
            maxW="7xl"
            mx="auto"
            w="full"
            h="full"
            px={8}
            py={8}
          >
            <Box pt={2} px={1} overflowY="auto" minH={0}>
              <TaskQuoteStepper
                activeSubStep={activeSubStep}
                completedSubSteps={completedSubSteps}
                onSelectSubStep={goToSubStep}
              />
            </Box>
            <Box
              bg="bg.surface"
              borderRadius="2xl"
              boxShadow="sm"
              borderWidth="1px"
              borderColor="border.default"
              minH="640px"
              h="full"
              display="flex"
              flexDirection="column"
              overflow="hidden"
              minW={0}
            >
              <TaskQuoteStepPanel
                title={copy.title}
                description={copy.description}
                showBack={!isFirstStep}
                continueLabel={continueLabel}
                continueLoading={isReviewStep && quoting}
                onBack={goBack}
                onContinue={() => void continueFlow()}
              >
                {stepContent}
              </TaskQuoteStepPanel>
            </Box>
            <Box minH={0} minW={0} h="full">
              <TaskQuoteTaskDetailPanel backHref={backToTask} />
            </Box>
          </Grid>
        </Box>
      )}
    </Stack>
  )
}
