import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  FLOATING_PILL_HERO,
  FLOATING_PILL_HIDE_WHILE,
  type PillEntry,
  heroIsAbove,
  shouldShowPill,
  watchFloatingPill,
} from './floatingPillWatch'

const rect = (top: number, bottom: number) =>
  ({ top, bottom }) as DOMRectReadOnly

/** The viewport, as an observer root reports it. */
const viewport = (top = 0) => ({ top }) as DOMRectReadOnly

describe('heroIsAbove', () => {
  it('is false while any of the hero is on screen', () => {
    const entry: PillEntry = {
      isIntersecting: true,
      boundingClientRect: rect(-400, 10),
      rootBounds: viewport(),
    }
    expect(heroIsAbove(entry)).toBe(false)
  })

  it('is true once the hero has gone past the top edge', () => {
    const entry: PillEntry = {
      isIntersecting: false,
      boundingClientRect: rect(-900, -2),
      rootBounds: viewport(),
    }
    expect(heroIsAbove(entry)).toBe(true)
  })

  it('is false for a hero below the screen: it has not been seen yet', () => {
    const entry: PillEntry = {
      isIntersecting: false,
      boundingClientRect: rect(1200, 2100),
      rootBounds: viewport(),
    }
    expect(heroIsAbove(entry)).toBe(false)
  })

  it('measures from the top of the observer root when it has one', () => {
    const entry: PillEntry = {
      isIntersecting: false,
      boundingClientRect: rect(-300, 60),
      rootBounds: viewport(64),
    }
    expect(heroIsAbove(entry)).toBe(true)
  })

  it('falls back to the top of the screen without a root', () => {
    const above: PillEntry = {
      isIntersecting: false,
      boundingClientRect: rect(-300, -1),
      rootBounds: null,
    }
    const below: PillEntry = {
      isIntersecting: false,
      boundingClientRect: rect(300, 900),
      rootBounds: null,
    }
    expect(heroIsAbove(above)).toBe(true)
    expect(heroIsAbove(below)).toBe(false)
  })
})

describe('shouldShowPill', () => {
  it('shows once the hero is above and no end block is in view', () => {
    expect(shouldShowPill({ heroAbove: true, endBlocksInView: 0 })).toBe(true)
  })

  it('stays hidden while the hero is in view', () => {
    expect(shouldShowPill({ heroAbove: false, endBlocksInView: 0 })).toBe(false)
  })

  it('hides while the final call to action or the footer is in view', () => {
    expect(shouldShowPill({ heroAbove: true, endBlocksInView: 1 })).toBe(false)
    expect(shouldShowPill({ heroAbove: true, endBlocksInView: 2 })).toBe(false)
  })
})

/** A stand-in for IntersectionObserver that the test drives by hand. */
class FakeObserver {
  static latest: FakeObserver | null = null
  readonly targets: Element[] = []
  disconnected = false

  constructor(
    private readonly callback: (entries: IntersectionObserverEntry[]) => void,
  ) {
    FakeObserver.latest = this
  }

  observe(target: Element) {
    this.targets.push(target)
  }

  disconnect() {
    this.disconnected = true
  }

  /** Reports one target to the page's callback. */
  report(target: Element, entry: Omit<PillEntry, 'rootBounds'>) {
    this.callback([
      { ...entry, rootBounds: viewport(), target } as IntersectionObserverEntry,
    ])
  }
}

const hero = { name: 'hero' } as unknown as Element
const finalCta = { name: 'final cta' } as unknown as Element
const footer = { name: 'footer' } as unknown as Element

/** A page with the three blocks the pill watches. */
const page = {
  querySelector: (selector: string) =>
    selector === FLOATING_PILL_HERO ? hero : null,
  querySelectorAll: (selector: string) =>
    selector === FLOATING_PILL_HIDE_WHILE ? [finalCta, footer] : [],
} as unknown as ParentNode

const onScreen = { isIntersecting: true, boundingClientRect: rect(0, 700) }
const above = { isIntersecting: false, boundingClientRect: rect(-800, -10) }
const below = { isIntersecting: false, boundingClientRect: rect(900, 1600) }

