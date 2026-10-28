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
    // Page width tightened to 80rem in 8024b97 (2026-09-21).
    expect(PAGE_CONTAINER_MAX_W_CSS).toBe('80rem')
    expect(src).toContain('PAGE_CONTAINER_MAX_W')
    expect(src).toContain('PAGE_CONTAINER_MAX_W_CSS')
    expect(src).not.toContain('SEARCH_LIST_COLUMN_W')
    expect(src).not.toContain('460px')
  })

  it('keeps the page transparent so the map shows through sticky chrome', () => {
    const src = readFileSync(join(dir, 'TaskDetailView.tsx'), 'utf8')
    expect(src).toContain('bg="transparent"')
    expect(src).toContain('position="sticky"')
    expect(src).toContain('MOBILE_MAP_CHROME_OVERLAP')
    expect(src).toContain('-9.25rem')
    expect(src).toContain("display={{ base: 'block', lg: 'none' }}")
    expect(src).toContain('TASK_DETAIL_DESKTOP_MAP_SPACER')
    expect(src).toContain('TASK_DETAIL_PIN_CLEARANCE')
    expect(src).toContain('<Reveal>')
    expect(src).toContain('TaskDetailTabs')
    expect(src).not.toContain('TaskDetailMainCta')
  })

  it('puts Back and the options menu in the page header bar over the map, at every width', () => {
    const src = readFileSync(join(dir, 'TaskDetailView.tsx'), 'utf8')
    expect(src).toContain('<StickyHeader')
    expect(src).toContain('overMedia')
    expect(src).toContain('onBack={onBack}')
    expect(src).toContain('useTaskBack')
    expect(src).toContain('option={<TaskHelpOverflowTrigger overlay />}')
    // The bar lines up with the page body's gutters and column.
    expect(src).toContain('contentMaxW={PAGE_CONTAINER_MAX_W}')
    expect(src).toContain('contentPx={BODY_GUTTER_X}')
    // Nothing is pinned at the old docked title row any more.
    expect(src).not.toContain('TaskBackButton')
    expect(src).not.toContain('TASK_DETAIL_STUCK')
  })
})
