import { describe, expect, it } from 'vitest'

import {
  isScreenDone,
  isScreenUnlocked,
  nextScreen,
  previousScreen,
  resumeScreen,
  screenNumber,
} from './workerSetupScreens'

const saved = (...steps: string[]) => new Set(steps)

const ABOUT = ['profile.details', 'profile.photo']
const WORK = ['services.skills', 'services.experience']

describe('isScreenDone', () => {
  it('needs every required sub-step of the screen', () => {
    expect(isScreenDone('about', saved('profile.details'))).toBe(false)
    expect(isScreenDone('about', saved(...ABOUT))).toBe(true)
  })

  it('ignores the optional travel distance and work photos, as the API does', () => {
    expect(isScreenDone('area', saved('area.location'))).toBe(true)
    expect(isScreenDone('profile', saved('profile.bio'))).toBe(true)
  })
})

describe('resumeScreen', () => {
  it('starts a new worker on About you', () => {
    expect(resumeScreen(saved())).toBe('about')
  })

  it('picks up at the first screen not done, in the order the web asks', () => {
    // Saved under the old order: bio came before the trade.
    expect(resumeScreen(saved(...ABOUT, 'profile.bio'))).toBe('work')
  })

  it('opens the review once everything else is saved', () => {
    expect(
      resumeScreen(
        saved(
          ...ABOUT,
          ...WORK,
          'profile.bio',
          'area.location',
          'verify.phone',
        ),
      ),
    ).toBe('review')
  })
})

describe('isScreenUnlocked', () => {
  const progress = saved(...ABOUT)

  it('opens the current screen and the ones already done', () => {
    expect(isScreenUnlocked('work', 'work', progress)).toBe(true)
    expect(isScreenUnlocked('about', 'work', progress)).toBe(true)
  })

  it('opens a screen once every screen before it is done', () => {
    expect(isScreenUnlocked('work', 'about', progress)).toBe(true)
    expect(isScreenUnlocked('profile', 'work', progress)).toBe(false)
  })

  it('keeps a screen saved out of order open', () => {
    expect(isScreenUnlocked('profile', 'work', saved('profile.bio'))).toBe(true)
  })
})

describe('screen order', () => {
  it('walks forward and back one screen at a time', () => {
    expect(nextScreen('about')).toBe('work')
    expect(nextScreen('review')).toBeNull()
    expect(previousScreen('work')).toBe('about')
    expect(previousScreen('about')).toBeNull()
  })

  it('numbers screens from 1', () => {
    expect(screenNumber('about')).toBe(1)
    expect(screenNumber('review')).toBe(6)
  })
})
