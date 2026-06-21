'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { ChangeEvent } from 'react'
import { useRef } from 'react'
import { LuCalendar, LuPlus, LuX } from 'react-icons/lu'

import { formatBudgetAmount } from '@/utils/price'
import {
  FormField,
  IconButton,
  Input,
  Link,
  Select,
  Textarea,
  formControlRootProps,
} from '@ui'
import type { TextareaProps } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  TASK_QUOTE_STEP_COPY,
  type TaskQuoteSubStepId,
} from '../helpers/taskQuoteSteps.config'
import { TaskQuotePrivateCallout } from './TaskQuotePrivateCallout'
import { TaskQuoteReviewStep } from './TaskQuoteReviewStep'
import { TaskQuoteSummaryCard } from './TaskQuoteSummaryCard'

const MESSAGE_MAX = 250

export const AVAILABILITY_PRESETS = [
  'Tomorrow, 9:00 AM – 12:00 PM',
  'Tomorrow, 1:00 PM – 5:00 PM',
  'This week (flexible)',
  'Next week (flexible)',
  "Let's discuss",
] as const

type TaskQuoteStepContentProps = {
  activeSubStep: TaskQuoteSubStepId
  poundsInput: string
  onPoundsInputChange: (value: string) => void
  photoUrls: string[]
  onPhotoFiles: (list: FileList | null) => void
  onRemovePhotoAt: (index: number) => void
  fieldError: string | null
  quoteError: string | null
  showTaskSummary?: boolean
}

function TaskQuoteOptionalLabel({ children }: { children: string }) {
  return (
    <HStack as="span" gap={2} display="inline-flex">
      <span>{children}</span>
      <Text as="span" fontSize="xs" fontWeight={500} color="formLabelMuted">
        Optional
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
        color="formLabelMuted"
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
    quoteAvailabilityInput,
    setQuoteMessageInput,
    setQuoteAvailabilityInput,
  } = useTaskDetail()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  if (!task) return null

  const priceHelperText = task.budget
    ? `Customer budget: ${formatBudgetAmount(task.budget)}. Enter the total price you'd like to charge.`
    : "Enter the total price you'd like to charge."

  const showSummary =
    showTaskSummary &&
    (activeSubStep === 'quote.price' || activeSubStep === 'review.check')

  switch (activeSubStep) {
    case 'quote.price':
      return (
        <Stack gap={6}>
          {showSummary ? <TaskQuoteSummaryCard /> : null}
          <FormField
            label="Your quote"
            helperText={priceHelperText}
            errorText={fieldError ?? undefined}
          >
            <Input
              inputMode="decimal"
              placeholder="0.00"
              value={poundsInput}
              onChange={(e) => onPoundsInputChange(e.target.value)}
              startElement={
                <Text fontWeight={700} fontSize="sm" color="formControlFg">
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
            label="Message to customer"
            helperText={TASK_QUOTE_STEP_COPY['quote.message'].description}
            errorText={fieldError ?? undefined}
          >
            <TextareaWithCharCount
              rows={5}
              value={quoteMessageInput}
              maxLength={MESSAGE_MAX}
              onChange={(e) => setQuoteMessageInput(e.target.value)}
              placeholder="Hi! I can help with…"
            />
          </FormField>
        </Stack>
      )

    case 'quote.availability':
      return (
        <Stack gap={6}>
          <FormField
            label="Availability"
            helperText={TASK_QUOTE_STEP_COPY['quote.availability'].description}
            icon={<LuCalendar size={20} />}
          >
            <Select
              value={quoteAvailabilityInput}
              onChange={(e) => setQuoteAvailabilityInput(e.target.value)}
              rootProps={formControlRootProps}
            >
              <option value="">Select a time window</option>
              {AVAILABILITY_PRESETS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </FormField>
        </Stack>
      )

    case 'quote.photos':
      return (
        <Stack gap={6}>
          <FormField
            label={<TaskQuoteOptionalLabel>Add photos</TaskQuoteOptionalLabel>}
            helperText={TASK_QUOTE_STEP_COPY['quote.photos'].description}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                onPhotoFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <HStack gap={2} flexWrap="wrap">
              {photoUrls.map((url, i) => (
                <Box key={url} position="relative" w="72px" h="72px">
                  <Box w="full" h="full" rounded="lg" overflow="hidden">
                    <img
                      src={url}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                  <IconButton
                    aria-label="Remove photo"
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
                <IconButton
                  aria-label="Add photo"
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
          {quoteError ? (
            <Text fontSize="sm" color="red.400" role="alert">
              {quoteError}
            </Text>
          ) : null}
          <Text fontSize="xs" color="formLabelMuted" textAlign="center">
            By sending, you agree to Slashie&apos;s{' '}
            <Link href="/terms" color="secondary.600" fontWeight={600}>
              Terms of Service
            </Link>
            . Payment is arranged directly between you and the customer outside
            Slashie.
          </Text>
        </Stack>
      )

    default:
      return null
  }
}
