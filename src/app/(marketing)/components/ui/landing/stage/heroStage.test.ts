import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import messages from '@/app/(marketing)/i11n.json'
import { WEB_MIN_PX } from '@/theme/breakpoints'

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
  const bags = [messages.en.landing.heroStage, messages.zh_hk.landing.heroStage]

  it('has what the script plays, in both languages', () => {
    for (const copy of bags) {
      // The script sends two quotes on the first task and one on the second,
      // beside one that was already there.
      expect(copy.tasks).toHaveLength(2)
      const [first, second] = copy.tasks
      expect(first?.pulses).toHaveLength(2)
      expect(second?.pulses.length).toBeGreaterThanOrEqual(1)
      for (const task of copy.tasks) {
        expect(task.base.length).toBeGreaterThanOrEqual(1)
        for (const quote of [...task.base, ...task.pulses]) {
          expect(quote.name.trim()).not.toBe('')
          expect(quote.price).toBeGreaterThan(0)
        }
      }
      expect(copy.sentQuote).toContain('{name}')
      expect(copy.label.trim()).not.toBe('')
    }
  })

  it('tells the same story in both languages', () => {
    const [en, zh] = bags
    const numbers = (copy: typeof en) =>
      copy.tasks.map((task) => ({
        budget: task.budget,
        base: task.base.map((quote) => quote.price),
        pulses: task.pulses.map((quote) => quote.price),
      }))
    expect(numbers(zh)).toEqual(numbers(en))
    expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort())
  })

  it('books the lowest quote on the first task', () => {
    // The customer accepts the last quote to arrive: it should be the one a
    // visitor would pick too, the cheapest, at the task's budget.
    for (const copy of bags) {
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
