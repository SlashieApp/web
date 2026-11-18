import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  CURRENT_LOCATION_LABEL,
  URL_SEEDED_AREA_LABEL,
} from '@/app/(task)/helpers/browseReferenceLocation'

import bag from '../i11n.json'
import {
  type WorkerSearchItem,
  formatWorkersListTitle,
  workerDisplayName,
  workerExperienceShortLabel,
  workerRatingLabel,
  workerServiceAreaLabel,
  workerSubtitle,
} from './workerSearchHelpers'

const dir = dirname(fileURLToPath(import.meta.url))

function item(summary: {
  average: number | null
  count: number
}): WorkerSearchItem {
  return { ratingSummary: summary } as WorkerSearchItem
}

describe('workerRatingLabel', () => {
  it('hides the average until there are 3 reviews', () => {
    expect(workerRatingLabel(item({ average: 5, count: 2 }))).toBeNull()
    expect(workerRatingLabel(item({ average: 4.5, count: 3 }))).toBe('4.5 (3)')
    expect(workerRatingLabel(item({ average: null, count: 4 }))).toBeNull()
  })
})

describe('worker search sort', () => {
  it('sorts by distance', () => {
    const src = readFileSync(
      join(dir, '../context/WorkerSearchProvider.tsx'),
      'utf8',
    )
    expect(src).toContain('WorkerSortField.Distance')
    expect(src).not.toContain('WorkerSortField.Rating')
  })
})

/**
 * FE-577: every line on a Find workers card and the results heading comes from copy, so zh-HK
 * readers see Chinese (the app's words, where it has them).
 */
describe('Find workers card lines in the reader’s language', () => {
  const worker = (fields: Record<string, unknown>) => fields as WorkerSearchItem

  it('a worker with no name is Worker / 工作者', () => {
    expect(workerDisplayName(worker({}), bag.en.card.nameFallback)).toBe(
      'Worker',
    )
    expect(workerDisplayName(worker({}), bag.zh_hk.card.nameFallback)).toBe(
      '工作者',
    )
    expect(
      workerDisplayName(
        worker({ user: { profile: { name: ' Maya ' } } }),
        bag.zh_hk.card.nameFallback,
      ),
    ).toBe('Maya')
  })

  it('no headline or area: Local worker on Slashie / Slashie 本地工作者', () => {
    expect(workerSubtitle(worker({}), bag.en.card.subtitleFallback)).toBe(
      'Local worker on Slashie',
    )
    expect(workerSubtitle(worker({}), bag.zh_hk.card.subtitleFallback)).toBe(
      'Slashie 本地工作者',
    )
  })

  it('an area with a radius reads in miles / 英里', () => {
    const w = worker({
      preferredLocation: { name: 'Camden' },
      serviceArea: { radiusMiles: 4.6 },
    })
    expect(workerServiceAreaLabel(w, bag.en.card.areaWithRadius)).toBe(
      'Camden (~5 miles)',
    )
    expect(workerServiceAreaLabel(w, bag.zh_hk.card.areaWithRadius)).toBe(
      'Camden（約 5 英里）',
    )
  })

  it('years of experience', () => {
    expect(
      workerExperienceShortLabel(worker({ yearsExperience: 1 }), bag.en.card),
    ).toBe('1 yr exp')
    expect(
      workerExperienceShortLabel(worker({ yearsExperience: 8 }), bag.en.card),
    ).toBe('8 yrs exp')
    expect(
      workerExperienceShortLabel(
        worker({ yearsExperience: 8 }),
        bag.zh_hk.card,
      ),
    ).toBe('8 年經驗')
    expect(
      workerExperienceShortLabel(
        worker({ yearsExperience: 0 }),
        bag.zh_hk.card,
      ),
    ).toBeNull()
  })

  it('the results heading', () => {
    expect(formatWorkersListTitle(3, 'Camden', bag.en)).toBe(
      '3 workers near Camden',
    )
    expect(formatWorkersListTitle(1, 'Camden', bag.en)).toBe(
      '1 worker near Camden',
    )
    expect(formatWorkersListTitle(3, 'Camden', bag.zh_hk)).toBe(
      'Camden附近有 3 位工作者',
    )
    expect(formatWorkersListTitle(2, CURRENT_LOCATION_LABEL, bag.zh_hk)).toBe(
      '你附近有 2 位工作者',
    )
    expect(formatWorkersListTitle(2, URL_SEEDED_AREA_LABEL, bag.zh_hk)).toBe(
      '此區域附近有 2 位工作者',
    )
  })

  it('the card reads Serves, Service area not set and the rating label from copy', () => {
    const card = readFileSync(
      join(dir, '../components/ui/WorkerSearchCard.tsx'),
      'utf8',
    )
    expect(card).toContain(
      'formatMessage(t.servesArea, { area: serviceAreaLabel })',
    )
    expect(card).toContain(': t.serviceAreaUnset}')
    expect(card).toContain('label={t.rating}')
    expect(card).not.toMatch(/'Service area not set'|`Serves |"Worker rating"/)
    expect(bag.zh_hk.card.servesArea).toBe('服務{area}')
    expect(bag.zh_hk.card.rating).toBe('工作者評分')
  })
})
