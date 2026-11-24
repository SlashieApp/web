import { describe, expect, it } from 'vitest'

import {
  richTextForSubmit,
  richTextToPlain,
  sanitizeRichText,
} from './richText'

describe('sanitizeRichText', () => {
  it('keeps bold, italic and lists, and drops scripts and attributes', () => {
    expect(
      sanitizeRichText(
        '<p onclick="x">Hello <strong>there</strong></p><script>alert(1)</script><ul><li>One</li></ul>',
      ),
    ).toBe('<p>Hello <strong>there</strong></p><ul><li>One</li></ul>')
  })
})

describe('richTextToPlain', () => {
  it('reads the words out of markup', () => {
    expect(
      richTextToPlain('<p>Fix the <b>tap</b></p><ul><li>Washer</li></ul>'),
    ).toBe('Fix the tap\nWasher')
    expect(richTextToPlain('<p><br></p>')).toBe('')
  })
})

describe('richTextForSubmit', () => {
  it('stores nothing when the field is empty', () => {
    expect(richTextForSubmit('<p><br></p>')).toBe('')
    expect(richTextForSubmit('<p>Hello</p>')).toBe('<p>Hello</p>')
  })
})
