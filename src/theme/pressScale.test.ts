import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  SDL_PRESS_SCALE,
  mergeSdlPressCss,
  sdlMotion,
  sdlPressActiveCss,
  sdlTransitionWithPress,
} from './styles'

const PRESS_SELECTOR =
  '&:active:not(:disabled):not([data-disabled]):not([aria-disabled="true"]):not([data-loading])'
const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

describe('sdl press scale', () => {
  it('scales to 0.97 on pointer-down and clears it under reduced motion', () => {
    expect(SDL_PRESS_SCALE).toBe('scale(0.97)')
    expect(sdlPressActiveCss()).toMatchObject({
      [PRESS_SELECTOR]: { transform: SDL_PRESS_SCALE },
      [REDUCED_MOTION]: {
        [PRESS_SELECTOR]: { transform: 'none' },
      },
    })
  })

  it('scales a descendant target with the same reduced-motion opt-out', () => {
    const selector = `${PRESS_SELECTOR} [data-nav-icon]`
    expect(sdlPressActiveCss('[data-nav-icon]')).toMatchObject({
      [selector]: { transform: 'scale(0.97)' },
      [REDUCED_MOTION]: {
        [selector]: { transform: 'none' },
      },
    })
  })

  it('animates transform in 100ms and keeps the caller color duration', () => {
    const motion = sdlTransitionWithPress(
      'color, background-color, transform',
      sdlMotion.duration.base,
    )
    expect(motion.transitionProperty).toBe('color, background-color, transform')
    expect(motion.transitionDuration).toBe(
      `${sdlMotion.duration.base}, ${sdlMotion.duration.base}, ${sdlMotion.duration.fast}`,
    )
    expect(sdlMotion.duration.fast).toBe('100ms')
  })

  it('merges a reduced-motion block instead of replacing it', () => {
    const merged = mergeSdlPressCss({
      color: 'red',
      [REDUCED_MOTION]: { opacity: 1 },
    })
    expect(merged).toMatchObject({
      color: 'red',
      [PRESS_SELECTOR]: { transform: 'scale(0.97)' },
      [REDUCED_MOTION]: {
        opacity: 1,
        [PRESS_SELECTOR]: { transform: 'none' },
      },
    })
  })

  it('is wired into button, icon button, card, and the mobile dock', () => {
    const files = [
      'src/ui/Button/Button.tsx',
      'src/ui/IconButton/IconButton.tsx',
      'src/ui/Card/Card.tsx',
      'src/ui/MobileBottomNav/MobileBottomNav.tsx',
    ]
    for (const file of files) {
      const src = readFileSync(join(process.cwd(), file), 'utf8')
      expect(src, file).toMatch(/sdlPressActiveCss|mergeSdlPressCss/)
      expect(src, file).toContain('sdlTransitionWithPress')
    }
  })
})
