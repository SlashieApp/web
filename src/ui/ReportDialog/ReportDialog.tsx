'use client'

import { Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'

import {
  type ReportTargetKind,
  buildReportMailto,
  openReportMailto,
} from '@/content/trust/reportMailto'
import { useI11n } from '@/i18n/useI11n'

import { FormField } from '../FormField/FormField'
import { Modal } from '../Modal/Modal'
import { Select } from '../Select/Select'
import { Textarea } from '../Textarea/Textarea'
import bag from './i11n.json'
import {
  REPORT_REASON_VALUES,
  type ReportFormValues,
  type ReportReasonValue,
  reportFormSchema,
} from './reportFormSchema'

export type ReportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: ReportTargetKind
  targetId: string
  targetTitle?: string
  pageUrl?: string
}

function currentPageUrl(fallback?: string): string | undefined {
  if (fallback?.trim()) return fallback.trim()
  if (typeof window === 'undefined') return undefined
  return window.location.href
}

export function ReportDialog({
  open,
  onOpenChange,
  kind,
  targetId,
  targetTitle,
  pageUrl,
}: ReportDialogProps) {
  const t = useI11n(bag)
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: { details: '' },
  })

  const onSubmit = useCallback(
    (values: ReportFormValues) => {
      const reasonLabel = t.reasons[values.reason as ReportReasonValue]
      openReportMailto(
        buildReportMailto({
          kind,
          id: targetId,
          title: targetTitle,
          url: currentPageUrl(pageUrl),
          reason: reasonLabel,
          details: values.details,
        }),
      )
      onOpenChange(false)
    },
    [kind, onOpenChange, pageUrl, t.reasons, targetId, targetTitle],
  )

  const reasonError = form.formState.errors.reason
    ? t.reasonRequired
    : undefined

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset()
        onOpenChange(next)
      }}
      title={kind === 'worker' ? t.titleWorker : t.titleTask}
      cancelLabel={t.cancel}
      submitLabel={t.submit}
      onSubmit={() => void form.handleSubmit(onSubmit)()}
    >
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        {t.description}
      </Text>
      <FormField label={t.reasonLabel} required errorText={reasonError}>
        <Select {...form.register('reason')}>
          <option value="">{t.reasonPlaceholder}</option>
          {REPORT_REASON_VALUES.map((value) => (
            <option key={value} value={value}>
              {t.reasons[value]}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label={t.detailsLabel}>
        <Textarea
          {...form.register('details')}
          placeholder={t.detailsPlaceholder}
          minH="120px"
        />
      </FormField>
    </Modal>
  )
}
