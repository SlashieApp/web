import { describe, expect, it } from 'vitest'

import {
  type FixtureGateEnv,
  KNOWN_PRODUCTION_FIXTURE_TASK_IDS,
  allowFixtureListings,
  filterPublicMarketplaceTasks,
  filterPublicMarketplaceWorkers,
  isFixtureLikeTask,
  isFixtureLikeTaskBody,
  isFixtureLikeTaskTitle,
  isFixtureLikeWorker,
  isFixtureToken,
  isPublicMarketplaceTask,
  isPublicMarketplaceWorker,
} from './marketplaceListingQuality'

const hideEnv: FixtureGateEnv = { NEXT_PUBLIC_ALLOW_FIXTURE_LISTINGS: '' }
const showEnv: FixtureGateEnv = {
  NEXT_PUBLIC_ALLOW_FIXTURE_LISTINGS: 'true',
}

describe('allowFixtureListings', () => {
  it('is off unless the env flag is an explicit truthy value', () => {
    expect(allowFixtureListings({})).toBe(false)
    expect(
      allowFixtureListings({ NEXT_PUBLIC_ALLOW_FIXTURE_LISTINGS: '' }),
    ).toBe(false)
    expect(
      allowFixtureListings({ NEXT_PUBLIC_ALLOW_FIXTURE_LISTINGS: 'false' }),
    ).toBe(false)
    expect(
      allowFixtureListings({ NEXT_PUBLIC_ALLOW_FIXTURE_LISTINGS: 'true' }),
    ).toBe(true)
    expect(
      allowFixtureListings({ NEXT_PUBLIC_ALLOW_FIXTURE_LISTINGS: '1' }),
    ).toBe(true)
  })
})

describe('fixture copy heuristics', () => {
  it('flags the production titles named in FE-142', () => {
    expect(isFixtureLikeTaskTitle('Test from app')).toBe(true)
    expect(isFixtureLikeTaskTitle('starbuck')).toBe(true)
    expect(isFixtureLikeTaskTitle('Hi')).toBe(true)
    expect(isFixtureLikeTaskTitle('Help me with myTV mounted')).toBe(true)
    expect(isFixtureLikeTaskTitle('test')).toBe(true)
    expect(isFixtureLikeTaskTitle('demo')).toBe(true)
  })

  it('keeps ordinary marketplace titles', () => {
    expect(isFixtureLikeTaskTitle('Mount a 55-inch TV in the lounge')).toBe(
      false,
    )
    expect(isFixtureLikeTaskTitle('Help moving a sofa this Saturday')).toBe(
      false,
    )
    expect(isFixtureLikeTaskTitle('Test the smoke alarms on each floor')).toBe(
      false,
    )
  })

  it('flags placeholder and letter-salad descriptions', () => {
    expect(isFixtureLikeTaskBody('test')).toBe(true)
    expect(isFixtureLikeTaskBody('I added this from app')).toBe(true)
    expect(
      isFixtureLikeTaskBody(
        'Hi\nX\nX\n\nX\nX\nD\nD\n\nX\nX\n\nV\nH\n\nT\n\nD\n\nW\nS',
      ),
    ).toBe(true)
    expect(
      isFixtureLikeTaskBody(
        'I have a 100-inch TV and no idea how to put it on the wall.',
      ),
    ).toBe(false)
  })

  it('treats common placeholder skills as fixture tokens', () => {
    expect(isFixtureToken('test')).toBe(true)
    expect(isFixtureToken('y')).toBe(true)
    expect(isFixtureToken('TV Mounting')).toBe(false)
  })
})

