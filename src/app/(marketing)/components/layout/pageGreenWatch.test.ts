import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  PAGE_GREEN_ACTIONS,
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

  unobserve(target: Element) {
    const at = this.targets.indexOf(target)
    if (at >= 0) this.targets.splice(at, 1)
  }

  disconnect() {
    this.disconnected = true
  }

  report(target: Element, isIntersecting: boolean) {
    this.callback([{ isIntersecting, target } as IntersectionObserverEntry])
  }
}

/** A stand-in for MutationObserver the test fires by hand. */
class FakeMutations {
  static latest: FakeMutations | null = null
  disconnected = false

  constructor(private readonly callback: (records: MutationRecord[]) => void) {
    FakeMutations.latest = this
  }

  observe() {}

  disconnect() {
    this.disconnected = true
  }

  change(added: Node[], removed: Node[] = []) {
    this.callback([
      { addedNodes: added, removedNodes: removed } as unknown as MutationRecord,
    ])
  }
}

type Fake = Element & { isConnected: boolean }

const button = (name: string): Fake =>
  ({
    name,
    nodeType: 1,
    isConnected: true,
    matches: () => true,
    querySelector: () => null,
  }) as unknown as Fake

const hero = button('hero search')
const finalCta = button('close post a task')

/** A page whose marked buttons the test can add to and take from. */
function page(initial: Element[]) {
  const buttons = [...initial]
  const root = {
    querySelectorAll: () => [...buttons],
  } as unknown as ParentNode
  return { root, buttons }
}

function observerOf() {
  const observer = FakeObserver.latest
  if (!observer) throw new Error('No observer was made')
  return observer
}

function mutationsOf() {
  const mutations = FakeMutations.latest
  if (!mutations) throw new Error('No mutation observer was made')
  return mutations
}

describe('watchPageGreen', () => {
  const stub = () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    vi.stubGlobal('MutationObserver', FakeMutations)
  }

  afterEach(() => {
    vi.unstubAllGlobals()
    FakeObserver.latest = null
    FakeMutations.latest = null
    hero.isConnected = true
    finalCta.isConnected = true
  })

  it('watches the green buttons themselves, below the header', () => {
    stub()
    watchPageGreen({ onChange: vi.fn() }, page([hero, finalCta]).root)
    expect(observerOf().targets).toEqual([hero, finalCta])
    expect(observerOf().options?.rootMargin).toBe(PAGE_GREEN_ROOT_MARGIN)
  })

  it('reports true while any button is on screen and false when none is', () => {
    stub()
    const changes: boolean[] = []
    watchPageGreen(
      { onChange: (inView) => changes.push(inView) },
      page([hero, finalCta]).root,
    )
    const observer = observerOf()

    // At the top: the hero's Search is on screen, the close is far below.
    observer.report(hero, true)
    observer.report(finalCta, false)
    // Down the page: the Search has gone and no green is on screen, so the
    // header's Get started is the green one.
    observer.report(hero, false)
    // The close's pill comes in, then goes again.
    observer.report(finalCta, true)
    observer.report(finalCta, false)

    // Only changes are reported (the first false is the start, before the
    // observer has reported anything).
    expect(changes).toEqual([false, true, false, true, false])
  })

  it('is right at once for a reload part way down the page', () => {
    stub()
    const onChange = vi.fn()
    watchPageGreen({ onChange }, page([hero, finalCta]).root)
    observerOf().report(finalCta, true)
    expect(onChange).toHaveBeenLastCalledWith(true)
  })

  it('reports false for a page with no such button, and watches nothing', () => {
    stub()
    const onChange = vi.fn()
    const stop = watchPageGreen({ onChange }, page([]).root)
    expect(onChange).toHaveBeenCalledWith(false)
    expect(observerOf().targets).toEqual([])
    expect(stop).not.toThrow()
  })

  it('picks up a button that arrives after the header', () => {
    stub()
    const changes: boolean[] = []
    const { root, buttons } = page([])
    watchPageGreen({ onChange: (inView) => changes.push(inView) }, root)

    // The pricing page streams in behind its loading frame.
    const plan = button('paid plan action')
    buttons.push(plan)
    mutationsOf().change([plan])
    expect(observerOf().targets).toEqual([plan])
    observerOf().report(plan, true)
    expect(changes).toEqual([false, true])
  })

  it('ignores a change that carries no marked button', () => {
    stub()
    const { root, buttons } = page([hero])
    watchPageGreen({ onChange: vi.fn() }, root)
    const other = {
      nodeType: 1,
      matches: () => false,
      querySelector: () => null,
    } as unknown as Node
    buttons.push(button('would be seen by a scan'))
    mutationsOf().change([other])
    // The scan did not run, so the new button is not observed.
    expect(observerOf().targets).toEqual([hero])
  })

  it('lets go of a button that leaves, so it no longer holds the header quiet', () => {
    stub()
    const changes: boolean[] = []
    const { root, buttons } = page([hero])
    watchPageGreen({ onChange: (inView) => changes.push(inView) }, root)
    observerOf().report(hero, true)

    // A client navigation takes the page's hero away while it is on screen.
    hero.isConnected = false
    buttons.length = 0
    mutationsOf().change([], [hero])
    expect(observerOf().targets).toEqual([])
    expect(changes).toEqual([false, true, false])
  })

  it('stops watching on cleanup', () => {
    stub()
    const stop = watchPageGreen({ onChange: vi.fn() }, page([hero]).root)
    stop()
    expect(observerOf().disconnected).toBe(true)
    expect(mutationsOf().disconnected).toBe(true)
  })

  it('reports false, and stops cleanly, where there is no IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const onChange = vi.fn()
    const stop = watchPageGreen({ onChange }, page([hero]).root)
    expect(onChange).toHaveBeenCalledWith(false)
    expect(stop).not.toThrow()
  })
})

describe('the hooks the header watches', () => {
  const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

  it('are on the green buttons, not on their sections', () => {
    expect(PAGE_GREEN_ACTIONS).toBe('[data-page-green-action]')
  })

  it('is what the header reads, so its action is secondary beside them', () => {
    const header = read(
      'src/app/(marketing)/components/layout/MarketingHeader.tsx',
    )
    expect(header).toContain('watchPageGreen')
    expect(header).toContain('quiet={transparent || pageGreen}')
  })
})
