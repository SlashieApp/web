/** Limits for a chip list; the API applies the same caps. */
export type ChipRules = {
  max: number
  minChars: number
  maxChars: number
  /** Capitalise each word ("tv mounting" to "Tv Mounting"); existing capitals stay. */
  titleCase?: boolean
}

export type ChipDrop = {
  text: string
  reason: 'tooShort' | 'tooLong' | 'duplicate' | 'full'
}

const titleCase = (text: string) =>
  text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

/**
 * Adds typed or pasted chips (split on commas, semicolons and new lines),
 * with whitespace collapsed, a case-insensitive dedupe and the caps.
 * `dropped` is the first one turned away, so the input can say why.
 */
export function addChips(
  current: readonly string[],
  raw: string,
  rules: ChipRules,
): { items: string[]; dropped: ChipDrop | null } {
  const items = [...current]
  const seen = new Set(current.map((item) => item.toLowerCase()))
  let dropped: ChipDrop | null = null
  for (const part of raw.split(/[,;\n]+/)) {
    const text = part.trim().replace(/\s+/g, ' ')
    if (!text) continue
    const reason: ChipDrop['reason'] | null =
      items.length >= rules.max
        ? 'full'
        : text.length < rules.minChars
          ? 'tooShort'
          : text.length > rules.maxChars
            ? 'tooLong'
            : seen.has(text.toLowerCase())
              ? 'duplicate'
              : null
    if (reason) {
      dropped ??= { text, reason }
      continue
    }
    seen.add(text.toLowerCase())
    items.push(rules.titleCase ? titleCase(text) : text)
  }
  return { items, dropped }
}
