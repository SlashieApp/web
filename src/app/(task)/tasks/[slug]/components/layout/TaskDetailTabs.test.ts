import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskDetailTabs slot wiring', () => {
  it('passes tabTitle, tabDescription, tabIconButton, cards, and mainCta into the layout', () => {
    const src = readFileSync(join(dir, 'TaskDetailTabs.tsx'), 'utf8')
    expect(src).toContain('tabTitle: copy?.headline')
    expect(src).toContain('tabDescription: copy?.subtext')
    expect(src).toContain('tabIconButton')
    expect(src).toContain('<TaskHelpOverflowTrigger />')
    expect(src).toContain('cards: <OverviewCards />')
    expect(src).toContain('cards: <QuotesCards />')
    expect(src).toContain('cards: <AnalyticsCards />')
    expect(src).toContain('mainCta={<TaskDetailMainCta />}')
    expect(src).toContain(
      'title={({ isStuck }) => <TaskTitle isStuck={isStuck} />}',
    )
    expect(src).not.toContain('TASK_DETAIL_TAB.activity')
  })
})
