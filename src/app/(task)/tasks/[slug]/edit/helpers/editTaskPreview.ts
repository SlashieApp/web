import { TaskDateTimeType } from '@codegen/schema'

import { TASK_CREATE_CATEGORY_OPTIONS } from '@/app/(task)/helpers/taskCategories'
import { formatMessage } from '@/i18n/loadPageI11n'
import { formatBudgetAmount } from '@/utils/price'

import { taskDetailLocationTown } from '../../helpers/taskDetailMetaTags'

type WhenCopy = {
  flexible: string
  before: string
  anyTime: string
}

type EditTaskPreviewInput = {
  mapPlaceName: string
  locationLat: string
  locationLng: string
  datetimeType: TaskDateTimeType
  preferredDate: string
  preferredTime: string
  category: string
  budgetMajor: string | number | undefined
  budgetCurrency: string
}

function formatPreviewDate(ymd: string, dateLocale: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null
  const date = new Date(`${ymd}T12:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(dateLocale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/** "Flexible", "Before Sat 19 Sept", or "Sat 19 Sept · 14:00". */
export function editTaskPreviewWhen(
  values: Pick<
    EditTaskPreviewInput,
    'datetimeType' | 'preferredDate' | 'preferredTime'
  >,
  copy: WhenCopy,
  dateLocale: string,
): string {
  if (values.datetimeType === TaskDateTimeType.Flexible) return copy.flexible
  const date = formatPreviewDate(values.preferredDate.trim(), dateLocale)
  if (!date) return copy.flexible
  if (values.datetimeType === TaskDateTimeType.Before) {
    return formatMessage(copy.before, { date })
  }
  const time = values.preferredTime.trim()
  return `${date} · ${time || copy.anyTime}`
}

function toCoordinate(value: string): number | null {
  if (!value.trim()) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/** Maps live edit-form values onto the preview card's labels. */
export function editTaskPreviewLabels(
  values: EditTaskPreviewInput,
  copy: WhenCopy,
  dateLocale: string,
) {
  const place = values.mapPlaceName.trim()
  const category = TASK_CREATE_CATEGORY_OPTIONS.find(
    (option) => option.value === values.category,
  )
  const amount = Number(values.budgetMajor)
  const hasBudget =
    values.budgetMajor !== '' && Number.isFinite(amount) && amount > 0

  return {
    locationLabel: place ? taskDetailLocationTown(place) : null,
    whenLabel: editTaskPreviewWhen(values, copy, dateLocale),
    categoryLabel: category?.label ?? null,
    budgetLabel: hasBudget
      ? formatBudgetAmount({ amount, currency: values.budgetCurrency })
      : null,
    lat: toCoordinate(values.locationLat),
    lng: toCoordinate(values.locationLng),
  }
}
