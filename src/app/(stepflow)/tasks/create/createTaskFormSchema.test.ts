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
  title: 'Mount a 55-inch TV in the lounge',
  category: 'HANDYMAN',
  description:
    'I have a 55-inch TV and a brick wall. Need it mounted this weekend.',
  streetAddress: '10 Downing Street',
  mapPlaceName: 'Westminster',
  locationLat: '51.5034',
  locationLng: '-0.1276',
  datetimeType: TaskDateTimeType.Flexible,
  preferredDate: '',
  preferredTime: '',
  budgetMajor: '80',
  budgetCurrency: Currency.Gbp,
  budgetType: TaskBudgetType.OneOff,
  paymentMethod: TaskPaymentMethod.Cash,
  preferredContactMethod: TaskContactMethod.InApp,
}

describe('createTaskFormSchema', () => {
  it('accepts a real marketplace task', () => {
    expect(createTaskFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects the FE-142 fixture titles', () => {
    for (const title of ['Test from app', 'starbuck', 'Hi', 'test', 'demo']) {
      const result = createTaskFormSchema.safeParse({ ...valid, title })
      expect(result.success).toBe(false)
    }
  })

  it('rejects placeholder descriptions', () => {
    const result = createTaskFormSchema.safeParse({
      ...valid,
      description: 'I added this from app',
    })
    expect(result.success).toBe(false)
  })
})
