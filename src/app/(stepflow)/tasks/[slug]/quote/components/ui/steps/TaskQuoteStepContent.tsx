'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { ChangeEvent } from 'react'
import { useRef } from 'react'
import { LuCamera, LuPlus, LuX } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { formatBudgetAmount } from '@/utils/price'
import {
  FormField,
  IconButton,
  Input,
  Link,
  Textarea,
  TimeSlotPicker,
  formControlRootProps,
  useTakePhoto,
} from '@ui'
import type { TextareaProps } from '@ui'

import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import type { TaskQuoteSubStepId } from '../../../helpers/taskQuoteSteps.config'
import bag from '../../../i11n.json'
import { TaskQuotePrivateCallout } from '../shared/TaskQuotePrivateCallout'
import { TaskQuoteSummaryCard } from '../shared/TaskQuoteSummaryCard'
import { TaskQuoteReviewStep } from './TaskQuoteReviewStep'

const MESSAGE_MAX = 250

type TaskQuoteStepContentProps = {
  activeSubStep: TaskQuoteSubStepId
  poundsInput: string
  onPoundsInputChange: (value: string) => void
  photoUrls: string[]
  onPhotoFiles: (files: File[]) => void
  onRemovePhotoAt: (index: number) => void
  fieldError: string | null
  quoteError: string | null
  showTaskSummary?: boolean
}

function TaskQuoteOptionalLabel({ children }: { children: string }) {
  const optional = useI11n(bag).optional
  return (
    <HStack as="span" gap={2} display="inline-flex">
      <span>{children}</span>
      <Text as="span" fontSize="xs" fontWeight={500} color="text.muted">
        {optional}
      </Text>
    </HStack>
  )
}

function TextareaWithCharCount({
  value,
  maxLength,
  onChange,
  ...rest
}: TextareaProps & {
  value: string
  maxLength: number
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <Box position="relative" w="full">
      <Textarea
        value={value}
        maxLength={maxLength}
        pb={10}
        onChange={onChange}
        {...rest}
      />
      <Text
        position="absolute"
        bottom={3}
        right={4}
        fontSize="xs"
        color="text.muted"
        pointerEvents="none"
      >
        {value.length}/{maxLength}
      </Text>
    </Box>
  )
}

export function TaskQuoteStepContent({
  activeSubStep,
  poundsInput,
  onPoundsInputChange,
  photoUrls,
  onPhotoFiles,
  onRemovePhotoAt,
  fieldError,
  quoteError,
  showTaskSummary = false,
}: TaskQuoteStepContentProps) {
  const {
    task,
    quoteMessageInput,
    quoteSlots,
    setQuoteMessageInput,
    setQuoteSlots,
  } = useTaskDetail()
  const t = useI11n(bag)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  // Phones and tablets: the back camera, for the job itself.
  const camera = useTakePhoto({ capture: 'environment', onFiles: onPhotoFiles })

  if (!task) return null

  const priceHelperText = task.budget
    ? formatMessage(t.price.helperWithBudget, {
        budget: formatBudgetAmount(task.budget),
      })
    : t.price.helper
  const [termsBefore, termsAfter = ''] = t.review.terms.split('{terms}')

  const showSummary =
    showTaskSummary &&
    (activeSubStep === 'quote.price' || activeSubStep === 'review.check')

  switch (activeSubStep) {
    case 'quote.price':
      return (
        <Stack gap={6}>
          {showSummary ? <TaskQuoteSummaryCard /> : null}
          <FormField
            label={t.price.label}
            helperText={priceHelperText}
            errorText={fieldError ?? undefined}
          >
            <Input
              inputMode="decimal"
              placeholder="0.00"
              value={poundsInput}
              onChange={(e) => onPoundsInputChange(e.target.value)}
              startElement={
                <Text fontWeight={700} fontSize="sm" color="text.default">
                  £
                </Text>
              }
              rootProps={formControlRootProps}
            />
          </FormField>
        </Stack>
      )

    case 'quote.message':
      return (
        <Stack gap={6}>
          <FormField
            label={t.message.label}
            helperText={t.steps['quote.message'].description}
            errorText={fieldError ?? undefined}
          >
            <TextareaWithCharCount
              rows={5}
              value={quoteMessageInput}
              maxLength={MESSAGE_MAX}
              onChange={(e) => setQuoteMessageInput(e.target.value)}
              placeholder={t.message.placeholder}
            />
          </FormField>
        </Stack>
      )

    case 'quote.availability':
      return (
        <Stack gap={4}>
          <TimeSlotPicker
            value={quoteSlots}
            onChange={setQuoteSlots}
            showErrors={Boolean(fieldError)}
          />
          {fieldError ? (
            <Text fontSize="sm" color="status.danger.fg" role="alert">
              {fieldError}
            </Text>
          ) : null}
        </Stack>
      )

    case 'quote.photos':
      return (
        <Stack gap={6}>
          <FormField
            label={
              <TaskQuoteOptionalLabel>{t.photos.label}</TaskQuoteOptionalLabel>
            }
            helperText={t.steps['quote.photos'].description}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                // Copy first: clearing the input empties its FileList.
                onPhotoFiles(Array.from(e.target.files ?? []))
                e.target.value = ''
              }}
            />
            <input {...camera.inputProps} />
            <HStack gap={2} flexWrap="wrap">
              {photoUrls.map((url, i) => (
                <Box key={url} position="relative" w="72px" h="72px">
                  <Box w="full" h="full" rounded="lg" overflow="hidden">
                    <img
                      src={url}
                      alt={formatMessage(t.photos.alt, { number: i + 1 })}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                  <IconButton
                    aria-label={formatMessage(t.photos.remove, {
                      number: i + 1,
                    })}
                    position="absolute"
                    top={1}
                    right={1}
                    variant="ghost"
                    onClick={() => onRemovePhotoAt(i)}
                  >
                    <LuX size={14} />
                  </IconButton>
                </Box>
              ))}
              {photoUrls.length < 6 ? (
                <>
                  <IconButton
                    aria-label={t.photos.add}
                    variant="outline"
                    w="72px"
                    h="72px"
                    minW="72px"
                    minH="72px"
                    rounded="lg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <LuPlus size={22} />
                  </IconButton>
                  <IconButton
                    {...camera.triggerProps}
                    aria-label={t.photos.take}
                    variant="outline"
                    w="72px"
                    h="72px"
                    minW="72px"
                    minH="72px"
                    rounded="lg"
                    onClick={camera.open}
                  >
                    <LuCamera size={22} />
                  </IconButton>
                </>
              ) : null}
            </HStack>
          </FormField>
        </Stack>
      )

    case 'review.check':
      return (
        <Stack gap={6}>
          {showSummary ? <TaskQuoteSummaryCard /> : null}
          <TaskQuoteReviewStep photoUrls={photoUrls} />
          <TaskQuotePrivateCallout />
          {quoteError || fieldError ? (
            <Text fontSize="sm" color="status.danger.fg" role="alert">
              {quoteError ?? fieldError}
            </Text>
          ) : null}
          <Text fontSize="xs" color="text.muted" textAlign="center">
            {termsBefore}
            <Link href="/terms" color="text.link" fontWeight={600}>
              {t.review.termsLink}
            </Link>
            {termsAfter}
          </Text>
        </Stack>
      )

    default:
      return null
  }
}
