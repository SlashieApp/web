'use client'

import { Stack, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useI11n } from '@/i18n/useI11n'

import { StarRatingInput } from '../FeedbackDialog/StarRatingInput'
import { FormField } from '../FormField/FormField'
import { Modal } from '../Modal/Modal'
import { Textarea } from '../Textarea/Textarea'
import bag from './i11n.json'
import {
  REVIEW_FORM_DEFAULTS,
  type ReviewFormValues,
  reviewFormSchema,
} from './reviewFormSchema'

export type ReviewFormMode = 'create' | 'edit' | 'locked'

export type ReviewFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: ReviewFormMode
  defaultRating?: number
  defaultComment?: string
  onSubmit?: (values: ReviewFormValues) => Promise<boolean>
  submitting?: boolean
  submitError?: string
  /** Existing-review report control. Create mode leaves this empty. */
  report?: ReactNode
}

function ReviewFormFields({
  mode,
  defaultRating,
  defaultComment,
  onSubmit,
  submitting,
  submitError,
  report,
  onOpenChange,
}: Omit<ReviewFormProps, 'open'>) {
  const t = useI11n(bag)
  const locked = mode === 'locked'
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: defaultRating,
      comment: defaultComment ?? REVIEW_FORM_DEFAULTS.comment,
    },
  })

  const handleSubmit = useCallback(
    async (values: ReviewFormValues) => {
      if (submitting || locked || !onSubmit) return
      const ok = await onSubmit(values)
      if (ok === false) return
      onOpenChange(false)
    },
    [locked, onOpenChange, onSubmit, submitting],
  )

  const ratingError = form.formState.errors.rating ? t.starsRequired : undefined
  const title =
    mode === 'edit' ? t.titleEdit : locked ? t.titleLocked : t.titleCreate

  return (
    <Modal
      open
      onOpenChange={onOpenChange}
      title={title}
      size="md"
      cancelLabel={locked ? t.close : t.cancel}
      submitLabel={locked ? undefined : mode === 'edit' ? t.save : t.submit}
      submitLoading={submitting}
      submitDisabled={submitting || locked}
      onSubmit={
        locked ? undefined : () => void form.handleSubmit(handleSubmit)()
      }
    >
      <Stack gap={4}>
        <FormField
          label={t.starsLabel}
          helperText={locked ? undefined : t.starsHint}
          errorText={ratingError}
        >
          <Controller
            name="rating"
            control={form.control}
            render={({ field }) => (
              <StarRatingInput
                value={field.value}
                onChange={field.onChange}
                disabled={locked}
              />
            )}
          />
        </FormField>
        <FormField label={t.commentLabel}>
          <Textarea
            rows={4}
            placeholder={t.commentPlaceholder}
            disabled={locked}
            readOnly={locked}
            {...form.register('comment')}
          />
        </FormField>
        {locked ? (
          <Text fontSize="sm" color="text.muted">
            {t.locked}
          </Text>
        ) : null}
        <Text
          fontSize="sm"
          color="text.muted"
          lineHeight="tall"
          bg="bg.subtle"
          borderRadius="lg"
          px={3}
          py={3}
        >
          {t.disclaimer}
        </Text>
        {submitError ? (
          <Text fontSize="sm" color="status.danger.solid" role="alert">
            {submitError}
          </Text>
        ) : null}
        {report}
      </Stack>
    </Modal>
  )
}

/**
 * Reusable C2C review dialog: 1–5 stars, optional comment, and the
 * terms disclaimer. Create, edit (≤48h), and locked states share one form.
 */
export function ReviewForm({
  open,
  mode = 'create',
  defaultRating,
  defaultComment,
  ...rest
}: ReviewFormProps) {
  if (!open) {
    return (
      <Modal open={false} onOpenChange={rest.onOpenChange} title="">
        {null}
      </Modal>
    )
  }
  return (
    <ReviewFormFields
      key={`${mode}-${defaultRating ?? ''}-${defaultComment ?? ''}`}
      mode={mode}
      defaultRating={defaultRating}
      defaultComment={defaultComment}
      {...rest}
    />
  )
}