describe('isFixtureLikeTask', () => {
  it('hides known production fixture ids even when copy looks real', () => {
    expect(
      isFixtureLikeTask({
        id: KNOWN_PRODUCTION_FIXTURE_TASK_IDS[3],
        title: 'Mount a television',
        description: 'Need a 100-inch TV mounted on a brick wall.',
      }),
    ).toBe(true)
  })

  it('hides Slashie Admin seed posts', () => {
    expect(
      isFixtureLikeTask({
        id: 'not-in-denylist',
        title: 'Garden tidy-up this weekend',
        description: 'Need the back lawn cut and the hedge trimmed.',
        poster: { profile: { name: 'Slashie Admin' } },
      }),
    ).toBe(true)
  })

  it('keeps a real customer task', () => {
    expect(
      isFixtureLikeTask({
        id: 'real-task',
        title: 'Assemble a new IKEA wardrobe',
        description:
          'Two-door wardrobe, all parts in the box, lift to first floor.',
        poster: { profile: { name: 'Amelia Chen' } },
      }),
    ).toBe(false)
  })
})

describe('isFixtureLikeWorker', () => {
  it('hides the thin RK k / skill test profile', () => {
    expect(
      isFixtureLikeWorker({
        id: '6a32e05b73e39ce88b56fcd5',
        tagline: null,
        skills: ['test'],
        isVerified: false,
        tasksCompletedCount: null,
        user: { profile: { name: 'RK k' } },
      }),
    ).toBe(true)
  })

  it('hides a one-letter job-card skill on an otherwise empty profile', () => {
    expect(
      isFixtureLikeWorker({
        tagline: 'y',
        skills: ['y'],
        user: { profile: { name: 'RK k' } },
      }),
    ).toBe(true)
  })

  it('keeps a complete worker card', () => {
    expect(
      isFixtureLikeWorker({
        tagline: 'Handyman with 8 years experience',
        bio: 'I fit kitchens and mount TVs across North London for tidy, reliable work.',
        skills: ['TV Mounting', 'Furniture Assembly', 'Shelving'],
        isVerified: false,
        tasksCompletedCount: 0,
        user: { profile: { name: 'Jamie Cole' } },
      }),
    ).toBe(false)
  })

  it('does not hide a verified or completed worker even with a short name', () => {
    expect(
      isFixtureLikeWorker({
        tagline: null,
        skills: ['test'],
        isVerified: true,
        user: { profile: { name: 'RK k' } },
      }),
    ).toBe(false)
    expect(
      isFixtureLikeWorker({
        tagline: null,
        skills: ['test'],
        tasksCompletedCount: 3,
        user: { profile: { name: 'RK k' } },
      }),
    ).toBe(false)
  })
})

describe('public marketplace filters', () => {
  const tasks = [
    { id: 'junk', title: 'Test from app', description: 'Hi' },
    {
      id: 'real',
      title: 'Assemble a new IKEA wardrobe',
      description: 'Two-door wardrobe, all parts in the box.',
    },
  ]
  const workers = [
    {
      tagline: null,
      skills: ['test'],
      user: { profile: { name: 'RK k' } },
    },
    {
      tagline: 'Reliable local plumber',
      skills: ['Leaks', 'Taps', 'Toilets'],
      bio: 'I fix leaks and install taps across South London, usually same week.',
      user: { profile: { name: 'Pat Singh' } },
    },
  ]

  it('drops fixture rows by default', () => {
    expect(
      filterPublicMarketplaceTasks(tasks, hideEnv).map((row) => row.id),
    ).toEqual(['real'])
    expect(
      filterPublicMarketplaceWorkers(workers, hideEnv).map(
        (row) => row.user?.profile?.name,
      ),
    ).toEqual(['Pat Singh'])
    expect(isPublicMarketplaceTask(tasks[0], hideEnv)).toBe(false)
    expect(isPublicMarketplaceWorker(workers[0], hideEnv)).toBe(false)
  })

  it('passes everything through when the allow-fixtures flag is on', () => {
    expect(filterPublicMarketplaceTasks(tasks, showEnv)).toHaveLength(2)
    expect(filterPublicMarketplaceWorkers(workers, showEnv)).toHaveLength(2)
    expect(isPublicMarketplaceTask(tasks[0], showEnv)).toBe(true)
    expect(isPublicMarketplaceWorker(workers[0], showEnv)).toBe(true)
  })
})
