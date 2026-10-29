import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { SCENE_COLORS } from './scenePalette'

const dir = dirname(fileURLToPath(import.meta.url))

/** Every source file under the scene folder (models, stories, the scene), not the tests. */
function sceneSources(folder: string): string[] {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name)
    if (statSync(path).isDirectory()) return sceneSources(path)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.ts$/.test(name) ? [path] : []
  })
}

const channels = (hex: string) =>
  [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16))

describe('SCENE_COLORS', () => {
  it('is the spec palette: white, zinc, ink and one green', () => {
    expect(Object.values(SCENE_COLORS).sort()).toEqual(
      [
        '#FFFFFF',
        '#E4E4E7',
        '#D4D4D8',
        '#A1A1AA',
        '#71717A',
        '#27272A',
        '#00DC82',
        '#27272A',
      ].sort(),
    )
  })

  it('has one green and everything else zinc: no cardboard, wood or metal tones', () => {
    const tinted = Object.entries(SCENE_COLORS).filter(([, hex]) => {
      const [r, g, b] = channels(hex)
      return Math.max(r, g, b) - Math.min(r, g, b) > 12
    })
    expect(tinted.map(([name]) => name)).toEqual(['accent'])
    const [r, g, b] = channels(SCENE_COLORS.accent)
    expect(g).toBeGreaterThan(r)
    expect(g).toBeGreaterThan(b)
  })
})

describe('raw hex on the landing scene', () => {
  it('lives in scenePalette.ts only', () => {
    const strays = sceneSources(dir)
      .filter((path) => !path.endsWith('scenePalette.ts'))
      .filter((path) => /#[0-9a-fA-F]{3,8}\b/.test(readFileSync(path, 'utf8')))
    expect(strays).toEqual([])
  })
})
