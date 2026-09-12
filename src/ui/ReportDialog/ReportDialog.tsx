'use client'

import { Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'

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
  type ReportTargetKind,
  reportFormSchema,
} from './reportFormSchema'

export type ReportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: ReportTargetKind
  onSubmit: (values: ReportFormValues) => Promise<boolean>
  submitting?: boolean
  submitError?: string
}

export function ReportDialog({
  open,
  onOpenChange,
  kind,
  onSubmit,
  submitting = false,
  submitError,
}: ReportDialogProps) {
  const t = useI11n(bag)
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: { details: '' },
  })

  const handleSubmit = useCallback(
    async (values: ReportFormValues) => {
      if (submitting) return
      const ok = await onSubmit(values)
      if (ok === false) return
      form.reset({ details: '' })
      onOpenChange(false)
    },
    [form, onOpenChange, onSubmit, submitting],
  )

  const reasonError = form.formState.errors.reason
    ? t.reasonRequired
    : undefined

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset({ details: '' })
        onOpenChange(next)
      }}
      title={kind === 'worker' ? t.titleWorker : t.titleTask}
      cancelLabel={t.cancel}
      submitLabel={t.submit}
      submitLoading={submitting}
      submitDisabled={submitting}
      onSubmit={() => void form.handleSubmit(handleSubmit)()}
    >
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        {t.description}
      </Text>
      <FormField label={t.reasonLabel} required errorText={reasonError}>
        <Select {...form.register('reason')} defaultValue="">
          <option value="" disabled>
            {t.reasonPlaceholder}
          </option>
          {REPORT_REASON_VALUES.map((value) => (
            <option key={value} value={value}>
              {t.reasons[value as ReportReasonValue]}
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
      {submitError ? (
        <Text fontSize="sm" color="status.danger.fg">
          {submitError}
        </Text>
      ) : null}
    </Modal>
  )
}