function observerOf() {
  const observer = FakeObserver.latest
  if (!observer) throw new Error('No observer was made')
  return observer
}

describe('watchFloatingPill', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    FakeObserver.latest = null
  })

  it('watches the hero, the final call to action and the footer', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    watchFloatingPill(
      {
        hero: FLOATING_PILL_HERO,
        hideWhile: FLOATING_PILL_HIDE_WHILE,
        onChange: vi.fn(),
      },
      page,
    )
    expect(observerOf().targets).toEqual([hero, finalCta, footer])
  })

  it('follows the visitor down the page and back up', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const changes: boolean[] = []
    watchFloatingPill(
      {
        hero: FLOATING_PILL_HERO,
        hideWhile: FLOATING_PILL_HIDE_WHILE,
        onChange: (visible) => changes.push(visible),
      },
      page,
    )
    const observer = observerOf()

    // At the top: the hero is in view, the rest is far below.
    observer.report(hero, onScreen)
    observer.report(finalCta, below)
    observer.report(footer, below)
    // Down the page: the hero has gone, the pill shows.
    observer.report(hero, above)
    // The final call to action comes in, then the footer: hidden throughout.
    observer.report(finalCta, onScreen)
    observer.report(footer, onScreen)
    observer.report(finalCta, above)
    // The footer is still in view: still hidden.
    // Back up: the footer leaves, the pill is back, then the hero returns.
    observer.report(footer, below)
    observer.report(hero, onScreen)

    // Only changes are reported: hidden, shown, hidden, shown, hidden.
    expect(changes).toEqual([false, true, false, true, false])
  })

  it('is right at once for a reload part way down the page', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const onChange = vi.fn()
    watchFloatingPill(
      {
        hero: FLOATING_PILL_HERO,
        hideWhile: FLOATING_PILL_HIDE_WHILE,
        onChange,
      },
      page,
    )
    const observer = observerOf()
    // One callback carries every target's first state.
    observer.report(hero, above)
    expect(onChange).toHaveBeenLastCalledWith(true)
  })

  it('counts a page with no hero as past it, and waits for no one', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const onChange = vi.fn()
    watchFloatingPill(
      { hero: '[data-nothing]', hideWhile: '[data-nothing-either]', onChange },
      {
        querySelector: () => null,
        querySelectorAll: () => [],
      } as unknown as ParentNode,
    )
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('stops watching on cleanup', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const stop = watchFloatingPill(
      {
        hero: FLOATING_PILL_HERO,
        hideWhile: FLOATING_PILL_HIDE_WHILE,
        onChange: vi.fn(),
      },
      page,
    )
    stop()
    expect(observerOf().disconnected).toBe(true)
  })

  it('stays hidden, and stops cleanly, where there is no IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const onChange = vi.fn()
    const stop = watchFloatingPill(
      {
        hero: FLOATING_PILL_HERO,
        hideWhile: FLOATING_PILL_HIDE_WHILE,
        onChange,
      },
      page,
    )
    expect(onChange).not.toHaveBeenCalled()
    expect(stop).not.toThrow()
  })
})

describe('the hooks the pill watches', () => {
  const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')
  const landing = 'src/app/(marketing)/components/ui/landing'

  it('are on the hero and the final call to action', () => {
    expect(FLOATING_PILL_HERO).toBe('[data-landing-hero]')
    expect(FLOATING_PILL_HIDE_WHILE).toBe('[data-final-cta], footer')
    expect(read(`${landing}/hero/HeroSection.tsx`)).toContain(
      'data-landing-hero=""',
    )
    expect(read(`${landing}/sections/FinalCtaBand.tsx`)).toContain(
      'data-final-cta=""',
    )
  })

  it('has the footer as a footer landmark', () => {
    expect(read('src/ui/Footer/Footer.tsx')).toContain('as="footer"')
  })

  it('is on the home page, with the page post action', () => {
    const home = read('src/app/(marketing)/home/page.tsx')
    expect(home).toContain(
      '<FloatingPostPill label={ctas.postTask} href={hrefs.postTask} />',
    )
  })
})
