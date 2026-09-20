import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskDetailCtaBar owner pin', () => {
  it('follows WorkerContactStickyBar chrome for the worker contact pin', () => {
    const src = readFileSync(join(dir, 'TaskDetailCtaBar.tsx'), 'utf8')
    expect(src).toContain('variant="stickyBar"')
    expect(src).toContain('insetX={0}')
    expect(src).toContain('boxShadow="e3"')
    expect(src).toContain('borderTopWidth="1px"')
    expect(src).toContain('env(safe-area-inset-bottom)')
  })
})
