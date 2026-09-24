import { z } from 'zod'

import {
  NOTIFICATION_COHORT_KEYS,
  type NotificationCohortKey,
} from '@/content/reviews/reviewModel'

export const ADMIN_NOTIFICATION_TITLE_MAX = 120
export const ADMIN_NOTIFICATION_BODY_MAX = 500

const cohortKeySchema = z.enum(NOTIFICATION_COHORT_KEYS)

export const adminNotificationFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Enter a title.')
    .max(ADMIN_NOTIFICATION_TITLE_MAX),
  body: z
    .string()
    .trim()
    .min(1, 'Enter a message.')
    .max(ADMIN_NOTIFICATION_BODY_MAX),
  imageUrl: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || isHttpUrl(value),
      'Enter an https image URL.',
    ),
  extraCtaUrl: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || isHttpUrl(value) || value.startsWith('/'),
      'Enter a link path or https URL.',
    ),
  userIdsText: z.string(),
  cohortKeys: z.array(cohortKeySchema),
})

export type AdminNotificationFormValues = z.infer<
  typeof adminNotificationFormSchema
>

export type AdminNotificationDraft = {
  title: string
  body: string
  imageUrl: string
  extraCtaUrl: string
  userIds: string[]
  cohortKeys: NotificationCohortKey[]
}

export const ADMIN_NOTIFICATION_DEFAULTS: AdminNotificationFormValues = {
  title: '',
  body: '',
  imageUrl: '',
  extraCtaUrl: '',
  userIdsText: '',
  cohortKeys: [],
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function parseUserIds(text: string): string[] {
  const seen = new Set<string>()
  const ids: string[] = []
  for (const part of text.split(/[\s,]+/)) {
    const id = part.trim()
    if (!id || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }
  return ids
}

export type AdminNotificationParseResult =
  | { ok: true; draft: AdminNotificationDraft }
  | { ok: false; message: string }

/**
 * Targeting is user ids and/or cohort keys. An empty target is rejected —
 * there is no push-to-all.
 */
export function parseAdminNotificationDraft(
  values: AdminNotificationFormValues,
): AdminNotificationParseResult {
  const userIds = parseUserIds(values.userIdsText)
  const cohortKeys = [...values.cohortKeys]
  if (userIds.length === 0 && cohortKeys.length === 0) {
    return {
      ok: false,
      message:
        'Choose at least one person or cohort. There is no send-to-everyone.',
    }
  }
  return {
    ok: true,
    draft: {
      title: values.title.trim(),
      body: values.body.trim(),
      imageUrl: values.imageUrl.trim(),
      extraCtaUrl: values.extraCtaUrl.trim(),
      userIds,
      cohortKeys,
    },
  }
}

export function adminNotificationDraftKey(
  draft: AdminNotificationDraft,
): string {
  return JSON.stringify({
    title: draft.title,
    body: draft.body,
    imageUrl: draft.imageUrl,
    extraCtaUrl: draft.extraCtaUrl,
    userIds: [...draft.userIds].sort(),
    cohortKeys: [...draft.cohortKeys].sort(),
  })
}
