'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import {
  type Currency,
  TaskDateTimeType,
  type TaskPaymentMethod,
} from '@codegen/schema'
import type { ReactNode } from 'react'

import {
  budgetPhrase,
  budgetUnitFromText,
  taskBudgetBag,
} from '@/app/(task)/helpers/taskBudget/taskBudget'
import {
  paymentMethodsLine,
  taskPaymentBag,
} from '@/app/(task)/helpers/taskPayment/taskPayment'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button } from '@ui'

import bag from '../../../i11n.json'
import type { CreateTaskStepId } from '../../../views'

export type CreateTaskSummary = {
  title: string
  description: string
  categories: string[]
  /** The town workers see (empty while it is looked up). */
  area: string
  /** Private: only the worker the poster accepts gets it. */
  streetAddress: string
  datetimeType: TaskDateTimeType
  preferredDate: string
  preferredTime: string
  budgetMajor: string
  budgetCurrency: Currency
  /** The unit field's text (FE-584). */
  budgetUnit: string
  /** Skipped: shown as "Open budget". */
  openBudget: boolean
  /** Every method the poster accepts (FE-599). */
  paymentMethods: readonly TaskPaymentMethod[]
  photoCount: number
}

export type CreateTaskSummarySectionProps = {
  summary: CreateTaskSummary
  onEdit: (step: CreateTaskStepId) => void
}

/** The amount as typed: £80, or £23.50. */
function money(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function Row({
  label,
  editLabel,
  onEdit,
  children,
}: {
  label: string
  editLabel: string
  onEdit: () => void
  children: ReactNode
}) {
  const edit = useI11n(bag).summary.edit
  return (
    <HStack
      align="flex-start"
      gap={3}
      py={3}
      borderTopWidth="1px"
      borderColor="border.default"
      _first={{ borderTopWidth: 0, pt: 0 }}
    >
      <Stack gap={0.5} flex={1} minW={0}>
        <Text fontSize="xs" fontWeight={500} color="text.muted">
          {label}
        </Text>
        <Box fontSize="sm" color="text.default">
          {children}
        </Box>
      </Stack>
      <Button
        type="button"
        variant="ghost"
        minH="44px"
        color="text.link"
        aria-label={editLabel}
        onClick={onEdit}
      >
        {edit}
      </Button>
    </HStack>
  )
}

/**
 * Review step (FE-295): what workers will see, one row per answer, and the
 * exact address marked as shared only with the worker you accept. Each row
 * goes back to the step that asks for it.
 */
export function CreateTaskSummarySection({
  summary,
  onEdit,
}: CreateTaskSummarySectionProps) {
  const t = useI11n(bag)
  const units = useI11n(taskBudgetBag)
  const paymentCopy = useI11n(taskPaymentBag)
  const s = t.summary
  const locale = useLocale() === 'zh-hk' ? 'zh-HK' : 'en-GB'
  const editLabel = (step: CreateTaskStepId) =>
    formatMessage(s.editStep, { step: t.steps[step].label })

  const day = (ymd: string) =>
    new Date(`${ymd}T12:00:00`).toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  const when =
    summary.datetimeType === TaskDateTimeType.Before && summary.preferredDate
      ? formatMessage(s.before, { date: day(summary.preferredDate) })
      : summary.datetimeType === TaskDateTimeType.Exact && summary.preferredDate
        ? formatMessage(s.exact, {
            date: day(summary.preferredDate),
            time: summary.preferredTime,
          })
        : s.flexible

  const amount = Number.parseFloat(summary.budgetMajor)
  const price = Number.isFinite(amount)
    ? money(amount, summary.budgetCurrency)
    : ''
  const budget = summary.openBudget
    ? units.open
    : budgetPhrase(price, budgetUnitFromText(summary.budgetUnit), units)
  const payment = paymentMethodsLine(summary, paymentCopy)
  const photos =
    summary.photoCount === 0
      ? s.noPhotos
      : summary.photoCount === 1
        ? s.onePhoto
        : formatMessage(s.photoCount, { count: summary.photoCount })

  return (
    <Stack
      gap={0}
      p={4}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.subtle"
    >
      <Text as="h2" fontSize="md" fontWeight={500} pb={3}>
        {s.heading}
      </Text>
      <Row
        label={s.task}
        editLabel={editLabel('details')}
        onEdit={() => onEdit('details')}
      >
        <Text fontWeight={500}>{summary.title}</Text>
        <Text color="text.muted" lineClamp={2}>
          {summary.description}
        </Text>
        <Text color="text.muted">{summary.categories.join(' · ')}</Text>
      </Row>
      <Row
        label={s.area}
        editLabel={editLabel('location')}
        onEdit={() => onEdit('location')}
      >
        {summary.area || t.location.areaPending}
      </Row>
      <Row
        label={t.location.addressLabel}
        editLabel={editLabel('address')}
        onEdit={() => onEdit('address')}
      >
        <Text>{summary.streetAddress}</Text>
        <Text color="text.muted">{t.location.addressHelper}</Text>
      </Row>
      <Row
        label={s.when}
        editLabel={editLabel('timing')}
        onEdit={() => onEdit('timing')}
      >
        {when}
      </Row>
      <Row
        label={s.budget}
        editLabel={editLabel('budget')}
        onEdit={() => onEdit('budget')}
      >
        {[budget, payment].filter(Boolean).join(' · ')}
      </Row>
      <Row
        label={s.photos}
        editLabel={editLabel('photos')}
        onEdit={() => onEdit('photos')}
      >
        {photos}
      </Row>
    </Stack>
  )
}
