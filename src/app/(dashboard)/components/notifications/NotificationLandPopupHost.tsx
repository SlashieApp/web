'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import {
  isMapHomePath,
  nextLandPopup,
  readDismissedPopupIds,
  rememberDismissedPopupId,
} from '@/content/notifications/landPopup'
import { isReviewPrompt } from '@/content/reviews/reviewModel'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import bag from '@/ui/Header/i11n.json'
import { NotificationLandPopup } from '@/ui/Header/notifications/NotificationLandPopup'
import { EVENTS, capture } from '@/utils/analytics'
import { notificationTaskHref } from '@/utils/notifications'

/**
 * Land popup for eligible isPopup rows. Never shown on map home (`/search`).
 * Dismiss snoozes for 7 days via dismissedAt and does not close the drawer row.
 */
export function NotificationLandPopupHost() {
  const pathname = usePathname()
  const router = useRouter()
  const href = useLocalizedHref()
  const t = useI11n(bag).notifications
  const notifications = useNotificationsOptional()
  const [suppressedIds, setSuppressedIds] = useState<ReadonlySet<string>>(() =>
    readDismissedPopupIds(),
  )
  const [pending, setPending] = useState(false)

  const popup =
    notifications && !isMapHomePath(pathname)
      ? nextLandPopup(notifications.items, suppressedIds)
      : null

  const onDismiss = useCallback(async () => {
    if (!popup || !notifications || pending) return
    setPending(true)
    setSuppressedIds(rememberDismissedPopupId(popup.id))
    capture(EVENTS.notification_dismiss, {
      notification_id: popup.id,
      review_prompt: isReviewPrompt(popup.type),
    })
    try {
      await notifications.dismissPopup(popup)
    } catch {
      // The session snooze still hides it if the dismiss API is not deployed yet.
    } finally {
      setPending(false)
    }
  }, [notifications, pending, popup])

  const onPrimary = useCallback(() => {
    if (!popup || !notifications) return
    const taskHref = notificationTaskHref(popup.taskId, popup.orderId)
    const reviewHref = `${taskHref}${taskHref.includes('?') ? '&' : '?'}review=1`
    const destination = isReviewPrompt(popup.type)
      ? reviewHref
      : popup.extraCtaUrl?.trim() || taskHref
    setSuppressedIds(rememberDismissedPopupId(popup.id))
    void notifications.dismissPopup(popup)
    router.push(href(destination))
  }, [href, notifications, popup, router])

  if (!popup) return null

  return (
    <NotificationLandPopup
      open
      title={popup.title}
      body={popup.body}
      imageUrl={popup.imageUrl}
      extraCtaUrl={isReviewPrompt(popup.type) ? null : popup.extraCtaUrl}
      primaryLabel={isReviewPrompt(popup.type) ? t.reviewCta : t.openCta}
      onPrimary={onPrimary}
      onDismiss={() => void onDismiss()}
      submitting={pending}
    />
  )
}
