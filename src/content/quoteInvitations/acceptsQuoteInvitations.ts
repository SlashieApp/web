/**
 * `me.settings.acceptsQuoteInvitations` (FE-507) by hand until the next
 * `bun run codegen` brings it into the generated `MeQuery`. The API defaults it
 * to on, so a settings object that does not carry it yet reads as on.
 */
export function acceptsQuoteInvitations(
  settings: object | null | undefined,
): boolean {
  return (
    (
      settings as
        | { acceptsQuoteInvitations?: boolean | null }
        | null
        | undefined
    )?.acceptsQuoteInvitations ?? true
  )
}
