import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))
const pill = readFileSync(join(dir, 'TaskDetailMapPill.tsx'), 'utf8')
const shared = readFileSync(
  join(dir, '../../../../components/ui/ApproximateAreaPill.tsx'),
  'utf8',
)
const view = readFileSync(join(dir, 'TaskDetailView.tsx'), 'utf8')
const hero = readFileSync(join(dir, 'StatusHeader.tsx'), 'utf8')

describe('the approximate pill on task detail (FE-472)', () => {
  it('shows only for an approximate viewer with a place to draw', () => {
    expect(pill).toContain("locationAccess !== 'approximate'")
    expect(pill).toContain('taskMapCoordinates(task)')
  })

  it('rides with the content: the first child of the content wrapper, above the title wash', () => {
    const wrapper = view.slice(
      view.indexOf('mt={{ base: MOBILE_MAP_CHROME_OVERLAP'),
    )
    const afterOpen = wrapper.slice(wrapper.indexOf('>') + 1).trimStart()
    expect(afterOpen.startsWith('<TaskDetailMapPill />')).toBe(true)
    expect(pill).toContain('zIndex={2}')
    expect(pill).toContain('top={0}')
    expect(pill).toContain('calc(-100% - ${APPROX_PILL_ABOVE_CHROME_PX}px)')
  })

  it('is hidden from lg, where the map layer has the pill', () => {
    expect(pill).toContain("display={{ base: 'flex', lg: 'none' }}")
  })

  it('never blocks the map and is real text outside the aria-hidden hero', () => {
    expect(pill).toContain('pointerEvents="none"')
    expect(shared).toContain('pointerEvents="none"')
    expect(pill.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')).not.toContain(
      'aria-hidden',
    )
    // The hero's own box is aria-hidden: the pill is not inside it.
    expect(hero).toContain('aria-hidden')
    expect(hero).not.toContain('Pill')
    expect(pill).toContain('t.details.locationApproxPill')
  })

  it('is a lock and the text, in semantic tokens, with a frosted blur and the e3 shadow', () => {
    expect(shared).toContain('LuLock size={14}')
    expect(shared).toContain('color="text.muted"')
    expect(shared).toContain('color="text.default"')
    expect(shared).toContain('borderColor="border.default"')
    expect(shared).toContain('boxShadow="e3"')
    expect(shared).toContain('borderRadius="full"')
    expect(shared).toContain('fontWeight={500}')
    expect(shared).toContain('blur(24px)')
    expect(shared).toContain('92%')
    // Semantic tokens only: no raw hex, no weight above 600.
    expect(shared.replace(/#FFFFFF/g, '')).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(shared).not.toMatch(/fontWeight=\{(7|8|9)\d\d\}/)
  })
})
