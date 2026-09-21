import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('QuotesPanel skeleton', () => {
  it('uses card-shaped skeletons instead of a section Card wrapper', () => {
    const src = readFileSync(join(dir, 'QuotesPanel.tsx'), 'utf8')
    expect(src).not.toContain('TASK_DETAIL_SECTION_CARD')
    expect(src).toContain('QuotesPanelSkeleton')
    expect(src).toContain('borderRadius="lg"')
  })
})
