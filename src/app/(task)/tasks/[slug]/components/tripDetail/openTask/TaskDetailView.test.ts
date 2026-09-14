import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
  PAGE_CONTAINER_MAX_W,
  PAGE_CONTAINER_MAX_W_CSS,
  SEARCH_LIST_COLUMN_W,
} from '@/theme/pageContainer'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskDetailView desktop column', () => {
  it('uses the page container, not the 460px search-list shell', () => {
    const src = readFileSync(join(dir, 'TaskDetailView.tsx'), 'utf8')
    expect(SEARCH_LIST_COLUMN_W).toBe('460px')
    expect(PAGE_CONTAINER_MAX_W).toBe('page')
    expect(PAGE_CONTAINER_MAX_W_CSS).toBe('90rem')
    expect(src).toContain('PAGE_CONTAINER_MAX_W')
    expect(src).toContain('PAGE_CONTAINER_MAX_W_CSS')
    expect(src).not.toContain('SEARCH_LIST_COLUMN_W')
    expect(src).not.toContain('460px')
  })
})
