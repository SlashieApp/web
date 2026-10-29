import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  PAGE_GREEN_BLOCKS,
  PAGE_GREEN_ROOT_MARGIN,
  watchPageGreen,
} from './pageGreenWatch'

/** A stand-in for IntersectionObserver that the test drives by hand. */
class FakeObserver {
  static latest: FakeObserver | null = null
  readonly targets: Element[] = []
  disconnected = false

  constructor(
    private readonly callback: (entries: IntersectionObserverEntry[]) => void,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeObserver.latest = this
  }

  observe(target: Element) {
    this.targets.push(target)
  }

  disconnect() {
    this.disconnected = true
  }

  report(target: Element, isIntersecting: boolean) {
    this.callback([{ isIntersecting, target } as IntersectionObserverEntry])
  }
}

const hero = { name: 'hero' } as unknown as Element
const finalCta = { name: 'final cta' } as unknown as Element

const withBlocks = (blocks: Element[]) =>
  ({ querySelectorAll: () => blocks }) as unknown as ParentNode

function observerOf() {
  const observer = FakeObserver.latest
  if (!observer) throw new Error('No observer was made')
  return observer
}

describe('watchPageGreen', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    FakeObserver.latest = null
  })

  it('watches the blocks that carry the page green action, below the header', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    watchPageGreen({ onChange: vi.fn() }, withBlocks([hero, finalCta]))
    expect(observerOf().targets).toEqual([hero, finalCta])
    expect(observerOf().options?.rootMargin).toBe(PAGE_GREEN_ROOT_MARGIN)
  })

  it('reports true while any block is on screen and false when none is', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const changes: boolean[] = []
    watchPageGreen(
      { onChange: (inView) => changes.push(inView) },
      withBlocks([hero, finalCta]),
    )
    const observer = observerOf()

    // At the top: the hero is on screen, the close is far below.
    observer.report(hero, true)
    observer.report(finalCta, false)
    // Down the page: the hero has gone and nothing carries green.
    observer.report(hero, false)
    // The close comes in, then goes again.
    observer.report(finalCta, true)
    observer.report(finalCta, false)

    // Only changes are reported.
    expect(changes).toEqual([true, false, true, false])
  })

  it('is right at once for a reload part way down the page', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const onChange = vi.fn()
    watchPageGreen({ onChange }, withBlocks([hero, finalCta]))
    observerOf().report(finalCta, true)
    expect(onChange).toHaveBeenLastCalledWith(true)
  })

  it('reports false for a page with no such block, and watches nothing', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const onChange = vi.fn()
    const stop = watchPageGreen({ onChange }, withBlocks([]))
    expect(onChange).toHaveBeenCalledWith(false)
    expect(FakeObserver.latest).toBeNull()
    expect(stop).not.toThrow()
  })

  it('stops watching on cleanup', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const stop = watchPageGreen({ onChange: vi.fn() }, withBlocks([hero]))
    stop()
    expect(observerOf().disconnected).toBe(true)
  })

  it('reports false, and stops cleanly, where there is no IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const onChange = vi.fn()
    const stop = watchPageGreen({ onChange }, withBlocks([hero]))
    expect(onChange).toHaveBeenCalledWith(false)
    expect(stop).not.toThrow()
  })
})

describe('the hooks the header watches', () => {
  const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')
  const landing = 'src/app/(marketing)/components/ui/landing'

  it('are on the hero and the closing call to action', () => {
    expect(PAGE_GREEN_BLOCKS).toBe('[data-landing-hero], [data-final-cta]')
    expect(read(`${landing}/hero/HeroSection.tsx`)).toContain(
      'data-landing-hero=""',
    )
    expect(read(`${landing}/sections/FinalCtaBand.tsx`)).toContain(
      'data-final-cta=""',
    )
  })

  it('are the same blocks as carry a green action of their own', () => {
    expect(read(`${landing}/hero/HeroSearchCta.tsx`)).toContain(
      'variant="primary"',
    )
    expect(read(`${landing}/sections/FinalCtaBand.tsx`)).toContain(
      'variant="primary"',
    )
  })

  it('is what the header reads, so its action is secondary beside them', () => {
    const header = read(
      'src/app/(marketing)/components/layout/MarketingHeader.tsx',
    )
    expect(header).toContain('watchPageGreen')
    expect(header).toContain('quiet={transparent || pageGreen}')
  })
})
