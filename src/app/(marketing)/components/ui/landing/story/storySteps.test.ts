import { describe, expect, it } from 'vitest'

import messages from '@/app/(marketing)/i11n.json'

import { STORY_STAGES } from './storyState'
import {
  CUSTOMER_STAGES,
  WORKER_STAGES,
  buildIndexGroups,
  stepDomId,
} from './storySteps'

/** An em dash or an en dash, by code point so that this file has none itself. */
const DASHES = new RegExp(`[${String.fromCharCode(0x2014, 0x2013)}]`)

const locales = {
  en: messages.en.landing.story,
  zh_hk: messages.zh_hk.landing.story,
} as const

describe('the how-it-works steps', () => {
  it('lists the customer act, then the worker act, in the order of the story stages', () => {
    const stages = [...CUSTOMER_STAGES, ...WORKER_STAGES]
    const positions = stages.map((stage) => STORY_STAGES.indexOf(stage))
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
    expect(new Set(stages).size).toBe(stages.length)
  })

  it('gives every step its own row id, which the index links to', () => {
    const ids = [...CUSTOMER_STAGES, ...WORKER_STAGES].map(stepDomId)
    expect(new Set(ids).size).toBe(ids.length)
    // The section's own id is "how-it-works": a step's id must not repeat it.
    expect(ids).not.toContain('how-it-works')
    expect(stepDomId('quotes')).toBe('how-it-works-quotes')
  })
})

describe('the section index', () => {
  for (const [locale, story] of Object.entries(locales)) {
    describe(locale, () => {
      const groups = buildIndexGroups(story.index)

      it('has a group per act, with a link per step, in order', () => {
        expect(groups.map((group) => group.map((item) => item.stage))).toEqual([
          [...CUSTOMER_STAGES],
          [...WORKER_STAGES],
        ])
      })

      it('links each label to its step row', () => {
        for (const item of groups.flat()) {
          expect(item.href).toBe(`#${stepDomId(item.stage)}`)
        }
      })

      it('has a short, distinct label for every step', () => {
        const labels = groups.flat().map((item) => item.label)
        expect(labels.every((label) => label.trim().length > 0)).toBe(true)
        expect(new Set(labels).size).toBe(labels.length)
        // Short: it sits in a 144px column and in a row that scrolls sideways.
        for (const label of labels) {
          expect([...label].length).toBeLessThanOrEqual(12)
        }
      })

      it('names the index', () => {
        expect(story.index.label.trim().length).toBeGreaterThan(0)
      })
    })
  }

  it('has the same keys in English and Traditional Chinese', () => {
    expect(Object.keys(locales.zh_hk.index).sort()).toEqual(
      Object.keys(locales.en.index).sort(),
    )
  })

  it('keeps the house rules for copy: no em dash, and a worker is 工作者, not 師傅', () => {
    for (const story of Object.values(locales)) {
      for (const text of Object.values(story.index)) {
        expect(text).not.toMatch(DASHES)
        expect(text).not.toContain('師傅')
      }
    }
  })
})
