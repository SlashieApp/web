import { describe, expect, it } from 'vitest'

import { getTaskOwnerContactAction } from './getTaskOwnerContact'
import type { TaskDetailRecord } from './taskDetailUtils'

function posterTask(
  poster: TaskDetailRecord['poster'],
): Pick<TaskDetailRecord, 'poster'> {
  return { poster }
}

describe('getTaskOwnerContactAction', () => {
  it('prefers a telephone link when the poster number is present', () => {
    expect(
      getTaskOwnerContactAction(
        posterTask({
          id: 'owner-1',
          email: 'alex@example.com',
          profile: { name: 'Alex', contactNumber: '07 700 900 123' },
        }),
      ),
    ).toEqual({ kind: 'tel', href: 'tel:07700900123' })
  })

  it('falls back to mailto, then account', () => {
    expect(
      getTaskOwnerContactAction(
        posterTask({
          id: 'owner-1',
          email: 'alex@example.com',
          profile: { name: 'Alex', contactNumber: null },
        }),
      ),
    ).toEqual({ kind: 'mailto', href: 'mailto:alex@example.com' })
    expect(getTaskOwnerContactAction(posterTask(null))).toEqual({
      kind: 'account',
      href: '/account',
    })
  })
})
