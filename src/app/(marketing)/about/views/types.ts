/**
 * Who's reading /about. `getAboutView` picks one; each has a config file in
 * this folder and a row in README.md.
 */
export type AboutView = 'guest' | 'signedIn'

/** A closing button: its label (`common.ctas` in the marketing bag) and path. */
export type AboutAction = {
  label: 'postTask' | 'becomeWorker' | 'browseTasks'
  /** Bare path; the page adds the locale. */
  href: string
}

/** Everyone reads the same page; only the closing buttons change. */
export type AboutViewConfig = {
  primary: AboutAction
  secondary: AboutAction
}
