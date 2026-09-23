import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('QuotesModule list chrome', () => {
  it('renders quotes as standalone cards without a section wrapper', () => {
    const src = readFileSync(join(dir, 'QuotesModule.tsx'), 'utf8')
    expect(src).toContain('id="task-quotes"')
    expect(src).not.toContain('TASK_DETAIL_SECTION_CARD')
    expect(src).not.toContain('function ModuleShell')
    expect(src).not.toContain('variant="list"')
    expect(src).toContain('isBestMatch')
    expect(src).toContain('MESSAGES_HREF')
    expect(src).not.toContain('q.quoteAccepted')
    expect(src).not.toContain('q.agreedPrice')
  })
})
