import {
  Currency,
  TaskBudgetType,
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
  budgetType: TaskBudgetType.OneOff,
  paymentMethod: TaskPaymentMethod.Cash,
}

const build = (
  dirty: Record<string, unknown>,
  contact: TaskContactMethod | null = null,
) => buildEditTaskInput({ values, dirty, contact, publicName: 'Westminster' })

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
        type: TaskBudgetType.OneOff,
        paymentMethod: TaskPaymentMethod.Cash,
      },
    })
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
