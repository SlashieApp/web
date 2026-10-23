'use client'

import { useMutation } from '@apollo/client/react'
import { Stack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { AppStatusBanners } from '@/app/(auth)/components/ui/AppStatusBanners'
import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import CreateReview from '@/app/(task)/tasks/[slug]/graphql/CreateReview.gql'
import UpdateReview from '@/app/(task)/tasks/[slug]/graphql/UpdateReview.gql'
import { canReviewCompletedOrder } from '@/app/(task)/tasks/[slug]/helpers/reviewEligibility'
import taskBag from '@/app/(task)/tasks/[slug]/i11n.json'
import {
  REVIEW_COMMENT_MAX,
  reviewCanEdit,
} from '@/content/reviews/reviewModel'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import reviewBag from '@/ui/ReviewForm/i11n.json'
import { EVENTS, capture } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { StepFlowHeader, StepFlowLayout, StepFlowProgress, Stepper } from '@ui'

import {
  REVIEW_STEP_IDS,
  type ReviewStepId,
  reviewNextStep,
  reviewPreviousStep,
  reviewProgressPercent,
  reviewStepIndex,
} from '../helpers/reviewSteps.config'
import bag from '../i11n.json'
import { TaskReviewStep } from './ui/TaskReviewStep'

type ReviewMutation = {
  createReview?: { id: string } | null
  updateReview?: { id: string } | null
}

function TaskReviewFlow({
  taskId,
  orderId,
  existingId,
  initialStars,
  initialComment,
  editing,
}: {
  taskId: string
  orderId: string
  existingId: string | null
  initialStars: number
  initialComment: string
  editing: boolean
}) {
  const router = useRouter()
  const localize = useLocalizedHref()
  const t = useI11n(bag)
  const formCopy = useI11n(reviewBag)
  const taskHref = `/tasks/${taskId}`
  const [step, setStep] = useState<ReviewStepId>('stars')
  const [completed, setCompleted] = useState<ReadonlySet<ReviewStepId>>(
    () => new Set(),
  )
  const [stars, setStars] = useState(initialStars)
  const [comment, setComment] = useState(initialComment)
  const [starsError, setStarsError] = useState<string | null>(null)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createReview, createState] = useMutation<ReviewMutation>(CreateReview)
  const [updateReview, updateState] = useMutation<ReviewMutation>(UpdateReview)

  const stepLabels: Record<ReviewStepId, string> = {
    stars: t.steps.stars,
    comment: t.steps.comment,
    submit: t.steps.submit,
  }
  const titles: Record<ReviewStepId, { title: string; description: string }> = {
    stars: { title: t.starsTitle, description: t.starsDescription },
    comment: { title: t.commentTitle, description: t.commentDescription },
    submit: { title: t.submitTitle, description: t.submitDescription },
  }
  const submitting = createState.loading || updateState.loading
  const isSubmit = step === 'submit'

  const goTo = useCallback(
    (id: ReviewStepId) => {
      if (id !== step && !completed.has(id)) return
      setStarsError(null)
      setCommentError(null)
      setStep(id)
    },
    [completed, step],
  )

  const validate = useCallback((): boolean => {
    if (step === 'stars') {
      if (stars < 1 || stars > 5) {
        setStarsError(formCopy.starsRequired)
        return false
      }
      setStarsError(null)
      return true
    }
    if (step === 'comment' && comment.length > REVIEW_COMMENT_MAX) {
      setCommentError(
        formatMessage(t.commentTooLong, { max: REVIEW_COMMENT_MAX }),
      )
      return false
    }
    setCommentError(null)
    return true
  }, [comment.length, formCopy.starsRequired, stars, step, t.commentTooLong])

  const onContinue = useCallback(async () => {
    if (!validate()) return
    if (!isSubmit) {
      setCompleted((current) => new Set(current).add(step))
      const next = reviewNextStep(step)
      if (next) setStep(next)
      return
    }
    setSubmitError(null)
    const trimmed = comment.trim()
    const input = { stars, comment: trimmed ? trimmed : null }
    try {
      if (editing && existingId) {
        await updateReview({ variables: { id: existingId, input } })
      } else {
        await createReview({
          variables: { input: { orderId, ...input } },
        })
      }
      capture(EVENTS.review_submit_success, {
        order_id: orderId,
        edited: editing,
      })
      showAppToast({ title: t.saved, type: 'success' })
      router.push(localize(taskHref))
    } catch (error: unknown) {
      capture(EVENTS.review_submit_fail, { order_id: orderId })
      setSubmitError(getFriendlyErrorMessage(error, formCopy.errorFallback))
    }
  }, [
    comment,
    createReview,
    editing,
    existingId,
    formCopy.errorFallback,
    isSubmit,
    localize,
    orderId,
    router,
    stars,
    step,
    t.saved,
    taskHref,
    updateReview,
    validate,
  ])

  const copy = titles[step]

  return (
    <StepFlowLayout
      banner={<AppStatusBanners />}
      header={
        <StepFlowHeader
          title={t.eyebrow}
          exitHref={taskHref}
          closeLabel={t.closeLabel}
        />
      }
      progress={
        <StepFlowProgress
          value={reviewProgressPercent(step)}
          label={formatMessage(t.progress, {
            step: reviewStepIndex(step) + 1,
            total: REVIEW_STEP_IDS.length,
            label: stepLabels[step],
          })}
          trackLabel={t.progressTrack}
        />
      }
      stepper={
        <Stepper
          steps={REVIEW_STEP_IDS.map((id) => ({ id, label: stepLabels[id] }))}
          activeSubStepId={step}
          completedSubStepIds={completed}
          isSubStepUnlocked={(id) =>
            id === step || completed.has(id as ReviewStepId)
          }
          onSelectSubStep={(id) => goTo(id as ReviewStepId)}
        />
      }
      title={copy.title}
      description={copy.description}
      errorText={submitError}
      actions={{
        showBack: step !== 'stars',
        backLabel: t.back,
        continueLabel: isSubmit ? (editing ? t.save : t.submit) : t.continue,
        continueLoading: submitting,
        isFinal: isSubmit,
        onBack: () => {
          const previous = reviewPreviousStep(step)
          if (previous) goTo(previous)
        },
        onContinue: () => void onContinue(),
      }}
    >
      <TaskReviewStep
        step={step}
        stars={stars}
        comment={comment}
        onStarsChange={setStars}
        onCommentChange={setComment}
        starsError={starsError}
        commentError={commentError}
      />
    </StepFlowLayout>
  )
}

