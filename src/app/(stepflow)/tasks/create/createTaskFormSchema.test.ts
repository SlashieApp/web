import {
  Currency,
  TaskBudgetType,
  TaskContactMethod,
  TaskDateTimeType,
  TaskPaymentMethod,
} from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import { createTaskFormSchema } from './createTaskFormSchema'

const valid = {
  title: 'Garden tidy',
  category: 'GENERAL',
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

describe('createTaskFormSchema', () => {
  it('requires the prohibited-use acknowledgement', () => {
    const result = createTaskFormSchema.safeParse({
      ...valid,
      acceptedProhibitedUse: false,
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(
      result.error.flatten().fieldErrors.acceptedProhibitedUse?.[0],
    ).toMatch(/allowed/)
  })

  it('publishes when the notice is accepted', () => {
    expect(createTaskFormSchema.safeParse(valid).success).toBe(true)
  })
})
