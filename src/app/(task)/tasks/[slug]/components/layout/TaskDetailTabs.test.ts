import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskDetailTabs slot wiring', () => {
  it('passes the cards and rail into the layout', () => {
    const src = readFileSync(join(dir, 'TaskDetailTabs.tsx'), 'utf8')
    expect(src).not.toContain('tabTitle')
    expect(src).not.toContain('statusHeaderCopy')
    expect(src).not.toContain('tabIconButton')
    expect(src).not.toContain('TaskHelpOverflowTrigger')
    expect(src).not.toContain('tabListAside')
    expect(src).toContain('mainCta={mainCta ? <TaskDetailMainCta /> : null}')
    expect(src).toContain('rail={<TaskDetailSideRail />}')
    expect(src).toContain('cards: <OverviewCards />')
    // Quotes are an Overview section (FE-258), not a tab.
    expect(src).not.toContain('QuotesCards')
    expect(src).not.toContain('TASK_DETAIL_TAB.quotes')
    // Analytics is an owner card / drawer (FE-258), not a tab.
    expect(src).not.toContain('AnalyticsCards')
    expect(src).toContain('title={<TaskTitle />}')
    expect(src).not.toContain('TASK_DETAIL_TAB.activity')
  })
})
