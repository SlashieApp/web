import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/** Every Chinese string in web's copy files, with where it lives. */
function chineseStrings(): Array<{ where: string; text: string }> {
  const out: Array<{ where: string; text: string }> = []
  const walk = (value: unknown, where: string) => {
    if (typeof value === 'string') {
      if (/[一-鿿]/.test(value)) out.push({ where, text: value })
    } else if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) {
        walk(child, `${where}.${key}`)
      }
    }
  }
  const files = readdirSync(join(process.cwd(), 'src'), { recursive: true })
    .map(String)
    .filter((path) => path.endsWith('i11n.json'))
  for (const file of files) {
    const bag = JSON.parse(
      readFileSync(join(process.cwd(), 'src', file), 'utf8'),
    )
    if (bag?.zh_hk) walk(bag.zh_hk, `${file} zh_hk`)
  }
  return out
}

/**
 * zh-HK calls a worker 工作者, not the English word (FE-572). `{worker}`
 * placeholders are names filled in at run time. (Worker setup's trade names,
 * such as 水喉師傅, are pinned by its own tests.)
 */
describe('zh-HK copy names workers 工作者', () => {
  const strings = chineseStrings()

  it('finds the copy', () => {
    expect(strings.length).toBeGreaterThan(100)
  })

  it('never uses the English word "worker"', () => {
    const english = strings.filter(({ text }) =>
      /\bworkers?\b/i.test(text.replace(/\{[^}]+\}/g, '')),
    )
    expect(english).toEqual([])
  })
})
