import { describe, expect, it } from 'vitest'

import {
  PIN_Z_INDEX,
  type PinDom,
  applyPinVisualState,
  pinStackZIndex,
} from './styles'

function styleEl(): { style: Record<string, string> } {
  return { style: {} }
}

function mockPinDom(): PinDom {
  return {
    root: styleEl() as unknown as HTMLDivElement,
    popupShell: styleEl() as unknown as HTMLDivElement,
    popupReveal: styleEl() as unknown as HTMLDivElement,
    popupBody: styleEl() as unknown as HTMLDivElement,
    pricePillWrap: styleEl() as unknown as HTMLDivElement,
    pricePill: styleEl() as unknown as HTMLDivElement,
    priceEl: styleEl() as unknown as HTMLDivElement,
    milesEl: styleEl() as unknown as HTMLDivElement,
    pinDot: styleEl() as unknown as HTMLSpanElement,
    isPersonPin: false,
  }
}

describe('pinStackZIndex', () => {
  it('puts the selected task above the me pin, and the me pin above other tasks', () => {
    expect(Number(PIN_Z_INDEX.selected)).toBeGreaterThan(Number(PIN_Z_INDEX.me))
    expect(Number(PIN_Z_INDEX.me)).toBeGreaterThan(Number(PIN_Z_INDEX.hover))
    expect(Number(PIN_Z_INDEX.hover)).toBeGreaterThan(Number(PIN_Z_INDEX.task))
    expect(pinStackZIndex({ selected: true, expanded: true })).toBe(
      PIN_Z_INDEX.selected,
    )
    expect(pinStackZIndex({ selected: false, expanded: true })).toBe(
      PIN_Z_INDEX.hover,
    )
    expect(pinStackZIndex({ selected: false, expanded: false })).toBe(
      PIN_Z_INDEX.task,
    )
  })
})

describe('applyPinVisualState', () => {
  it('keeps the selected pin tip visible and the label expanded', () => {
    const dom = mockPinDom()
    applyPinVisualState(
      dom,
      { selected: true, expanded: true, showPill: false },
      false,
    )
    expect(dom.pinDot.style.opacity).toBe('1')
    expect(dom.pinDot.style.pointerEvents).toBe('auto')
    expect(dom.popupShell.style.maxHeight).toBe('168px')
  })

  it('keeps an unselected compact pin visible with the pill, not the popup', () => {
    const dom = mockPinDom()
    applyPinVisualState(
      dom,
      { selected: false, expanded: false, showPill: true },
      false,
    )
    expect(dom.pinDot.style.opacity).toBe('1')
    expect(dom.popupShell.style.maxHeight).toBe('0px')
    expect(dom.pricePillWrap.style.opacity).toBe('1')
  })
})
