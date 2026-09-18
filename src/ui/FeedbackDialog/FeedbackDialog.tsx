'use client'

import { Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'

import { useI11n } from '@/i18n/useI11n'

import { FormField } from '../FormField/FormField'
import { Input } from '../Input/Input'
import { Modal } from '../Modal/Modal'
import { Select } from '../Select/Select'
import { Textarea } from '../Textarea/Textarea'
import { StarRatingInput } from './StarRatingInput'
import {
  FEEDBACK_CATEGORY_VALUES,
  FEEDBACK_FORM_DEFAULTS,
  type FeedbackCategoryValue,
  type FeedbackFormValues,
  feedbackFormSchema,
} from './feedbackFormSchema'
import bag from './i11n.json'

export type FeedbackDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: FeedbackFormValues) => Promise<boolean>
  submitting?: boolean
  submitError?: string
  defaultEmail?: string
  defaultName?: string
  emailLocked?: boolean
}

function fieldError(
  message: string | undefined,
  fallback: string,
): string | undefined {
  return message ? fallback : undefined
}

export function FeedbackDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
  submitError,
  defaultEmail = '',
  defaultName = '',
  emailLocked = false,
}: FeedbackDialogProps) {
  const t = useI11n(bag)
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      ...FEEDBACK_FORM_DEFAULTS,
      email: defaultEmail,
      name: defaultName,
    },
  })

  const category = form.watch('category')
  const rating = form.watch('rating')
  const ratingRequired = category === 'RATING'

  const resetForm = useCallback(() => {
    form.reset({
      ...FEEDBACK_FORM_DEFAULTS,
      email: defaultEmail,
      name: defaultName,
    })
  }, [defaultEmail, defaultName, form])

  const handleSubmit = useCallback(
    async (values: FeedbackFormValues) => {
      if (submitting) return
      const ok = await onSubmit(values)
      if (ok === false) return
      resetForm()
      onOpenChange(false)
    },
    [onOpenChange, onSubmit, resetForm, submitting],
  )

  const categoryError = form.formState.errors.category
    ? t.categoryRequired
    : undefined
  const messageError = fieldError(
    form.formState.errors.message?.message,
    t.messageRequired,
  )
  const emailError = form.formState.errors.email
    ? form.formState.errors.email.message?.includes('valid')
      ? t.emailInvalid
      : t.emailRequired
    : undefined
  const ratingError = form.formState.errors.rating
    ? t.ratingRequired
    : undefined

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm()
        onOpenChange(next)
      }}
      title={t.title}
      cancelLabel={t.cancel}
      submitLabel={t.submit}
      submitLoading={submitting}
      submitDisabled={submitting}
      onSubmit={() => void form.handleSubmit(handleSubmit)()}
    >
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        {t.description}
      </Text>
      <FormField label={t.categoryLabel} required errorText={categoryError}>
        <Select {...form.register('category')}>
          {FEEDBACK_CATEGORY_VALUES.map((value) => (
            <option key={value} value={value}>
              {t.categories[value as FeedbackCategoryValue]}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField
        label={t.ratingLabel}
        required={ratingRequired}
        helperText={ratingRequired ? undefined : t.ratingHelper}
        errorText={ratingError}
      >
        <StarRatingInput
          value={rating}
          disabled={submitting}
          onChange={(next) =>
            form.setValue('rating', next, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      </FormField>
      <FormField label={t.messageLabel} required errorText={messageError}>
        <Textarea
          {...form.register('message')}
          placeholder={t.messagePlaceholder}
          minH="120px"
        />
      </FormField>
      <FormField label={t.nameLabel}>
        <Input {...form.register('name')} autoComplete="name" />
      </FormField>
      <FormField
        label={t.emailLabel}
        required
        errorText={emailError}
        helperText={emailLocked ? t.emailLockedHint : t.emailGuestHint}
      >
        <Input
          {...form.register('email')}
          type="email"
          autoComplete="email"
          readOnly={emailLocked}
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
