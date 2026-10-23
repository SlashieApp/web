import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('map taps on /search (FE-401)', () => {
  it('lets a pin tap select through the shared setter, and open only when selected', () => {
    const src = readFileSync(join(dir, 'useSelectBrowseTaskFromMap.ts'), 'utf8')
    expect(src).toContain("mapPinTapAction(id, selectedTaskId) === 'open'")
    expect(src).toContain('setSelectedTaskId(id)')
    expect(src).toContain('setSelectedTaskId(null)')
  })

  it('keeps opening the task straight away from a same-spot list row', () => {
    const layer = readFileSync(
      join(dir, '../search/components/map/SearchMapLayer.tsx'),
      'utf8',
    )
    expect(layer).toContain('onSelectTask: selectFromMap')
    expect(layer).toContain('onSelect={openFromMap}')
    expect(layer).not.toContain('onSelect={selectFromMap}')
  })
})
