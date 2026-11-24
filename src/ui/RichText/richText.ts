/** Tags a task description may keep. Everything else is dropped. */
const ALLOWED = new Set([
  'p',
  'br',
  'b',
  'strong',
  'i',
  'em',
  'u',
  'ul',
  'ol',
  'li',
  'div',
])

/** True when the string carries markup, not only plain text. */
export function looksLikeRichText(value: string): boolean {
  return /<\/?[a-z]/i.test(value)
}

/**
 * Keep only the tags a description may use, with no attributes. Works without
 * the DOM, so a server render and the browser agree.
 */
export function sanitizeRichText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/?([a-z0-9]+)(?:\s[^>]*)?>/gi, (match, tag: string) => {
      const name = tag.toLowerCase()
      if (!ALLOWED.has(name)) return ''
      if (name === 'br') return '<br>'
      return match.startsWith('</') ? `</${name}>` : `<${name}>`
    })
}

/** The words of a description, for a preview or an empty check. */
export function richTextToPlain(value: string): string {
  return sanitizeRichText(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** What the API stores: nothing when the field has no words. */
export function richTextForSubmit(value: string): string {
  return richTextToPlain(value) ? sanitizeRichText(value) : ''
}
