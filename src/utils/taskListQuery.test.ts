import { MyTaskHubSection } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import { buildTaskFilter } from './taskListQuery'

describe('buildTaskFilter hub fields', () => {
  it('sends owner and hub section on TaskFilter', () => {
    expect(
      buildTaskFilter({
        search: ' cabinet ',
        ownerUserId: ' alex ',
        category: 'CLEANING',
        hubSection: [MyTaskHubSection.Completed],
      }),
    ).toEqual({
      search: 'cabinet',
      ownerUserId: 'alex',
      category: 'CLEANING',
      hubSection: [MyTaskHubSection.Completed],
    })
  })

  it('omits blank owner and an empty hub section list', () => {
    expect(
      buildTaskFilter({ ownerUserId: '  ', hubSection: [], search: '' }),
    ).toBeUndefined()
  })
})
