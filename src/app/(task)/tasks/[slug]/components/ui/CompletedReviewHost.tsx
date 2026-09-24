'use client'

import { useMutation } from '@apollo/client/react'
import { useCallback, useRef, useState } from 'react'

import { reviewCanEdit } from '@/content/reviews/reviewModel'
import { ReportControl } from '@/content/trust/ReportControl'
import { useI11n } from '@/i18n/useI11n'
import { ReviewForm, type ReviewFormValues } from '@/ui/ReviewForm'
import reviewBag from '@/ui/ReviewForm/i11n.json'
import { EVENTS, capture } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { isGraphQLSchemaMismatch } from '@/utils/graphqlSchemaMismatch'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import CreateReview from '../../graphql/CreateReview.graphql'
import UpdateReview from '../../graphql/UpdateReview.graphql'
import { isOrderCompletedStatus } from '../../helpers/taskDetailCompleted'
import bag from '../../i11n.json'

type ReviewMutation = {
  createReview?: { id: string } | null
  updateReview?: { id: string } | null
}

/**
 * Create / edit modal for the completed order. Report uses the existing
 * report flow against the other party's review when the API has unlocked it.
 */
export function CompletedReviewHost() {
  const t = useI11n(bag)
  const formCopy = useI11n(reviewBag)
  const {
    task,
    myOrder,
    permissions,
    reviewModalOpen,
    openReviewModal,
    closeReviewModal,
    viewerHasSubmittedReview,
    orderReview,
    markReviewSubmitted,
  } = useTaskDetail()
  const [submitError, setSubmitError] = useState<string>()
  const autoOpened = useRef(false)

  const [createReview, createState] = useMutation<ReviewMutation>(CreateReview)
  const [updateReview, updateState] = useMutation<ReviewMutation>(UpdateReview)

  const eligible = Boolean(
    task &&
      myOrder &&
      isOrderCompletedStatus(myOrder.status) &&
      !permissions.isCancelled &&
      (permissions.isOwner || permissions.isOrderWorker),
  )
  const existing = orderReview.viewerReview
  const editable = existing ? reviewCanEdit(existing) : false
  const mode = !existing ? 'create' : editable ? 'edit' : 'locked'

  const onMount = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node || autoOpened.current || !eligible) return
      const params = new URLSearchParams(window.location.search)
      if (params.get('review') !== '1') return
      autoOpened.current = true
      params.delete('review')
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${window.location.hash}`
      window.history.replaceState(window.history.state, '', next)
      if (!viewerHasSubmittedReview && mode !== 'locked') openReviewModal()
    },
    [eligible, mode, openReviewModal, viewerHasSubmittedReview],
  )

  const onSubmit = useCallback(
    async (values: ReviewFormValues) => {
      if (!myOrder || !task || values.rating == null) return false
      setSubmitError(undefined)
      const comment = values.comment.trim() ? values.comment.trim() : null
      try {
        if (existing && editable) {
          await updateReview({
            variables: {
              id: existing.id,
              input: { rating: values.rating, comment },
            },
          })
        } else {
          await createReview({
            variables: {
              input: {
                orderId: myOrder.id,
                taskId: task.id,
                rating: values.rating,
                comment,
              },
            },
          })
        }
        markReviewSubmitted()
        capture(EVENTS.review_submit_success, {
          order_id: myOrder.id,
          edited: Boolean(existing),
        })
        showAppToast({ title: t.reviews.saved, type: 'success' })
        void orderReview.refetch()
        return true
      } catch (error: unknown) {
        capture(EVENTS.review_submit_fail, { order_id: myOrder.id })
        setSubmitError(
          isGraphQLSchemaMismatch(error)
            ? formCopy.errorFallback
            : getFriendlyErrorMessage(error, formCopy.errorFallback),
        )
        return false
      }
    },
    [
      createReview,
      editable,
      existing,
      formCopy.errorFallback,
      markReviewSubmitted,
      myOrder,
      orderReview,
      t.reviews.saved,
      task,
      updateReview,
    ],
  )

  if (!eligible) return null

  const counterparty = orderReview.counterpartyReview

  return (
    <>
      <span hidden ref={onMount} />
      <ReviewForm
        open={reviewModalOpen}
        onOpenChange={(next) => {
          if (!next) {
            setSubmitError(undefined)
            closeReviewModal()
            return
          }
          openReviewModal()
        }}
        mode={mode}
        defaultRating={existing?.rating}
        defaultComment={existing?.comment ?? ''}
        onSubmit={mode === 'locked' ? undefined : onSubmit}
        submitting={createState.loading || updateState.loading}
        submitError={submitError}
        report={
          counterparty ? (
            <ReportControl
              kind="review"
              targetId={counterparty.id}
              targetTitle={t.reviews.theirs}
              variant="button"
            />
          ) : null
        }
      />
    </>
  )
}
