'use client'

import { useMutation } from '@apollo/client/react'
import type {
  CreateReportMutation,
  CreateReportMutationVariables,
} from '@codegen/schema'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import CreateReport from '@/graphql/CreateReport.gql'
import { useI11n } from '@/i18n/useI11n'
import {
  ReportControl as UiReportControl,
  type ReportControlProps as UiReportControlProps,
} from '@/ui/ReportDialog/ReportControl'
import bag from '@/ui/ReportDialog/i11n.json'
import type { ReportFormValues } from '@/ui/ReportDialog/reportFormSchema'
import {
  EVENTS,
  capture,
  trackFlowFailed,
  trackFlowSucceeded,
} from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { getAuthToken } from '@/utils/auth'
import { isUnauthenticatedError } from '@/utils/graphqlErrors'

import {
  consumeReportQueryParam,
  getReportErrorMessage,
  reportReturnPath,
  reportTargetType,
  toReportReason,
} from './createReport'

export type ReportControlProps = Omit<
  UiReportControlProps,
  | 'onSubmit'
  | 'submitting'
  | 'submitError'
  | 'onRequestOpen'
  | 'open'
  | 'onOpenChange'
>

/**
 * App-wired report control: auth gate, `createReport`, toast, and PostHog.
 * Presentational UI lives in `@/ui/ReportDialog`.
 */
export function ReportControl({
  kind,
  targetId,
  onOpened,
  ...rest
}: ReportControlProps) {
  const t = useI11n(bag)
  const router = useRouter()
  const user = useUserStore((s) => s.user)
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string>()
  const autoOpenedRef = useRef(false)
  const inFlightRef = useRef(false)
  const [createReport, { loading }] = useMutation<
    CreateReportMutation,
    CreateReportMutationVariables
  >(CreateReport)

  const redirectToLogin = useCallback(() => {
    const next = reportReturnPath(targetId)
    capture(EVENTS.login_gate, {
      gate_reason: 'report',
      target_type: reportTargetType(kind),
      target_id: targetId,
    })
    router.push(`/login?next=${encodeURIComponent(next)}`)
  }, [kind, router, targetId])

  const isSignedIn = Boolean(user?.id || getAuthToken())

  const onRequestOpen = useCallback(() => {
    if (!isSignedIn) {
      redirectToLogin()
      return false
    }
    setSubmitError(undefined)
    return true
  }, [isSignedIn, redirectToLogin])

  const onMountRef = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node || autoOpenedRef.current) return
      autoOpenedRef.current = true
      if (!getAuthToken()) return
      if (consumeReportQueryParam(targetId)) {
        setSubmitError(undefined)
        setOpen(true)
      }
    },
    [targetId],
  )

  const onSubmit = useCallback(
    async (values: ReportFormValues) => {
      if (inFlightRef.current || loading) return false
      if (!isSignedIn) {
        redirectToLogin()
        return false
      }
      inFlightRef.current = true
      setSubmitError(undefined)
      const targetType = reportTargetType(kind)
      const details = values.details.trim()
      try {
        await createReport({
          variables: {
            input: {
              targetType,
              targetId,
              reason: toReportReason(values.reason),
              details: details || null,
            },
          },
        })
        trackFlowSucceeded(EVENTS.report_submit_success, {
          target_type: targetType,
          reason: values.reason,
        })
        showAppToast({
          title: t.successTitle,
          description: t.successDescription,
          type: 'success',
        })
        return true
      } catch (error) {
        trackFlowFailed(EVENTS.report_submit_fail, error, {
          flow: 'report',
          action: 'submit',
          operation: 'CreateReport',
          extra: {
            target_type: targetType,
            reason: values.reason,
          },
        })
        if (isUnauthenticatedError(error)) {
          redirectToLogin()
        }
        const message = getReportErrorMessage(error, t)
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
    [createReport, isSignedIn, kind, loading, redirectToLogin, t, targetId],
  )

  return (
    <>
      <span ref={onMountRef} hidden />
      <UiReportControl
        {...rest}
        kind={kind}
        targetId={targetId}
        onOpened={onOpened}
        open={open}
        onOpenChange={(next) => {
          if (!next) setSubmitError(undefined)
          setOpen(next)
        }}
        onRequestOpen={onRequestOpen}
        onSubmit={onSubmit}
        submitting={loading}
        submitError={submitError}
      />
    </>
  )
}
