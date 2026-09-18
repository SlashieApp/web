import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))

describe('task map camera', () => {
  it('uses flyTo for every camera move, including Back from task detail to search', () => {
    const src = readFileSync(join(dir, 'controller.ts'), 'utf8')
    expect(src).toContain('map.flyTo')
    expect(src).toContain('CAMERA_FLY_MS')
    expect(src).toContain('flyCamera')
    expect(src).not.toContain('easeTo')
    expect(src).not.toContain('jumpTo')
    expect(src).toContain('to search is a real camera change')
    expect(src).toContain("if (cameraMode === 'detail')")
    expect(src).toContain('lastCameraKey = cameraKey')
  })
})
