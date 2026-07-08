export type LegalSection = {
  heading: string
  body: string[]
}

/**
 * A policy document rendered by `LegalPageLayout`. Copy lives in
 * `src/content/legal/*` so legal text can be updated without touching UI code.
 */
export type LegalDocument = {
  title: string
  /** Meta description for the route. */
  description: string
  /** Human-readable display date, e.g. "8 July 2026". */
  lastUpdated: string
  /** Optional lead paragraphs shown before the first section. */
  intro?: string[]
  sections: LegalSection[]
}
