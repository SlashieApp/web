import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskInfoSections overview layout', () => {
  it('puts pricing first, then details; activity and help on the right', () => {
    const src = readFileSync(join(dir, 'TaskDetailSections.tsx'), 'utf8')
    expect(src.indexOf('<TaskPricingCard />')).toBeLessThan(
      src.indexOf('<TaskDetailsCard />'),
    )
    expect(src.indexOf('<TaskActivitySections />')).toBeGreaterThan(
      src.indexOf('<PhotosCard />'),
    )
    expect(src.indexOf('<TaskHelpActions />')).toBeLessThan(
      src.indexOf('<TaskActivitySections />'),
    )
  })

  it('puts the mobile overflow on the intro row, not in the overview stack', () => {
    const callout = readFileSync(join(dir, 'TaskDetailMoneyChrome.tsx'), 'utf8')
    const sections = readFileSync(join(dir, 'TaskDetailSections.tsx'), 'utf8')
    expect(callout).toContain('TaskHelpOverflowTrigger')
    expect(sections).not.toContain('TaskHelpOverflowTrigger')
  })
})
