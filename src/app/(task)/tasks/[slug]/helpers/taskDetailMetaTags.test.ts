import { TaskDateTimeType } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  taskDetailCategoryTag,
  taskDetailDurationTag,
  taskDetailLocationTag,
  taskDetailLocationTown,
  taskDetailOwnerTag,
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
      label: 'London',
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
      href: '/user/owner-detail-1',
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
