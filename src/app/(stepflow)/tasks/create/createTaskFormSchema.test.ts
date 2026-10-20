import {
  Currency,
  TaskBudgetType,
  TaskContactMethod,
  TaskDateTimeType,
  TaskPaymentMethod,
} from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  createTaskFormSchema,
  isCalendarDate,
  londonToday,
} from './createTaskFormSchema'

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

/** A day relative to today in London, as the API counts days. */
const daysFromToday = (days: number) => {
  const d = new Date(`${londonToday()}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
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

  it('turns down a date that is not a real day', () => {
    expect(
      fieldError(
        { datetimeType: TaskDateTimeType.Before, preferredDate: '2030-02-30' },
        'preferredDate',
      ),
    ).toBe('dateInvalid')
    expect(
      fieldError(
        { datetimeType: TaskDateTimeType.Exact, preferredDate: '30/01/2030' },
        'preferredDate',
      ),
    ).toBe('dateInvalid')
  })

  it('needs a date for before and exact, but not for flexible', () => {
    expect(
      fieldError(
        { datetimeType: TaskDateTimeType.Before, preferredDate: '' },
        'preferredDate',
      ),
    ).toBe('dateRequired')
    expect(
      fieldError(
        { datetimeType: TaskDateTimeType.Flexible, preferredDate: '' },
        'preferredDate',
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

describe('londonToday', () => {
  it('is the date in London, not the device time zone', () => {
    // 23:30 UTC on 20 October is 00:30 on the 21st in London (BST).
    expect(londonToday(new Date('2026-10-20T23:30:00Z'))).toBe('2026-10-21')
    // In winter London is on UTC.
    expect(londonToday(new Date('2026-12-31T23:30:00Z'))).toBe('2026-12-31')
  })
})

describe('isCalendarDate', () => {
  it('takes real YYYY-MM-DD days only', () => {
    expect(isCalendarDate('2028-02-29')).toBe(true)
    expect(isCalendarDate('2027-02-29')).toBe(false)
    expect(isCalendarDate('2027-1-05')).toBe(false)
  })
})
