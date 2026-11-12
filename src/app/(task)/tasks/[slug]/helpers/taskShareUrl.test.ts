import { describe, expect, it } from 'vitest'

import { taskShareUrl } from './taskShareUrl'

const ORIGIN = 'https://www.slashie.app'
const english = (href: string) => href
const zhHk = (href: string) => `/zh-hk${href}`

describe('taskShareUrl (FE-475)', () => {
  it("is the task's own address and nothing else", () => {
    expect(taskShareUrl('task-1', english, ORIGIN)).toBe(
      'https://www.slashie.app/tasks/task-1',
    )
  })

  it("keeps the page's language", () => {
    expect(taskShareUrl('task-1', zhHk, ORIGIN)).toBe(
      'https://www.slashie.app/zh-hk/tasks/task-1',
    )
  })

  it('carries no search position, whatever page it is shared from', () => {
    const url = new URL(taskShareUrl('task-1', english, ORIGIN))
    expect(url.search).toBe('')
    expect(url.hash).toBe('')
    expect(url.href).not.toMatch(/lat|lng|from=/)
  })

  it('an id cannot add a query or a path', () => {
    const url = new URL(taskShareUrl('a?lat=51.5&lng=-0.1#x', english, ORIGIN))
    expect(url.pathname).toBe('/tasks/a%3Flat%3D51.5%26lng%3D-0.1%23x')
    expect(url.search).toBe('')
  })
})
