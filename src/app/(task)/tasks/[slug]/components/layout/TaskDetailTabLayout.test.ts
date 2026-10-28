import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskDetailTabLayout slots', () => {
  it('scrolls the title with the page, sticks the tabs under the bar, and fades compact chrome over the map', () => {
    const src = readFileSync(join(dir, 'TaskDetailTabLayout.tsx'), 'utf8')
    // The title is the page header's to collapse (FE-458): it no longer sits in
    // the sticky chrome, and nothing is docked on the old 2px inset.
    expect(src).toContain('{title}')
    expect(src).not.toContain('title({ isStuck })')
    expect(src).not.toContain('TASK_DETAIL_STUCK')
    expect(src).not.toContain('data-task-detail-stuck')
    expect(src).not.toContain('IntersectionObserver')
    expect(src).toContain('stickyTop={`${HEADER_BAR_H}px`}')
    expect(src).toContain(
      "stickyBg={tabs.length > 1 ? 'bg.canvas' : 'transparent'}",
    )
    expect(src).not.toContain('TASK_DETAIL_STICKY_SNAP_OFFSET_PX')
    expect(src).toContain("panelBg={{ base: 'bg.canvas', lg: 'transparent' }}")
    expect(src).toContain('MAP_FADE_BOTTOM')
    expect(src).toContain('COMPACT_TITLE_FADE_CSS')
    expect(src).toContain("width: '100vw'")
    expect(src).toContain('&::before')
    expect(src).toContain('fadeTabListBorder')
    expect(src).toContain('hideTabList={tabs.length < 2}')
    expect(src).not.toContain('tabListMaxW')
    expect(src).toContain("'minmax(0, 2fr) minmax(0, 1fr)'")
    expect(src).not.toContain('tabListAside')
    expect(src).toContain('rail')
    // FE-274: the status intro moved into the Task summary. The web CTA sits
    // beside the title (bottom-aligned with the chips); the title scrolls away
    // with the chips and the CTA, which render in the content.
    expect(src).not.toContain('tabTitle')
    expect(src).not.toContain('TabIntro')
    expect(src).toContain('WEB_MAIN_CTA_W')
    expect(src.indexOf('{mainCta}')).toBeLessThan(src.indexOf('<Grid'))
    expect(src.indexOf('{mainCta}')).toBeGreaterThan(
      src.indexOf('tabs={tabs.map'),
    )
    expect(src.indexOf('{meta}')).toBeGreaterThan(src.indexOf('tabs={tabs.map'))
    expect(src).toContain('align="flex-end"')
    expect(src).not.toContain('syncIntroMinHeight')
    expect(src).not.toContain('ctaObserverRef')
    expect(src).not.toContain('intro.style.minHeight')
    expect(src).toContain('{rail}')
    expect(src).toContain('pt={0}')
    expect(src).toContain('TASK_DETAIL_TAB_BODY_MIN_H')
    expect(src).not.toContain('minH="100dvh"')
    const layout = readFileSync(
      join(dir, '../../helpers/taskDetailLayout.ts'),
      'utf8',
    )
    expect(layout).toContain('calc(100dvh - ${COMPACT_DETAIL_HERO_H.base})')
    expect(layout).toContain('calc(100dvh - ${COMPACT_DETAIL_HERO_H.md})')
    expect(layout).toContain('calc(100dvh - ${TASK_DETAIL_DESKTOP_MAP_SPACER})')
    expect(src).not.toContain('tabIconButton')
    expect(src).toContain('rail')
  })
})
