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
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { formSpace, hitAreaGrowth } from '@/theme/styles'
import { AdminCohortKey } from '@codegen/schema'
import {
  Button,
  Card,
  FormField,
  FormStack,
  Input,
  Textarea,
  formControlLabelProps,
} from '@ui'

import bag from '../../i11n.json'

const COHORTS: {
  key: AdminCohortKey
  labelKey: 'cohortFounding' | 'cohortGeo'
}[] = [
  { key: AdminCohortKey.FoundingWorkers, labelKey: 'cohortFounding' },
  { key: AdminCohortKey.GeoWatfordBushey, labelKey: 'cohortGeo' },
]

/** A cohort row is one line of its label: 20 tall, like the checkbox. */
const COHORT_LINE_HEIGHT = 20

/** How far a row's tap target reaches above and below it: half the gap between rows. */
const COHORT_REACH = formSpace.alternativesGap / 2

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
      {/* Form spacing (FE-481): the heading is `headerToBody` (24) above the
          first field, the fields, the status lines and the buttons are a
          `FormStack` (20 apart, the buttons 20 under the last line). */}
      <Card layout="section" heading={t.title} bodyGap="form.headerToBody">
        <FormStack>
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
          <Stack gap={0}>
            <Text {...formControlLabelProps} px={1}>
              {t.cohortsLabel}
            </Text>
            <Controller
              name="cohortKeys"
              control={form.control}
              render={({ field }) => (
                <Stack gap="form.alternativesGap">
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
                        <HStack
                          gap={3}
                          align="flex-start"
                          // Rows are 8 apart, so each takes half of that: a 44 target
                          // would overlap its neighbours by 16 and the lower row
                          // would win, leaving the upper one 28 and giving a click
                          // on its last 4px to the next box.
                          {...hitAreaGrowth(
                            COHORT_LINE_HEIGHT,
                            COHORT_REACH,
                            COHORT_REACH,
                          )}
                        >
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
                          <Checkbox.Label
                            cursor="pointer"
                            lineHeight={`${COHORT_LINE_HEIGHT}px`}
                          >
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
              <Text
                mt="form.controlToHelper"
                fontSize="sm"
                color="status.danger.solid"
                role="alert"
              >
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
          <HStack gap="form.alternativesGap" flexWrap="wrap">
            <Button
              type="button"
              variant="secondary"
              size="form"
              onClick={() => void submitDryRun()}
              loading={dryRunning}
              disabled={sending}
            >
              {dryRunning ? t.checking : t.dryRun}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="form"
              onClick={() => void submitSend()}
              loading={sending}
              disabled={!canSend}
            >
              {sending ? t.sending : t.send}
            </Button>
          </HStack>
        </FormStack>
      </Card>
      <Card layout="section" heading={t.preview}>
        <Stack gap={2}>
          <Text fontSize="md" fontWeight={500} color="text.default">
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
