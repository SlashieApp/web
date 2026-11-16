/**
 * The Terms version Sign up and Log in send with a new account (BE-128,
 * FE-570): the Terms page's "Last updated" date as `YYYY-MM-DD`. The API keeps
 * the list it accepts (`TERMS_VERSIONS` in apollo); a date it doesn't know is
 * `TERMS_VERSION_UNKNOWN`.
 *
 * When the Terms change: update the date on the Terms page
 * (`(marketing)/terms/i11n.json`, both languages), add the new date to the
 * API's list and deploy it, then change this. `termsVersion.test.ts` fails
 * while this and the page disagree.
 */
export const TERMS_VERSION = '2026-07-08'

/** What a sign-up that showed the consent line sends: `consent` on the API. */
export function signUpConsent(): { termsVersion: string } {
  return { termsVersion: TERMS_VERSION }
}
