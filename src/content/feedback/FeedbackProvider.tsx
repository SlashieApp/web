'use client'

import { useMutation } from '@apollo/client/react'
import { type ReactNode, useCallback, useRef, useState } from 'react'

import { useMe, useUserStore } from '@/app/(auth)/store/user'
import CreateFeedback from '@/graphql/CreateFeedback.graphql'
import { useI11n } from '@/i18n/useI11n'
import { FeedbackDialogProvider as UiFeedbackDialogProvider } from '@/ui/FeedbackDialog/FeedbackDialogProvider'
import type { FeedbackFormValues } from '@/ui/FeedbackDialog/feedbackFormSchema'
import bag from '@/ui/FeedbackDialog/i11n.json'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'

import {
  type CreateFeedbackMutation,
  type CreateFeedbackMutationVariables,
  currentPageContext,
  currentUserAgent,
  getFeedbackErrorMessage,
  toCreateFeedbackInput,
} from './createFeedback'

/**
 * App-wired product feedback host: `createFeedback`, toast, and PostHog.
 * Presentational UI lives in `@/ui/FeedbackDialog`.
 */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const t = useI11n(bag)
  const user = useUserStore((s) => s.user)
  const me = useMe()
  const [submitError, setSubmitError] = useState<string>()
  const inFlightRef = useRef(false)
  const [createFeedback, { loading }] = useMutation<
    CreateFeedbackMutation,
    CreateFeedbackMutationVariables
  >(CreateFeedback)

  const defaultEmail = (user?.email ?? me?.email ?? '').trim()
  const defaultName = (me?.profile?.name ?? '').trim()
  const emailLocked = Boolean(defaultEmail)

  const onSubmit = useCallback(
    async (values: FeedbackFormValues) => {
      if (inFlightRef.current || loading) return false
      inFlightRef.current = true
      setSubmitError(undefined)
      const page = {
        ...currentPageContext(),
        userAgent: currentUserAgent(),
      }
      try {
        await createFeedback({
          variables: {
            input: toCreateFeedbackInput(values, page),
          },
        })
        trackFlowSucceeded(EVENTS.feedback_submit_success, {
          category: values.category,
          has_rating: values.rating != null,
          signed_in: emailLocked,
        })
        showAppToast({
          title: t.successTitle,
          description: t.successDescription,
          type: 'success',
        })
        return true
      } catch (error) {
        trackFlowFailed(EVENTS.feedback_submit_fail, error, {
          flow: 'feedback',
          action: 'submit',
          operation: 'CreateFeedback',
          extra: {
            category: values.category,
          },
        })
        const message = getFeedbackErrorMessage(error, t)
        setSubmitError(message)
        showAppToast({
          title: t.errorFallback,
          description: message,
          type: 'error',
        })
        return false
      } finally {
        inFlightRef.current = false
      }
    },
    [createFeedback, emailLocked, loading, t],
  )

  return (
    <UiFeedbackDialogProvider
      onSubmit={onSubmit}
      submitting={loading}
      submitError={submitError}
      defaultEmail={defaultEmail}
      defaultName={defaultName}
      emailLocked={emailLocked}
      onOpen={() => setSubmitError(undefined)}
    >
      {children}
    </UiFeedbackDialogProvider>
  )
}
