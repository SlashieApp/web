'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'

import { useI11n } from '@/i18n/useI11n'

import { Avatar } from '../Avatar/Avatar'
import { FormField } from '../FormField/FormField'
import { Modal } from '../Modal/Modal'
import { Select } from '../Select/Select'
import { Textarea } from '../Textarea/Textarea'
import { Thumbnail } from '../Thumbnail/Thumbnail'
import bag from './i11n.json'
import {
  REPORT_REASON_VALUES,
  type ReportFormValues,
  type ReportReasonValue,
  type ReportTargetKind,
  reportFormSchema,
} from './reportFormSchema'
import { reportKindPhrases } from './reportKindCopy'

export type ReportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: ReportTargetKind
  /** Listing or profile name shown so the reporter can confirm the target. */
  targetTitle?: string
  /** Secondary line (location, category, area). */
  targetMeta?: string
  /** Task photo or worker avatar. */
  targetImageSrc?: string
  onSubmit: (values: ReportFormValues) => Promise<boolean>
  submitting?: boolean
  submitError?: string
}

export function ReportDialog({
  open,
  onOpenChange,
  kind,
  targetTitle,
  targetMeta,
  targetImageSrc,
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
      title={reportKindPhrases(kind, t).title}
      cancelLabel={t.cancel}
      submitLabel={t.submit}
      submitLoading={submitting}
      submitDisabled={submitting}
      onSubmit={() => void form.handleSubmit(handleSubmit)()}
    >
      {targetTitle ? (
        <Stack
          gap={2}
          p={3}
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="md"
          bg="bg.subtle"
        >
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.06em"
            textTransform="uppercase"
            color="text.muted"
          >
            {reportKindPhrases(kind, t).subject}
          </Text>
          <HStack align="start" gap={3} minW={0}>
            {kind === 'review' ? null : kind === 'worker' ? (
              <Avatar name={targetTitle} src={targetImageSrc} size="lg" />
            ) : (
              <Thumbnail
                src={targetImageSrc}
                alt=""
                size="sm"
                w="56px"
                h="56px"
                minW="56px"
                flexShrink={0}
                borderRadius="lg"
                aria-hidden
              />
            )}
            <Stack gap={0.5} minW={0}>
              <Text
                fontWeight={700}
                fontSize="sm"
                color="text.default"
                lineClamp={2}
              >
                {targetTitle}
              </Text>
              {targetMeta ? (
                <Text fontSize="xs" color="text.muted" lineClamp={2}>
                  {targetMeta}
                </Text>
              ) : null}
            </Stack>
          </HStack>
        </Stack>
      ) : null}
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
