import { describe, expect, it } from 'vitest'

import createBag from '@/app/(stepflow)/tasks/create/i11n.json'

import {
  type PhotoUploadProgress,
  photoProgressLabel,
} from './photoUploadProgress'

const en = createBag.en.photoProgress
const zhHk = createBag.zh_hk.photoProgress

const preparing: PhotoUploadProgress = {
  phase: 'preparing',
  index: 1,
  total: 3,
}
const uploading: PhotoUploadProgress = {
  phase: 'uploading',
  index: 2,
  total: 3,
}

describe('photoProgressLabel', () => {
  it('says which photo is being prepared or sent', () => {
    expect(photoProgressLabel(preparing, en)).toBe('Preparing photo 1 of 3')
    expect(photoProgressLabel(uploading, en)).toBe('Uploading photo 2 of 3')
    expect(photoProgressLabel(preparing, zhHk)).toBe(
      '正在準備第 1 張相片（共 3 張）',
    )
    expect(photoProgressLabel(uploading, zhHk)).toBe(
      '正在上載第 2 張相片（共 3 張）',
    )
  })

  it('shows the idle line before the first photo, or nothing without one', () => {
    expect(photoProgressLabel(null, en, en.posting)).toBe('Posting task')
    expect(photoProgressLabel(null, zhHk, zhHk.posting)).toBe('正在發佈任務')
    expect(photoProgressLabel(null, en)).toBeUndefined()
  })
})
