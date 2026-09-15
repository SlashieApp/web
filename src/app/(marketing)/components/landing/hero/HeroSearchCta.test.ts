import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('HeroSearchCta', () => {
  it('keeps the Get quotes label visible on mobile', () => {
    const src = readFileSync(join(dir, './HeroSearchCta.tsx'), 'utf8')
    expect(src).toContain('{submitLabel}')
    expect(src).not.toContain("display={{ base: 'none', sm: 'inline' }}")
  })
})
