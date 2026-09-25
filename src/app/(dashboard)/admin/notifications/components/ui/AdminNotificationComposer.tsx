'use client'

import { Checkbox, Grid, HStack, Stack, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import {
  ADMIN_NOTIFICATION_DEFAULTS,
  type AdminNotificationDraft,
  type AdminNotificationFormValues,
  adminNotificationDraftKey,
  adminNotificationFormSchema,
  parseAdminNotificationDraft,
} from '@/content/admin/adminNotificationDraft'
import type { NotificationCohortKey } from '@/content/reviews/reviewModel'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, Card, FormField, Input, Textarea } from '@ui'

import bag from '../../i11n.json'

const COHORTS: {
  key: NotificationCohortKey
  labelKey: 'cohortFounding' | 'cohortGeo'
}[] = [
  { key: 'founding_workers', labelKey: 'cohortFounding' },
  { key: 'geo_watford_bushey', labelKey: 'cohortGeo' },
]

export type AdminNotificationComposerProps = {
  onDryRun: (draft: AdminNotificationDraft) => Promise<void>
  onSend: (draft: AdminNotificationDraft) => Promise<void>
  dryRunKey: string | null
  recipientCount: number | null
  auditId?: string | null
  error?: string
  dryRunning?: boolean
  sending?: boolean
}

export function AdminNotificationComposer({
  onDryRun,
  onSend,
  dryRunKey,
  recipientCount,
  auditId,
  error,
  dryRunning = false,
  sending = false,
}: AdminNotificationComposerProps) {
  const t = useI11n(bag)
  const form = useForm<AdminNotificationFormValues>({
    resolver: zodResolver(adminNotificationFormSchema),
    defaultValues: ADMIN_NOTIFICATION_DEFAULTS,
  })
  const values = form.watch()
  const parsed = parseAdminNotificationDraft({
    ...ADMIN_NOTIFICATION_DEFAULTS,
    ...values,
    title: values.title ?? '',
    body: values.body ?? '',
    imageUrl: values.imageUrl ?? '',
    userIdsText: values.userIdsText ?? '',
    cohortKeys: values.cohortKeys ?? [],
  })
  const draftKey = parsed.ok ? adminNotificationDraftKey(parsed.draft) : null
  const dryRunMatches =
    parsed.ok &&
    dryRunKey != null &&
    dryRunKey === draftKey &&
    recipientCount != null
  const canSend =
    dryRunMatches && (recipientCount ?? 0) > 0 && !sending && !dryRunning

  const submitDryRun = form.handleSubmit(async () => {
    if (!parsed.ok) {
      form.setError('cohortKeys', { message: t.targetRequired })
      return
    }
    await onDryRun(parsed.draft)
  })

  const submitSend = form.handleSubmit(async () => {
    if (!parsed.ok || !canSend) return
    await onSend(parsed.draft)
  })

  return (
    <Grid
      templateColumns={{
        base: '1fr',
        lg: 'minmax(0, 1.2fr) minmax(260px, 0.8fr)',
      }}
      gap={5}
    >
      <Card layout="section" heading={t.title}>
        <Stack gap={4}>
          <FormField
            label={t.titleLabel}
            errorText={form.formState.errors.title?.message}
          >
            <Input {...form.register('title')} />
          </FormField>
          <FormField
            label={t.bodyLabel}
            errorText={form.formState.errors.body?.message}
          >
            <Textarea rows={4} {...form.register('body')} />
          </FormField>
          <FormField
            label={t.imageLabel}
            helperText={t.imageHint}
            errorText={form.formState.errors.imageUrl?.message}
          >
            <Input {...form.register('imageUrl')} inputMode="url" />
          </FormField>
          <FormField
            label={t.usersLabel}
            helperText={t.usersHint}
            errorText={form.formState.errors.userIdsText?.message}
          >
            <Textarea rows={3} {...form.register('userIdsText')} />
          </FormField>
          <Stack gap={2}>
            <Text fontSize="sm" fontWeight={600} color="text.default">
              {t.cohortsLabel}
            </Text>
            <Controller
              name="cohortKeys"
              control={form.control}
              render={({ field }) => (
                <Stack gap={1}>
                  {COHORTS.map((cohort) => {
                    const checked = field.value.includes(cohort.key)
                    return (
                      <Checkbox.Root
                        key={cohort.key}
                        checked={checked}
                        onCheckedChange={(detail) => {
                          const next = new Set(field.value)
                          if (detail.checked) next.add(cohort.key)
                          else next.delete(cohort.key)
                          field.onChange([...next])
                        }}
                        colorPalette="green"
                      >
                        <Checkbox.HiddenInput />
                        <HStack gap={3} minH="44px" align="center">
                          <Checkbox.Control
                            borderRadius="md"
                            borderWidth="0"
                            bg="bg.surface"
                            boxShadow="e1"
                            cursor="pointer"
                            _checked={{
                              bg: 'action.primary',
                              color: 'text.onGreen',
                            }}
                          >
                            <Checkbox.Indicator color="inherit" />
                          </Checkbox.Control>
                          <Checkbox.Label cursor="pointer">
                            {t[cohort.labelKey]}
                          </Checkbox.Label>
                        </HStack>
                      </Checkbox.Root>
                    )
                  })}
                </Stack>
              )}
            />
            {form.formState.errors.cohortKeys?.message ? (
              <Text fontSize="sm" color="status.danger.solid" role="alert">
                {form.formState.errors.cohortKeys.message}
              </Text>
            ) : null}
          </Stack>
          {error ? (
            <Text fontSize="sm" color="status.danger.solid" role="alert">
              {error}
            </Text>
          ) : null}
          {recipientCount != null && dryRunMatches ? (
            <Text fontSize="sm" color="text.default">
              {recipientCount > 0
                ? formatMessage(t.count, { count: recipientCount })
                : t.countZero}
            </Text>
          ) : null}
          {auditId ? (
            <Text fontSize="sm" color="text.muted">
              {formatMessage(t.audit, { id: auditId })}
            </Text>
          ) : null}
          <HStack gap={2} flexWrap="wrap">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void submitDryRun()}
              loading={dryRunning}
              disabled={sending}
            >
              {dryRunning ? t.checking : t.dryRun}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void submitSend()}
              loading={sending}
              disabled={!canSend}
            >
              {sending ? t.sending : t.send}
            </Button>
          </HStack>
        </Stack>
      </Card>
      <Card layout="section" heading={t.preview}>
        <Stack gap={2}>
          <Text fontSize="md" fontWeight={700} color="text.default">
            {values.title?.trim() || t.titleLabel}
          </Text>
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            {values.body?.trim() || t.bodyLabel}
          </Text>
        </Stack>
      </Card>
    </Grid>
  )
}
