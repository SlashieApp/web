import { afterEach, describe, expect, it, vi } from 'vitest'

import { clusterMarkerElement } from './clusters'
import { referenceMarkerElement } from './pin'
import { PIN } from './pin/styles'

/**
 * Just enough DOM for the marker builders. The unit run is `node`; the real
 * browser pins are covered by `pin/marker.browser.test.ts`.
 */
type FakeEl = {
  style: Record<string, string>
  children: FakeEl[]
  textContent: string
  className: string
  type: string
  setAttribute: (name: string, value: string) => void
  append: (...nodes: FakeEl[]) => void
  appendChild: (node: FakeEl) => FakeEl
  addEventListener: () => void
}

function fakeEl(): FakeEl {
  const el: FakeEl = {
    style: {},
    children: [],
    textContent: '',
    className: '',
    type: '',
    setAttribute: () => {},
    append: (...nodes) => {
      el.children.push(...nodes)
    },
    appendChild: (node) => {
      el.children.push(node)
      return node
    },
    addEventListener: () => {},
  }
  return el
}

function stubDocument() {
  vi.stubGlobal('document', {
    createElement: () => fakeEl(),
    head: fakeEl(),
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('labels on a green map fill (FE-469)', () => {
  // White on green 400 is 1.8:1, so a label on a green fill is ink, as in the
  // app and as `text.onGreen`.
  it('draws the ink label on the green "You" pill, at 500 like the app', () => {
    stubDocument()
    const root = referenceMarkerElement() as unknown as FakeEl
    const pill = root.children.find((child) => child.textContent === 'You')
    expect(pill).toBeDefined()
    expect(pill?.style.background).toBe(PIN.green)
    expect(pill?.style.color).toBe('#0A1512')
    expect(pill?.style.color).toBe(PIN.ink)
    expect(pill?.style.fontWeight).toBe('500')
  })

  it('draws the ink count on a green cluster bubble, as a 600 figure', () => {
    stubDocument()
    const root = clusterMarkerElement(12, () => {}) as unknown as FakeEl
    const bubble = root.children[0]
    expect(bubble.textContent).toBe('12')
    expect(bubble.style.background).toBe(PIN.green)
    expect(bubble.style.color).toBe(PIN.ink)
    expect(bubble.style.fontWeight).toBe('600')
    expect(bubble.style.fontVariantNumeric).toBe('tabular-nums')
  })

  it('keeps ink distinct from white', () => {
    expect(PIN.ink).not.toBe(PIN.white)
  })
})
