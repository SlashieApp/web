import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('QuotesModule list chrome', () => {
  it('lists quotes as rows inside one Overview section (FE-258)', () => {
    const src = readFileSync(join(dir, 'QuotesModule.tsx'), 'utf8')
    expect(src).toContain('id="task-quotes"')
    expect(src).toContain('TASK_DETAIL_SECTION_CARD')
    expect(src).toContain('<QuoteRow')
    expect(src).not.toContain('<QuoteCard')
    expect(src).not.toContain('function ModuleShell')
    expect(src).not.toContain('variant="list"')
    expect(src).toContain('isBestMatch')
    expect(src).toContain('MESSAGES_HREF')
    expect(src).not.toContain('q.quoteAccepted')
    expect(src).not.toContain('q.agreedPrice')
  })
})
