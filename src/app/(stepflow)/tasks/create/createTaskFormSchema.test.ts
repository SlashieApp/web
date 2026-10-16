import {
  Currency,
  TaskBudgetType,
  TaskContactMethod,
  TaskDateTimeType,
  TaskPaymentMethod,
} from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import { createTaskFormSchema, toYmd } from './createTaskFormSchema'

const valid = {
  title: 'Garden tidy',
  categories: ['General'],
  description: 'Clear the patio and bag the waste.',
  streetAddress: '1 High Street',
  mapPlaceName: 'Clapham',
  locationLat: '51.46',
  locationLng: '-0.14',
  datetimeType: TaskDateTimeType.Flexible,
  preferredDate: '',
  preferredTime: '',
  budgetMajor: '80',
  budgetCurrency: Currency.Gbp,
  budgetType: TaskBudgetType.OneOff,
  paymentMethod: TaskPaymentMethod.Cash,
  preferredContactMethod: TaskContactMethod.InApp,
  acceptedProhibitedUse: true,
}

const fieldError = (input: Partial<typeof valid>, field: string) => {
  const result = createTaskFormSchema.safeParse({ ...valid, ...input })
  if (result.success) return undefined
  return (
    result.error.flatten().fieldErrors as Record<string, string[] | undefined>
  )[field]?.[0]
}

const daysFromToday = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toYmd(d)
}

describe('createTaskFormSchema', () => {
  it('requires the allowed-tasks confirmation', () => {
    expect(
      fieldError({ acceptedProhibitedUse: false }, 'acceptedProhibitedUse'),
    ).toBe('consentRequired')
  })

  it('publishes when the notice is accepted', () => {
    expect(createTaskFormSchema.safeParse(valid).success).toBe(true)
  })

  it('names each missing answer with a copy key', () => {
    expect(fieldError({ title: ' ' }, 'title')).toBe('titleRequired')
    expect(fieldError({ budgetMajor: '0' }, 'budgetMajor')).toBe(
      'budgetRequired',
    )
    expect(fieldError({ categories: [] }, 'categories')).toBe(
      'categoryRequired',
    )
  })

  it('turns down a date that has passed', () => {
    expect(
      fieldError(
        {
          datetimeType: TaskDateTimeType.Before,
          preferredDate: daysFromToday(-1),
        },
        'preferredDate',
      ),
    ).toBe('dateInPast')
  })

  it('takes today or later', () => {
    expect(
      fieldError(
        {
          datetimeType: TaskDateTimeType.Before,
          preferredDate: daysFromToday(0),
        },
        'preferredDate',
      ),
    ).toBeUndefined()
    expect(
      fieldError(
        {
          datetimeType: TaskDateTimeType.Exact,
          preferredDate: daysFromToday(3),
          preferredTime: '14:30',
        },
        'preferredTime',
      ),
    ).toBeUndefined()
  })

  it('needs a time for a date and time', () => {
    expect(
      fieldError(
        {
          datetimeType: TaskDateTimeType.Exact,
          preferredDate: daysFromToday(3),
          preferredTime: '',
        },
        'preferredTime',
      ),
    ).toBe('timeRequired')
  })
})
