'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import { type ReactNode, createElement, useMemo } from 'react'

import {
  looksLikeRichText,
  richTextToPlain,
  sanitizeRichText,
} from './richText'

const richTextCss = {
  '& p': { margin: 0 },
  '& ul, & ol': { margin: 0, paddingInlineStart: '1.25rem' },
} as const

const TAG = /^<\/?([a-z0-9]+)>$/i

/** Turn the allowed tags into elements. Nothing else reaches the page. */
function richTextNodes(html: string): ReactNode[] {
  const parts = sanitizeRichText(html).split(
    /(<\/?(?:p|br|b|strong|i|em|u|ul|ol|li|div)>)/i,
  )
  const root: ReactNode[] = []
  const stack: { tag: string; children: ReactNode[] }[] = [
    { tag: 'root', children: root },
  ]
  let key = 0
  for (const part of parts) {
    if (!part) continue
    const token = TAG.exec(part)
    const frame = stack[stack.length - 1]
    if (!token) {
      frame.children.push(part)
      continue
    }
    const name = token[1].toLowerCase()
    if (part.startsWith('</')) {
      const closed = stack.pop()
      if (!closed || closed.tag === 'root' || closed.tag !== name) continue
      stack[stack.length - 1].children.push(
        createElement(closed.tag, { key: key++ }, closed.children),
      )
      continue
    }
    if (name === 'br') {
      frame.children.push(createElement('br', { key: key++ }))
      continue
    }
    stack.push({ tag: name, children: [] })
  }
  return root
}

/**
 * A stored description. Plain text stays as typed, with its line breaks.
 * Markup is limited to bold, italic and lists.
 */
export function RichTextView({
  value,
  ...props
}: { value: string } & BoxProps) {
  const nodes = useMemo(
    () => (looksLikeRichText(value) ? richTextNodes(value) : null),
    [value],
  )
  if (!nodes) {
    return (
      <Box whiteSpace="pre-line" {...props}>
        {value}
      </Box>
    )
  }
  return (
    <Box whiteSpace="pre-line" css={richTextCss} {...props}>
      {nodes}
    </Box>
  )
}

export { richTextToPlain }
