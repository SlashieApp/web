import { TaskStatus } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  canUploadTaskImages,
  freeTaskImageSlots,
  nextTaskImageUploadIndex,
  taskImageExtension,
  taskImageKey,
} from './taskImageKeys'

const file = (name: string, type: string) => ({ name, type })

describe('taskImageExtension', () => {
  it("keeps an allowed extension from the file's name", () => {
    expect(taskImageExtension(file('Kitchen.JPEG', 'image/jpeg'))).toBe('jpeg')
    expect(taskImageExtension(file('a.heif', ''))).toBe('heif')
  })

  it('falls back to the MIME type for a missing or unknown extension', () => {
    expect(taskImageExtension(file('IMG_0001', 'image/heic'))).toBe('heic')
    expect(taskImageExtension(file('photo.jfif', 'image/jpeg'))).toBe('jpg')
  })

  it('has none for a type the API does not take', () => {
    expect(taskImageExtension(file('scan.bmp', 'image/bmp'))).toBeNull()
    expect(taskImageExtension(file('notes', ''))).toBeNull()
  })
})

describe('taskImageKey', () => {
  it('is one digit and an allowed extension', () => {
    expect(taskImageKey(0, file('a.png', 'image/png'))).toBe('0.png')
    expect(taskImageKey(9, file('b', 'image/webp'))).toBe('9.webp')
  })

  it('never goes past slot 9 or sends an unknown type', () => {
    expect(() => taskImageKey(10, file('a.png', 'image/png'))).toThrow()
    expect(() => taskImageKey(1, file('a.bmp', 'image/bmp'))).toThrow()
  })
})

describe('slots', () => {
  const url = (key: string) => `https://cdn.example.com/tasks/t1/${key}?v=1`

  it('picks the lowest free slot, filling gaps', () => {
    expect(nextTaskImageUploadIndex([])).toBe(0)
    expect(nextTaskImageUploadIndex([url('0.jpg'), url('2.png')])).toBe(1)
    expect(freeTaskImageSlots([url('0.jpg'), url('2.png')])).toEqual([
      1, 3, 4, 5, 6, 7, 8, 9,
    ])
  })

  it('stops when all ten slots are used', () => {
    const all = Array.from({ length: 10 }, (_, i) => url(`${i}.jpg`))
    expect(nextTaskImageUploadIndex(all)).toBeNull()
    expect(freeTaskImageSlots(all)).toEqual([])
  })
})

describe('canUploadTaskImages', () => {
  it('only while the task is open or a draft', () => {
    expect(canUploadTaskImages(TaskStatus.Open)).toBe(true)
    expect(canUploadTaskImages(TaskStatus.Draft)).toBe(true)
    expect(canUploadTaskImages(TaskStatus.Awarded)).toBe(false)
    expect(canUploadTaskImages(null)).toBe(false)
  })
})
