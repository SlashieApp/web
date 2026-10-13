import { TaskDateTimeType } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  taskDetailCategoryChips,
  taskDetailCategoryTag,
  taskDetailDurationTag,
  taskDetailLocationTag,
  taskDetailLocationTown,
  taskDetailOwnerTag,
  taskDetailTimeChip,
  taskDetailTimeTag,
} from './taskDetailMetaTags'
import { storyTaskDetail } from './taskDetailStoryFixtures'

const timeCopy = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  flexible: 'Flexible',
}

describe('task detail meta tags', () => {
  const task = storyTaskDetail()

  it('converts location, time, category, and owner; skips clock time as duration', () => {
    expect(
      taskDetailLocationTag({
        task,
        showExactLocation: false,
      }),
    ).toEqual({
      // The fixture's public name is town-only since BE-72.
      label: 'Westminster',
      href: '/search?lat=51.50740&lng=-0.12780',
    })
    expect(
      taskDetailTimeTag(task, timeCopy, new Date('2026-06-09T12:00:00')),
    ).toBe('Tomorrow')
    expect(
      taskDetailTimeTag(task, timeCopy, new Date('2026-06-10T12:00:00')),
    ).toBe('Today')
    expect(taskDetailDurationTag(task)).toBeNull()
    expect(taskDetailCategoryTag(task)).toEqual({
      label: 'Handyman',
      href: '/search?category=HANDYMAN',
    })
    expect(taskDetailOwnerTag(task, 'Task owner')).toEqual({
      name: 'Alex Chen',
      avatarUrl: task.poster?.profile?.avatarUrl,
      href: '/profile/owner-detail-1',
    })
  })

  it('keeps only the town from a place line or street address', () => {
    expect(taskDetailLocationTown('Westminster, London, United Kingdom')).toBe(
      'London',
    )
    expect(taskDetailLocationTown('Central London')).toBe('Central London')
    expect(taskDetailLocationTown('12 Example Street, London SW1A 1AA')).toBe(
      'London',
    )
    expect(
      taskDetailLocationTown(
        '12 Example Street, Westminster, London, England, United Kingdom',
      ),
    ).toBe('London')
  })

  it('uses a non-clock time string as the duration chip', () => {
    expect(
      taskDetailDurationTag(
        storyTaskDetail({
          datetime: {
            date: '2026-06-10',
            time: '2–3 hrs',
            type: TaskDateTimeType.Flexible,
          },
        }),
      ),
    ).toBe('2–3 hrs')
  })

  it('labels a dateless schedule as flexible', () => {
    expect(
      taskDetailTimeTag(
        storyTaskDetail({
          datetime: { date: null, time: null, type: TaskDateTimeType.Flexible },
        }),
        timeCopy,
      ),
    ).toBe('Flexible')
  })
})

describe('task detail card chips (FE-258)', () => {
  const chipCopy = {
    ...timeCopy,
    byDate: 'By {date}',
    startsInHours: 'Starts in {count} h',
    startsInMinutes: 'Starts in {count} min',
  }
  const at = (date: string | null, time: string | null, type = 'EXACT') => ({
    datetime: { type, date, time },
  })

  it('lists every category, linked to search, with no +N', () => {
    const chips = taskDetailCategoryChips({
      title: 'x',
      description: 'y',
      categories: ['Cleaning', 'MOVING', ' Painting '],
    })
    expect(chips.map((chip) => chip.label)).toEqual([
      'Cleaning',
      'Moving',
      'Painting',
    ])
    expect(chips[2]?.href).toBe('/search?category=Painting')
    expect(
      taskDetailCategoryChips({
        title: 'Deep clean',
        description: '',
        categories: [],
      }),
    ).toEqual([{ label: 'Cleaning', href: null }])
  })

  it('shows Flexible without a date, and date plus start time otherwise', () => {
    const now = new Date('2026-10-13T08:00:00')
    expect(
      taskDetailTimeChip(at(null, null, 'FLEXIBLE') as never, chipCopy, now),
    ).toEqual({ label: 'Flexible', tone: 'neutral', countdown: null })
    expect(
      taskDetailTimeChip(at('2026-10-18', '09:00') as never, chipCopy, now),
    ).toEqual({ label: 'Sun 18 Oct · 09:00', tone: 'neutral', countdown: null })
    expect(
      taskDetailTimeChip(
        at('2026-10-18', null, 'BEFORE') as never,
        chipCopy,
        now,
      ).label,
    ).toBe('By Sun 18 Oct')
  })

  it('counts down within 48 h, warns within 24 h, and marks today', () => {
    const now = new Date('2026-10-13T08:00:00')
    expect(
      taskDetailTimeChip(at('2026-10-14', '20:00') as never, chipCopy, now),
    ).toEqual({
      label: 'Tomorrow · 20:00',
      tone: 'neutral',
      countdown: 'Starts in 36 h',
    })
    expect(
      taskDetailTimeChip(at('2026-10-14', '7:00') as never, chipCopy, now),
    ).toMatchObject({ tone: 'warning', countdown: 'Starts in 23 h' })
    expect(
      taskDetailTimeChip(at('2026-10-13', '08:20') as never, chipCopy, now),
    ).toEqual({
      label: 'Today · 08:20',
      tone: 'success',
      countdown: 'Starts in 20 min',
    })
    expect(
      taskDetailTimeChip(at('2026-10-13', '07:00') as never, chipCopy, now),
    ).toMatchObject({ tone: 'success', countdown: null })
  })
})
