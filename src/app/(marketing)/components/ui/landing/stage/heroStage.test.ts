import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import messages from '@/app/(marketing)/i11n.json'
import taskBag from '@/app/(task)/tasks/[slug]/i11n.json'
import { WEB_MIN_PX } from '@/theme/breakpoints'
import safetyBag from '@/ui/SafetyNotice/i11n.json'

import { buildHeroStageCopy } from './heroStageCopy'

const read = (name: string) =>
  readFileSync(
    join(
      process.cwd(),
      'src/app/(marketing)/components/ui/landing/stage',
      name,
    ),
    'utf8',
  ).replace(/\/\*[\s\S]*?\*\//g, '')

const css = read('heroStage.css')
/** The look every scene shares: the kit's tokens, set from the SDL's. */
const look = read('stageLook.css')

describe("the hero scene's stylesheet", () => {
  it("switches designs at the site's desktop split", () => {
    const queries = css.match(/@media[^{]+/g) ?? []
    expect(queries.map((query) => query.trim())).toEqual([
      `@media (max-width: ${WEB_MIN_PX - 1}px)`,
    ])
  })

  it('has no nested rules, which older Safari drops whole', () => {
    // A style rule inside a style rule (CSS nesting) is ignored before Safari
    // 17.2: the scene would lose its layout there. At-rules may hold rules.
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
    expect(look).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(look).toContain('--ss-accent: var(--chakra-colors-action-primary)')
    // Ink on green is dark, never white.
    expect(look).toContain('--sh-ink: var(--chakra-colors-text-on-green)')
  })
})

describe("the hero scene's copy", () => {
  const built = [
    buildHeroStageCopy(messages.en.landing.heroStage, 'en'),
    buildHeroStageCopy(messages.zh_hk.landing.heroStage, 'zh-hk'),
  ] as const

  it("says what the task page says, from the task page's own words", () => {
    // The demo must look like the product (FE-542): its labels are the task
    // page's and the accept dialog's strings, never a copy of them.
    const [en, zh] = built
    expect(en.ui.open).toBe(taskBag.en.statusPill.OPEN)
    expect(en.ui.awarded).toBe(taskBag.en.statusPill.AWARDED)
    expect(en.ui.quotesHeadlineMany).toBe(
      taskBag.en.summary.ownerQuotesHeadlineMany,
    )
    expect(en.ui.bookedHeadline).toBe(taskBag.en.summary.ownerBookedHeadline)
    expect(en.ui.accept).toBe(taskBag.en.quotes.card.accept)
    expect(en.ui.acceptTitle).toBe(safetyBag.en.acceptTitle)
    expect(zh.ui.open).toBe(taskBag.zh_hk.statusPill.OPEN)
    expect(zh.ui.acceptQuote).toBe(safetyBag.zh_hk.acceptCta)
    for (const copy of built) {
      for (const [key, value] of Object.entries(copy.ui)) {
        expect(value.trim(), key).not.toBe('')
      }
    }
  })

  it('has what the script plays, in both languages', () => {
    for (const copy of built) {
      // Two quotes arrive on the first task beside one already there; the
      // second task gets its first.
      expect(copy.tasks).toHaveLength(2)
      const [first, second] = copy.tasks
      expect(first?.base).toHaveLength(1)
      expect(first?.pulses).toHaveLength(2)
      expect(second?.base).toHaveLength(0)
      expect(second?.pulses).toHaveLength(1)
      for (const task of copy.tasks) {
        for (const quote of [...task.base, ...task.pulses]) {
          expect(quote.name.trim()).not.toBe('')
          expect(quote.slot.trim()).not.toBe('')
          expect(quote.price).toBeGreaterThan(0)
        }
      }
      expect(copy.sentQuote).toContain('{name}')
      expect(copy.label.trim()).not.toBe('')
    }
  })

  it('tells the same story in both languages', () => {
    const [en, zh] = built
    const numbers = (copy: typeof en) =>
      copy.tasks.map((task) => ({
        budget: task.budget,
        views: task.views,
        base: task.base.map((quote) => quote.price),
        pulses: task.pulses.map((quote) => quote.price),
      }))
    expect(numbers(zh)).toEqual(numbers(en))
    expect(Object.keys(zh.ui).sort()).toEqual(Object.keys(en.ui).sort())
  })

  it('books the best match: the lowest quote, at the budget', () => {
    // The customer accepts the last quote to arrive, marked Best match: it
    // should be the one a visitor would pick too.
    for (const copy of built) {
      const [first] = copy.tasks
      if (!first) throw new Error('The scene has no first task')
      const accepted = first.pulses[first.pulses.length - 1]
      const others = [...first.base, ...first.pulses.slice(0, -1)]
      expect(accepted?.price).toBe(first.budget)
      for (const quote of others) {
        expect(quote.price).toBeGreaterThan(accepted?.price ?? 0)
      }
    }
  })
})
