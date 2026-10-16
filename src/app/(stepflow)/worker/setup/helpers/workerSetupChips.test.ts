import { describe, expect, it } from 'vitest'

import { addChips } from './workerSetupChips'
import { QUALIFICATION_RULES } from './workerSetupQualifications'
import { SKILLS_MAX, SKILL_RULES } from './workerSetupSkills'

describe('addChips', () => {
  it('splits pasted lists and title-cases skills, keeping capitals', () => {
    expect(
      addChips(['Painting'], 'tiling; tv  mounting,TV wall', SKILL_RULES),
    ).toEqual({
      items: ['Painting', 'Tiling', 'Tv Mounting', 'TV Wall'],
      dropped: null,
    })
  })

  it('keeps qualifications as typed', () => {
    expect(addChips([], 'NICEIC, gas safe', QUALIFICATION_RULES).items).toEqual(
      ['NICEIC', 'gas safe'],
    )
  })

  it('says why a chip was turned away', () => {
    expect(addChips([], 'x', SKILL_RULES).dropped).toEqual({
      text: 'x',
      reason: 'tooShort',
    })
    expect(addChips([], 'a'.repeat(31), SKILL_RULES).dropped?.reason).toBe(
      'tooLong',
    )
    expect(addChips(['Painting'], 'painting', SKILL_RULES)).toEqual({
      items: ['Painting'],
      dropped: { text: 'painting', reason: 'duplicate' },
    })
  })

  it('stops at the cap and says so', () => {
    const full = Array.from({ length: SKILLS_MAX }, (_, i) => `Skill ${i}`)
    expect(addChips(full, 'One more', SKILL_RULES)).toEqual({
      items: full,
      dropped: { text: 'One more', reason: 'full' },
    })
  })

  it('reports only the first problem and adds the rest', () => {
    expect(addChips([], 'x, Tiling', SKILL_RULES)).toEqual({
      items: ['Tiling'],
      dropped: { text: 'x', reason: 'tooShort' },
    })
  })
})
