'use client'

import { useMutation } from '@apollo/client/react'
import { Text } from '@chakra-ui/react'
import { useCallback, useState } from 'react'

import { useMe } from '@/app/(auth)/store/user'
import { DashboardPageLayout } from '@/app/(dashboard)/components/layout/DashboardPageLayout'
import {
  type AdminNotificationDraft,
  adminNotificationDraftKey,
} from '@/content/admin/adminNotificationDraft'
import { isSlashieAdminEmail } from '@/content/admin/isSlashieAdminEmail'
import { useI11n } from '@/i18n/useI11n'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { isGraphQLSchemaMismatch } from '@/utils/graphqlSchemaMismatch'

import { AdminNotificationComposer } from './components/ui/AdminNotificationComposer'
import AdminCreateNotification from './graphql/AdminCreateNotification.graphql'
import bag from './i11n.json'

type AdminCreateNotificationResult = {
  adminCreateNotification?: {
    dryRun: boolean
    recipientCount: number
    auditId?: string | null
  } | null
}

export default function AdminNotificationsPage() {
  const t = useI11n(bag)
  const me = useMe()
  const isAdmin = isSlashieAdminEmail(me?.email)
  const [mutate] = useMutation<AdminCreateNotificationResult>(
    AdminCreateNotification,
  )
  const [dryRunKey, setDryRunKey] = useState<string | null>(null)
  const [recipientCount, setRecipientCount] = useState<number | null>(null)
  const [auditId, setAuditId] = useState<string | null>(null)
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState<'dry' | 'send' | null>(null)

  const run = useCallback(
    async (draft: AdminNotificationDraft, dryRun: boolean) => {
      setError(undefined)
      setPending(dryRun ? 'dry' : 'send')
      try {
        const { data } = await mutate({
          variables: {
            input: {
              title: draft.title,
              body: draft.body,
              imageUrl: draft.imageUrl || null,
              userIds: draft.userIds,
              cohortKeys: draft.cohortKeys,
              dryRun,
            },
          },
        })
        const result = data?.adminCreateNotification
        if (!result) {
          setError(t.errorFallback)
          return
        }
        setRecipientCount(result.recipientCount)
        setAuditId(result.auditId ?? null)
        setDryRunKey(adminNotificationDraftKey(draft))
        if (!dryRun) {
          showAppToast({ title: t.sent, type: 'success' })
        }
      } catch (err) {
        setError(
          isGraphQLSchemaMismatch(err)
            ? t.errorFallback
            : getFriendlyErrorMessage(err, t.errorFallback),
        )
      } finally {
        setPending(null)
      }
    },
    [mutate, t],
  )

  if (!isAdmin) {
    return (
      <DashboardPageLayout
        eyebrow={t.eyebrow}
        title={t.unavailableTitle}
        description={t.unavailableBody}
      >
        <Text color="text.muted" maxW="520px">
          {t.unavailableBody}
        </Text>
      </DashboardPageLayout>
    )
  }

  return (
    <DashboardPageLayout
      eyebrow={t.eyebrow}
      title={t.title}
      description={t.description}
    >
      <AdminNotificationComposer
        onDryRun={(draft) => run(draft, true)}
        onSend={(draft) => run(draft, false)}
        dryRunKey={dryRunKey}
        recipientCount={recipientCount}
        auditId={auditId}
        error={error}
        dryRunning={pending === 'dry'}
        sending={pending === 'send'}
      />
    </DashboardPageLayout>
  )
}
