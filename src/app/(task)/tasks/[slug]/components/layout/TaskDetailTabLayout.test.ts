import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('TaskDetailTabLayout slots', () => {
  it('snaps the sticky header, paints it white, and fades compact chrome over the map', () => {
    const src = readFileSync(join(dir, 'TaskDetailTabLayout.tsx'), 'utf8')
    expect(src).toContain('stickyBg="transparent"')
    expect(src).toContain('StuckHeaderBg')
    expect(src).toContain('#FFFFFF')
    expect(src).toContain('data-task-detail-stuck-bg')
    expect(src).toContain('animate={{ opacity: isStuck ? 1 : 0 }}')
    expect(src).toContain('initial={false}')
    expect(src).toContain('title({ isStuck })')
    expect(src).toContain('TASK_DETAIL_STICKY_SNAP_OFFSET_PX')
    expect(src).toContain("panelBg={{ base: 'bg.canvas', lg: 'transparent' }}")
    expect(src).toContain('MAP_FADE_BOTTOM')
    expect(src).toContain('COMPACT_HEADER_FADE_CSS')
    expect(src).toContain("width: '100vw'")
    expect(src).toContain('&::before')
    expect(src).toContain('fadeTabListBorder')
    expect(src).toContain(
      "tabListMaxW={{ base: 'full', lg: 'calc((100% - 1.5rem) * 2 / 3)' }}",
    )
    expect(src).toContain("'minmax(0, 2fr) minmax(0, 1fr)'")
    expect(src).not.toContain('tabListAside')
    expect(src).toContain('rail')
    expect(src).toContain('tabTitle')
    expect(src).toContain('tabDescription')
    expect(src.indexOf('<TabIntro')).toBeLessThan(src.indexOf('<Grid'))
    expect(src.indexOf('{mainCta}')).toBeLessThan(src.indexOf('<Grid'))
    expect(src).toContain('mainCta')
    expect(src).toContain('position="absolute"')
    expect(src).toContain('right={0}')
    expect(src).toContain('bottom={0}')
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
