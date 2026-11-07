'use client'

import { useMutation } from '@apollo/client/react'
import type { SaveWorkerMutation, UnsaveWorkerMutation } from '@codegen/schema'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import type { AskableTaskChoice } from '@/content/quoteInvitations/types'
import { useAskWorkerToQuote } from '@/content/quoteInvitations/useAskWorkerToQuote'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { showAppToast } from '@/utils/appToast'
import { useGoBack } from '@/utils/goBack'

import SaveWorker from '../graphql/SaveWorker.gql'
import UnsaveWorker from '../graphql/UnsaveWorker.gql'
import bag from '../i11n.json'
import { contactHref, resolveReviewHref } from './publicProfileLinks'
import type { PublicProfileModel } from './publicProfileModel'

/** Save (optimistic, rolled back on failure), the review link and Back. */
export function usePublicProfileActions(
  model: PublicProfileModel | null,
  excludeTaskId: string | null,
  /**
   * After an ask, sent or refused: read the profile again, so the row says
   * "Asked" and a row that went stale (asked meanwhile, task closed) updates.
   */
  onAsked?: () => void,
) {
  const t = useI11n(bag).hero
  const router = useRouter()
  const localize = useLocalizedHref()
  const onBack = useGoBack()
  const [saveOverride, setSaveOverride] = useState<boolean | null>(null)
  const [saveWorker] = useMutation<SaveWorkerMutation>(SaveWorker)
  const [unsaveWorker] = useMutation<UnsaveWorkerMutation>(UnsaveWorker)
  const invite = useAskWorkerToQuote()
  const saved = saveOverride ?? Boolean(model?.viewer?.isSaved)
  const reviewHref = resolveReviewHref(model?.viewer ?? null)

  const onSave = () => {
    if (!model?.workerId) return
    if (!model.viewer) {
      const signIn = contactHref('signIn', {
        profileUserId: model.id,
        excludeTaskId,
        relatedTaskId: null,
      })
      router.push(localize(signIn))
      return
    }
    const next = !saved
    setSaveOverride(next)
    const mutate = next ? saveWorker : unsaveWorker
    void mutate({ variables: { workerId: model.workerId } }).catch(() => {
      setSaveOverride(!next)
      showAppToast({ title: t.saveFailed, type: 'error' })
    })
  }

  /** Ask from the chooser (FE-507): one tap, one invitation. */
  const askTask = async (
    task: AskableTaskChoice,
    workerName: string,
  ): Promise<boolean> => {
    if (!model?.id) return false
    const ok = await invite.ask({
      taskId: task.id,
      taskTitle: task.title,
      workerUserId: model.id,
      workerName,
      surface: 'profile',
    })
    onAsked?.()
    return ok
  }
  const ask = {
    onSubmit: askTask,
    submitting: invite.loading,
    error: invite.error,
    onClose: invite.clearError,
  }

  return { saved, reviewHref, onSave, onBack, ask }
}
