import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import messages from '@/app/(marketing)/i11n.json'

import { CUSTOMER_TILE_KEYS, chipsThatFit } from './CustomerTiles'

const css = readFileSync(
  join(
    process.cwd(),
    'src/app/(marketing)/components/ui/landing/tiles/customerTiles.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '')

const pounds = (price: string) => Number(price.replace(/[^\d.]/g, ''))

describe("the customer tiles' copy", () => {
  const bags = [messages.en.landing, messages.zh_hk.landing]

  it('has a title and a body for every tile, in the steps order', () => {
    for (const landing of bags) {
      expect(Object.keys(landing.story.customer.steps)).toEqual([
        ...CUSTOMER_TILE_KEYS,
      ])
      for (const key of CUSTOMER_TILE_KEYS) {
        const step = landing.story.customer.steps[key]
        expect(step.title.trim()).not.toBe('')
        expect(step.body.trim()).not.toBe('')
      }
    }
  })

  it('picks the lowest of nine quotes', () => {
    for (const { tiles } of bags) {
      const prices = tiles.quotes.prices.map(pounds)
      expect(prices).toHaveLength(9)
      expect(new Set(prices).size).toBe(9)
      // The fourth chip is the one drawn as picked.
      expect(prices[3]).toBe(Math.min(...prices))
    }
  })

  it("states Slashie's cut as the real figure", () => {
    // Slashie takes no cut of the job: the stat is that number, not filler.
    for (const { tiles } of bags) expect(tiles.hire.figure).toBe('0%')
  })

  it('tells the same numbers in both languages', () => {
    const [en, zh] = bags
    expect(zh?.tiles.quotes.prices).toEqual(en?.tiles.quotes.prices)
    expect(zh?.tiles.post.budgetValue).toBe(en?.tiles.post.budgetValue)
    expect(Object.keys(zh?.tiles ?? {})).toEqual(Object.keys(en?.tiles ?? {}))
  })

  it('shows nobody the hero scene already shows', () => {
    // One thing said once across the page: the tiles' task and messages are
    // their own, not the hero's.
    for (const landing of bags) {
      const hero = JSON.stringify(landing.heroStage)
      expect(hero).not.toContain(landing.tiles.post.value)
      expect(hero).not.toContain(landing.tiles.chat.theirs)
    }
  })
})

describe('chipsThatFit', () => {
  const chips = [0, 1, 2, 3, 4, 5, 6, 7, 8]

  it('shows every chip that fits whole, and none that an edge would cut', () => {
    // Three to a row, 116px apart, 96px wide; the middle row set in by 58px.
    expect(chipsThatFit(chips, 341)).toEqual([0, 1, 2, 3, 4, 6, 7, 8])
    expect(chipsThatFit(chips, 256)).toEqual([0, 1, 3, 6, 7])
    expect(chipsThatFit(chips, 400)).toEqual(chips)
  })

  it('keeps the picked chip from a 160px tile up', () => {
    for (const width of [160, 200, 256, 312, 341, 358, 600]) {
      expect(chipsThatFit(chips, width)).toContain(3)
    }
  })

  it('shows nothing in no room', () => {
    expect(chipsThatFit(chips, 80)).toEqual([])
  })
})

describe("the customer tiles' stylesheet", () => {
  it('has no nested rules, which older Safari drops whole', () => {
    const open: boolean[] = []
    let prelude = ''
    const nested: string[] = []
    for (const char of css) {
      if (char === '{') {
        const atRule = prelude.trim().startsWith('@')
        if (!atRule && open.some((isAtRule) => !isAtRule)) {
          nested.push(prelude.trim())
        }
        open.push(atRule)
        prelude = ''
      } else if (char === '}') {
        open.pop()
        prelude = ''
      } else if (char === ';') prelude = ''
      else prelude += char
    }
    expect(open).toEqual([])
    expect(nested).toEqual([])
  })

  it('takes its colours from the look tokens', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(css).not.toMatch(/\brgba?\(/)
    expect(css).toContain('var(--ss-accent)')
  })
})