function MessageScreen({
  exitHref,
  title,
  body,
  actionLabel,
  onAction,
}: {
  exitHref: string
  title: string
  /** Optional: a refusal's error copy says it all in the title. */
  body?: string
  actionLabel: string
  onAction: () => void
}) {
  const t = useI11n(bag)
  return (
    <StepFlowLayout
      header={
        <StepFlowHeader
          title={t.eyebrow}
          exitHref={exitHref}
          closeLabel={t.closeLabel}
        />
      }
      stepper={
        <Stepper
          steps={[{ id: 'review', label: t.eyebrow }]}
          activeSubStepId="review"
        />
      }
      title={title}
      description={body}
      actions={{
        showBack: false,
        continueLabel: actionLabel,
        isFinal: true,
        onContinue: onAction,
      }}
    >
      <Stack />
    </StepFlowLayout>
  )
}

export function TaskReviewScreen({
  orderIdFromLink,
}: {
  orderIdFromLink?: string
}) {
  const router = useRouter()
  const localize = useLocalizedHref()
  const t = useI11n(bag)
  const serverErrors = useI11n(taskBag).serverErrors
  const {
    taskId: routeTaskId,
    task,
    me,
    myOrder,
    pending,
    permissions,
    statusReady,
    isAuthenticated,
    orderReview,
  } = useTaskDetail()
  const taskId = task?.id || routeTaskId
  const taskHref = taskId ? `/tasks/${taskId}` : '/tasks'
  const orderId = myOrder?.id ?? orderIdFromLink ?? null
  const eligible = canReviewCompletedOrder({
    userId: me?.id,
    posterId: task?.poster?.id,
    order: myOrder,
    taskCancelled: permissions.isCancelled,
  })

  // `pending` covers the authenticated refetch. A public `task(id)` miss
  // (typical for COMPLETED) must not fall through to the ineligible screen
  // while that refetch is still in flight, and must not spin once it settles
  // empty.
  if (
    pending ||
    (Boolean(task) && !statusReady) ||
    (eligible && orderReview.loading)
  ) {
    return (
      <MessageScreen
        exitHref={taskHref}
        title={t.loading}
        body={t.loading}
        actionLabel={t.backToTask}
        onAction={() => router.push(localize(taskHref))}
      />
    )
  }

  if (!isAuthenticated) {
    const next = taskId
      ? `/tasks/${taskId}/review${orderId ? `?orderId=${encodeURIComponent(orderId)}` : ''}`
      : '/tasks'
    return (
      <MessageScreen
        exitHref={taskHref}
        title={t.signInTitle}
        body={t.signInBody}
        actionLabel={t.signIn}
        onAction={() =>
          router.push(localize(`/login?next=${encodeURIComponent(next)}`))
        }
      />
    )
  }

  if (orderReview.unavailable) {
    return (
      <MessageScreen
        exitHref={taskHref}
        title={t.ineligibleTitle}
        body={t.unavailable}
        actionLabel={t.backToTask}
        onAction={() => router.push(localize(taskHref))}
      />
    )
  }

  // Frozen by a suspension (BE-108): the API refuses reviews and edits until
  // it is lifted, so say why instead of the form (as the Expo app does).
  if (permissions.isFrozen) {
    return (
      <MessageScreen
        exitHref={taskHref}
        title={
          permissions.isSuspended
            ? serverErrors.TASK_SUSPENDED
            : serverErrors.COUNTERPARTY_SUSPENDED
        }
        actionLabel={t.backToTask}
        onAction={() => router.push(localize(taskHref))}
      />
    )
  }

  const existing = orderReview.viewerReview
  const editable = existing ? reviewCanEdit(existing) : false
  if (existing && !editable) {
    return (
      <MessageScreen
        exitHref={taskHref}
        title={t.lockedTitle}
        body={t.lockedBody}
        actionLabel={t.backToTask}
        onAction={() => router.push(localize(taskHref))}
      />
    )
  }

  if (!eligible || !orderId || !task || (!existing && !orderReview.canSubmit)) {
    return (
      <MessageScreen
        exitHref={taskHref}
        title={t.ineligibleTitle}
        body={t.ineligibleBody}
        actionLabel={t.backToTask}
        onAction={() => router.push(localize(taskHref))}
      />
    )
  }

  return (
    <TaskReviewFlow
      key={existing?.id ?? 'new'}
      taskId={task.id}
      orderId={orderId}
      existingId={existing?.id ?? null}
      initialStars={existing?.stars ?? 0}
      initialComment={existing?.comment ?? ''}
      editing={Boolean(existing)}
    />
  )
}
