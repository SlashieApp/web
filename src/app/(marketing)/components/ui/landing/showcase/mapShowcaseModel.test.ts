import { describe, expect, it } from 'vitest'

import messages from '@/app/(marketing)/i11n.json'

import {
  DEFAULT_SHOWCASE_TASK,
  MAP_ASPECT,
  PIN_SPOTS,
  SHOWCASE_ORDER,
  buildShowcaseTasks,
  cardRect,
  layoutAt,
  mapSizeAt,
  overlappingPins,
  pickShowcaseTask,
  pinRect,
  pinsUnderCard,
  pinsUnderChip,
  rectsOverlap,
} from './mapShowcaseModel'

const phone = messages.en.landing.phone

/** Every viewport width from a small phone to a wide screen, in 4px steps. */
const WIDTHS = Array.from(
  { length: (1920 - 320) / 4 + 1 },
  (_, i) => 320 + i * 4,
)

describe('buildShowcaseTasks', () => {
  it('builds one task per demo task, in pin order, from the phone bag', () => {
    const tasks = buildShowcaseTasks(phone)
    expect(tasks.map((task) => task.id)).toEqual([...SHOWCASE_ORDER])
    expect(Object.keys(phone.tasks).sort()).toEqual([...SHOWCASE_ORDER].sort())
    expect(tasks[0]).toEqual({
      id: 'move',
      title: phone.tasks.move.title,
      area: phone.tasks.move.area,
      price: phone.tasks.move.price,
      quotes: '3 quotes',
      pinLabel: 'Show the £45 task, Camden',
    })
  })

  it('reads the Traditional Chinese bag too', () => {
    const [move] = buildShowcaseTasks(messages.zh_hk.landing.phone)
    expect(move.quotes).toBe('3 個報價')
    expect(move.pinLabel).toBe('顯示 £45 的任務, Camden')
  })

  it('gives every pin a distinct label, so each button has its own name', () => {
    for (const bag of [
      messages.en.landing.phone,
      messages.zh_hk.landing.phone,
    ]) {
      const labels = buildShowcaseTasks(bag).map((task) => task.pinLabel)
      expect(new Set(labels).size).toBe(labels.length)
    }
  })

  it('names the price and the area each pin shows', () => {
    for (const bag of [
      messages.en.landing.phone,
      messages.zh_hk.landing.phone,
    ]) {
      for (const task of buildShowcaseTasks(bag)) {
        expect(task.pinLabel).toContain(task.price)
        expect(task.pinLabel).toContain(task.area)
      }
    }
  })

  it('leaves no unfilled placeholder in any label', () => {
    for (const task of buildShowcaseTasks(phone)) {
      expect(task.quotes).not.toMatch(/[{}]/)
      expect(task.pinLabel).not.toMatch(/[{}]/)
    }
  })
})

describe('pickShowcaseTask', () => {
  const tasks = buildShowcaseTasks(phone)

  it('finds a task by id', () => {
    expect(pickShowcaseTask(tasks, 'hedge').area).toBe(phone.tasks.hedge.area)
  })

  it('starts on a task that is shown', () => {
    expect(SHOWCASE_ORDER).toContain(DEFAULT_SHOWCASE_TASK)
  })

  it('falls back to the first task for an id that is not shown', () => {
    const fewer = tasks.filter((task) => task.id !== 'clean')
    expect(pickShowcaseTask(fewer, 'clean')).toBe(fewer[0])
  })
})

describe('rectsOverlap', () => {
  const box = { left: 0, top: 0, right: 10, bottom: 10 }

  it('is true when the rectangles share area', () => {
    expect(rectsOverlap(box, { left: 5, top: 5, right: 15, bottom: 15 })).toBe(
      true,
    )
  })

  it('is false for rectangles that only touch or are apart', () => {
    expect(rectsOverlap(box, { left: 10, top: 0, right: 20, bottom: 10 })).toBe(
      false,
    )
    expect(rectsOverlap(box, { left: 0, top: 11, right: 10, bottom: 20 })).toBe(
      false,
    )
  })
})

describe('mapSizeAt and layoutAt', () => {
  it('is the page column edge to edge, at the breakpoint aspect', () => {
    const phoneMap = mapSizeAt(390)
    expect(phoneMap.width).toBe(390)
    expect(phoneMap.width / phoneMap.height).toBeCloseTo(MAP_ASPECT.base, 5)
    const laptop = mapSizeAt(1366)
    expect(laptop.width).toBe(1280)
    expect(laptop.width / laptop.height).toBeCloseTo(MAP_ASPECT.lg, 5)
  })

  it('stops growing at the page column on a wide screen', () => {
    expect(mapSizeAt(1920)).toEqual(mapSizeAt(1280))
  })

  it('floats the card over the map from md, and puts it under the map below', () => {
    expect(layoutAt(767)).toBe('narrow')
    expect(layoutAt(768)).toBe('wide')
  })
})

describe('pin layouts', () => {
  it('are tabbed in reading order: top to bottom, in both layouts', () => {
    for (const layout of ['narrow', 'wide'] as const) {
      const ys = SHOWCASE_ORDER.map((id) => PIN_SPOTS[layout][id].y)
      expect(ys, layout).toEqual([...ys].sort((a, b) => a - b))
      expect(new Set(ys).size, layout).toBe(ys.length)
    }
  })

  it('place every pin on the map, with room for its pill and label', () => {
    for (const width of WIDTHS) {
      const { width: w, height: h } = mapSizeAt(width)
      for (const id of SHOWCASE_ORDER) {
        const rect = pinRect(PIN_SPOTS[layoutAt(width)][id], w, h)
        expect(rect.left, `${id} at ${width}`).toBeGreaterThanOrEqual(0)
        expect(rect.right, `${id} at ${width}`).toBeLessThanOrEqual(w)
        expect(rect.top, `${id} at ${width}`).toBeGreaterThanOrEqual(0)
        expect(rect.bottom, `${id} at ${width}`).toBeLessThanOrEqual(h)
      }
    }
  })

  it('never let two pins touch, from 320 to 1920 wide', () => {
    for (const width of WIDTHS) {
      const { width: w, height: h } = mapSizeAt(width)
      expect(overlappingPins(layoutAt(width), w, h), `at ${width}`).toEqual([])
    }
  })

  it('keep every pin clear of the floating card from md up', () => {
    for (const width of WIDTHS.filter((value) => value >= 768)) {
      const { width: w, height: h } = mapSizeAt(width)
      expect(pinsUnderCard('wide', w, h), `at ${width}`).toEqual([])
    }
  })

  it('keep every pin clear of the title chip, at every width', () => {
    for (const width of WIDTHS) {
      const { width: w, height: h } = mapSizeAt(width)
      expect(pinsUnderChip(layoutAt(width), w, h), `at ${width}`).toEqual([])
    }
  })

  it('keep the floating card inside the map', () => {
    for (const width of WIDTHS.filter((value) => value >= 768)) {
      const { width: w, height: h } = mapSizeAt(width)
      const card = cardRect(w, h)
      expect(card.left).toBeGreaterThanOrEqual(0)
      expect(card.right).toBeLessThanOrEqual(w)
      expect(card.top).toBeGreaterThanOrEqual(0)
    }
  })

  it('lay out every task in both layouts', () => {
    for (const layout of ['narrow', 'wide'] as const) {
      expect(Object.keys(PIN_SPOTS[layout]).sort()).toEqual(
        [...SHOWCASE_ORDER].sort(),
      )
    }
  })
})
