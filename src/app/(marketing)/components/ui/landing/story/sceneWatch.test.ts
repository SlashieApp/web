import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { SCENE_BLOCKS, SCENE_ROOT_MARGIN, watchSceneBlocks } from './sceneWatch'

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
const story = { name: 'how it works' } as unknown as Element
const close = { name: 'close' } as unknown as Element

const page = {
  querySelectorAll: (selector: string) =>
    selector === SCENE_BLOCKS ? [hero, story, close] : [],
} as unknown as ParentNode

function observerOf() {
  const observer = FakeObserver.latest
  if (!observer) throw new Error('No observer was made')
  return observer
}

describe('watchSceneBlocks', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    FakeObserver.latest = null
  })

  it('watches the hero, how it works and the close, below the header', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    watchSceneBlocks(vi.fn(), page)
    expect(observerOf().targets).toEqual([hero, story, close])
    expect(observerOf().options?.rootMargin).toBe(SCENE_ROOT_MARGIN)
  })

  it('is visible while any transparent block is on screen, and not between them', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const changes: boolean[] = []
    watchSceneBlocks((visible) => changes.push(visible), page)
    const observer = observerOf()

    // The top of the page: the hero is on screen.
    observer.report(hero, true)
    observer.report(story, false)
    observer.report(close, false)
    // Down through the map panel and the bento: no transparent block.
    observer.report(hero, false)
    // How it works comes in, then goes again (trust and pricing: opaque).
    observer.report(story, true)
    observer.report(story, false)
    // The close.
    observer.report(close, true)

    // Only changes are reported.
    expect(changes).toEqual([true, false, true, false, true])
  })

  it('stays visible while one block hands over to the next', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const changes: boolean[] = []
    watchSceneBlocks((visible) => changes.push(visible), page)
    const observer = observerOf()
    observer.report(story, true)
    observer.report(close, true)
    observer.report(story, false)
    expect(changes).toEqual([true])
  })

  it('is right at once for a reload part way down the page', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const onChange = vi.fn()
    watchSceneBlocks(onChange, page)
    // One callback carries every target's first state: only the close is on screen.
    observerOf().report(close, true)
    expect(onChange).toHaveBeenLastCalledWith(true)
  })

  it('counts a page with none of the blocks, or no IntersectionObserver, as visible', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const none = vi.fn()
    watchSceneBlocks(none, {
      querySelectorAll: () => [],
    } as unknown as ParentNode)
    expect(none).toHaveBeenCalledWith(true)
    expect(FakeObserver.latest).toBeNull()

    vi.stubGlobal('IntersectionObserver', undefined)
    const unsupported = vi.fn()
    const stop = watchSceneBlocks(unsupported, page)
    expect(unsupported).toHaveBeenCalledWith(true)
    expect(stop).not.toThrow()
  })

  it('stops watching on cleanup', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    const stop = watchSceneBlocks(vi.fn(), page)
    stop()
    expect(observerOf().disconnected).toBe(true)
  })
})

describe('the hooks the scene watches', () => {
  const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')
  const landing = 'src/app/(marketing)/components/ui/landing'

  it('are on the hero, how it works and the close', () => {
    expect(SCENE_BLOCKS).toBe(
      '[data-landing-hero], [data-how-it-works], [data-final-cta]',
    )
    expect(read(`${landing}/hero/HeroSection.tsx`)).toContain(
      'data-landing-hero=""',
    )
    expect(read(`${landing}/story/LandingStory.tsx`)).toContain(
      'data-how-it-works=""',
    )
    expect(read(`${landing}/sections/FinalCtaBand.tsx`)).toContain(
      'data-final-cta=""',
    )
  })

  it('are the only transparent blocks: every other section paints the page', () => {
    // The panels that hide the scene say so; if one stops being opaque, the
    // scene would stop drawing under a prop that can be seen.
    for (const [file, background] of [
      [`${landing}/showcase/MapShowcase.tsx`, 'bg="bg.canvas"'],
      [`${landing}/bento/BentoSection.tsx`, 'bg="bg.surface"'],
      [`${landing}/sections/TrustSection.tsx`, 'bg="bg.surface"'],
      [`${landing}/sections/PricingTeaser.tsx`, 'bg="bg.surface"'],
    ] as const) {
      expect(read(file), file).toContain(background)
    }
  })

  it('is what the tracker starts, and the scene draws on demand', () => {
    expect(read(`${landing}/story/StoryTracker.tsx`)).toContain(
      'watchSceneBlocks',
    )
    expect(read(`${landing}/scene/LandingScene.tsx`)).toContain(
      'frameloop="demand"',
    )
  })
})
