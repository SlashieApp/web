import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskDetailTabs slot wiring', () => {
  it('passes tabTitle, tabDescription, and cards into the layout', () => {
    const src = readFileSync(join(dir, 'TaskDetailTabs.tsx'), 'utf8')
    expect(src).toContain('tabTitle: copy?.headline')
    expect(src).toContain('tabDescription: copy?.subtext')
    expect(src).not.toContain('tabIconButton')
    expect(src).not.toContain('TaskHelpOverflowTrigger')
    expect(src).not.toContain('mainCta')
    expect(src).toContain('cards: <OverviewCards />')
    expect(src).toContain('cards: <QuotesCards />')
    expect(src).toContain('t.trust.ownerHeading')
    expect(src).toContain('t.trust.workerHeading')
    expect(src).toContain('SafetyNotice')
    expect(src).toContain('cards: <AnalyticsCards />')
    expect(src).toContain('t.analytics.overallTitle')
    expect(src).toContain('tabTitle: analyticsTitle')
    expect(src).toContain(
      'title={({ isStuck }) => <TaskTitle isStuck={isStuck} />}',
    )
    expect(src).not.toContain('TASK_DETAIL_TAB.activity')
  })
})
