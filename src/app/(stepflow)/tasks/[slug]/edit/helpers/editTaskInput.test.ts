import {
  Currency,
  TaskBudgetUnit,
  TaskContactMethod,
  TaskDateTimeType,
  TaskPaymentMethod,
} from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import type { EditTaskFormValues } from '../editTaskFormSchema'
import { buildEditTaskInput } from './editTaskInput'

const values: EditTaskFormValues = {
  title: ' Fix a leaking tap ',
  categories: ['Plumbing'],
  description: 'Cold tap drips.',
  streetAddress: '12 Example Street',
  mapPlaceName: 'Westminster, London',
  locationLat: '51.5',
  locationLng: '-0.14',
  datetimeType: TaskDateTimeType.Before,
  preferredDate: '2030-06-10',
  preferredTime: '09:00',
  budgetMajor: '80',
  budgetCurrency: Currency.Gbp,
  budgetUnit: '',
  openBudget: false,
  paymentMethod: TaskPaymentMethod.Cash,
}

const build = (
  dirty: Record<string, unknown>,
  contact: TaskContactMethod | null = null,
  changes: Partial<EditTaskFormValues> = {},
) =>
  buildEditTaskInput({
    values: { ...values, ...changes },
    dirty,
    contact,
    publicName: 'Westminster',
  })

describe('buildEditTaskInput', () => {
  it('sends nothing when nothing changed', () => {
    expect(build({})).toEqual({})
  })

  it('sends only the title when only the title changed', () => {
    expect(build({ title: true })).toEqual({ title: 'Fix a leaking tap' })
  })

  it('sends the whole budget when one part of it changed', () => {
    expect(build({ budgetMajor: true })).toEqual({
      budget: {
        amount: 80,
        currency: Currency.Gbp,
        unit: TaskBudgetUnit.Total,
        customUnit: null,
      },
    })
    expect(
      build({ budgetUnit: true }, null, { budgetUnit: 'per day' }),
    ).toEqual({
      budget: {
        amount: 80,
        currency: Currency.Gbp,
        unit: TaskBudgetUnit.PerDay,
        customUnit: null,
      },
    })
    expect(
      build({ budgetUnit: true }, null, { budgetUnit: ' per  room ' }),
    ).toEqual({
      budget: {
        amount: 80,
        currency: Currency.Gbp,
        unit: TaskBudgetUnit.Custom,
        customUnit: 'per room',
      },
    })
  })

  it('Skip on a priced task opens the budget (BE-139); an open one stays open', () => {
    expect(build({ openBudget: true }, null, { openBudget: true })).toEqual({
      budget: null,
    })
    // Already open: an amount typed then skipped again sends nothing.
    expect(build({ budgetMajor: true }, null, { openBudget: true })).toEqual({})
  })

  it('Add a budget on an open task sends the new budget', () => {
    expect(
      build({ openBudget: true, budgetMajor: true }, null, {
        openBudget: false,
        budgetMajor: '45',
        budgetUnit: 'per visit',
      }),
    ).toEqual({
      budget: {
        amount: 45,
        currency: Currency.Gbp,
        unit: TaskBudgetUnit.PerVisit,
        customUnit: null,
      },
    })
  })

  it('a new way to pay is sent on the task, with or without a budget', () => {
    expect(
      build({ paymentMethod: true }, null, {
        paymentMethod: TaskPaymentMethod.BankTransfer,
      }),
    ).toEqual({ paymentMethod: TaskPaymentMethod.BankTransfer })
    expect(
      build({ paymentMethod: true }, null, {
        openBudget: true,
        paymentMethod: TaskPaymentMethod.BankTransfer,
      }),
    ).toEqual({ paymentMethod: TaskPaymentMethod.BankTransfer })
  })

  it('sends the location with the town workers see when it changed', () => {
    expect(build({ locationLat: true, locationLng: true })).toEqual({
      location: {
        lat: 51.5,
        lng: -0.14,
        name: 'Westminster',
        address: '12 Example Street',
      },
    })
  })

  it('sends the timing when the date changed', () => {
    expect(build({ preferredDate: true })).toEqual({
      datetime: { type: TaskDateTimeType.Before, date: '2030-06-10' },
    })
  })

  it('keeps the contact method unless one was picked', () => {
    expect(build({ title: true })).not.toHaveProperty('preferredContactMethod')
    expect(build({}, TaskContactMethod.Phone)).toEqual({
      preferredContactMethod: TaskContactMethod.Phone,
    })
  })
})
