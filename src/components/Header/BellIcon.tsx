export function BellIcon() {
  // Decorative icon: the wrapping IconButton supplies the accessible name via its
  // aria-label, so this svg is aria-hidden. The <title> exists only to satisfy
  // Biome's noSvgWithoutTitle rule; aria-hidden keeps it out of the a11y tree.
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Notifications</title>
      <path
        d="M6 16h12l-1.5-2.2v-3.5a4.5 4.5 0 0 0-9 0v3.5L6 16Zm4 2a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
