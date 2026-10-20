import { WorkerProfileGap } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  storyMe,
  storyWorker,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'

import { workerProfileTodos } from './workerProfileTodos'

describe('workerProfileTodos', () => {
  it('has nothing to do for a customer', () => {
    expect(workerProfileTodos(storyMe())).toEqual([])
  })

  it("lists the API's profile gaps in its order, portfolio last", () => {
    expect(workerProfileTodos(storyWorkerMe())).toEqual(['photo', 'portfolio'])
  })

  it('maps every gap the API reports', () => {
    const me = storyWorkerMe({
      worker: storyWorker({
        profileGaps: [
          WorkerProfileGap.Photo,
          WorkerProfileGap.Headline,
          WorkerProfileGap.Bio,
          WorkerProfileGap.Skills,
          WorkerProfileGap.ServiceArea,
          WorkerProfileGap.Portfolio,
        ],
      }),
    })
    expect(workerProfileTodos(me)).toEqual([
      'photo',
      'headline',
      'bio',
      'skills',
      'serviceArea',
      'portfolio',
    ])
  })

  it('trusts the API over the fields (no client rules)', () => {
    const me = storyWorkerMe({
      worker: storyWorker({ tagline: null, profileGaps: [] }),
    })
    expect(workerProfileTodos(me)).toEqual([])
  })
})
