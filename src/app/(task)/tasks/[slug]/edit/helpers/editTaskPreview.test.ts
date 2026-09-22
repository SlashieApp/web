import { Currency, TaskDateTimeType } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import { editTaskPreviewLabels, editTaskPreviewWhen } from './editTaskPreview'

const copy = {
  flexible: 'Flexible',
  before: 'Before {date}',
  anyTime: 'Any time',
}

describe('editTaskPreviewWhen', () => {
  it('shows flexible without a date', () => {
    expect(
      editTaskPreviewWhen(
        {
          datetimeType: TaskDateTimeType.Flexible,
          preferredDate: '2026-09-19',
          preferredTime: '',
        },
        copy,
        'en-GB',
      ),
    ).toBe('Flexible')
  })

  it('prefixes a before date', () => {
    expect(
      editTaskPreviewWhen(
        {
          datetimeType: TaskDateTimeType.Before,
          preferredDate: '2026-09-19',
          preferredTime: '',
        },
        copy,
        'en-GB',
      ),
    ).toBe('Before Sat 19 Sept')
  })

  it('joins an exact date and time, falling back to any time', () => {
    const base = {
      datetimeType: TaskDateTimeType.Exact,
      preferredDate: '2026-09-19',
    }
    expect(
      editTaskPreviewWhen({ ...base, preferredTime: '14:00' }, copy, 'en-GB'),
    ).toBe('Sat 19 Sept · 14:00')
    expect(
      editTaskPreviewWhen({ ...base, preferredTime: '' }, copy, 'en-GB'),
    ).toBe('Sat 19 Sept · Any time')
  })
})

describe('editTaskPreviewLabels', () => {
  it('maps form values onto preview labels', () => {
    expect(
      editTaskPreviewLabels(
        {
          mapPlaceName:
            '52 St. Katharine’s Way, Tower Hamlets, London, E1W 1LP, United Kingdom',
          locationLat: '51.5065',
          locationLng: '-0.0719',
          datetimeType: TaskDateTimeType.Flexible,
          preferredDate: '',
          preferredTime: '',
          category: 'DELIVERY',
          budgetMajor: '23',
          budgetCurrency: Currency.Gbp,
        },
        copy,
        'en-GB',
      ),
    ).toEqual({
      locationLabel: 'London',
      whenLabel: 'Flexible',
      categoryLabel: 'Delivery',
      budgetLabel: '£23',
      lat: 51.5065,
      lng: -0.0719,
    })
  })

  it('drops empty budget and location', () => {
    const labels = editTaskPreviewLabels(
      {
        mapPlaceName: '',
        locationLat: '',
        locationLng: '',
        datetimeType: TaskDateTimeType.Flexible,
        preferredDate: '',
        preferredTime: '',
        category: '',
        budgetMajor: '',
        budgetCurrency: Currency.Gbp,
      },
      copy,
      'en-GB',
    )
    expect(labels.locationLabel).toBeNull()
    expect(labels.budgetLabel).toBeNull()
    expect(labels.categoryLabel).toBeNull()
    expect(labels.lat).toBeNull()
  })
})
