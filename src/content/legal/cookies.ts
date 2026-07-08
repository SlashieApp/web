import { LEGAL_CONTACT_EMAIL } from './company'
import type { LegalDocument } from './types'

// FOUNDER-DRAFTED MVP LEGAL COPY. Keep the cookie lists here in sync with what
// the app actually sets: the `auth` cookie (src/utils/auth.ts), the consent
// choice (src/utils/analytics/consent.ts), and PostHog (loaded only after the
// visitor accepts analytics cookies).
export const COOKIES_DOCUMENT: LegalDocument = {
  title: 'Cookie Policy',
  description:
    'The cookies and similar storage Slashie uses, and how to control them.',
  lastUpdated: '8 July 2026',
  intro: [
    'Cookies are small pieces of data stored in your browser. Slashie also uses similar browser storage (localStorage). This page lists what we set and why, and how you can control it.',
  ],
  sections: [
    {
      heading: '1. Essential cookies and storage',
      body: [
        'These are required for the site to work and do not need consent. They are always on.',
        'auth (cookie): keeps you signed in after you log in or register. Lasts up to 7 days.',
        'slashie.cookie-consent (localStorage): remembers whether you accepted or declined analytics cookies, so we do not ask you on every visit.',
      ],
    },
    {
      heading: '2. Analytics cookies (optional)',
      body: [
        'If you choose "Accept all" in the cookie banner, we load PostHog, our product analytics tool. PostHog sets cookies and localStorage entries beginning with "ph_" to recognise your browser across visits and to record how the product is used: pages visited, device and browser type, and interactions such as posting a task or sending a quote.',
        'We use this to understand what is working and to improve Slashie. Our PostHog data is hosted in the EU and we do not send your email address to it. If you choose "Essential only", PostHog is never loaded and no analytics cookies are set. Slashie works exactly the same either way.',
      ],
    },
    {
      heading: '3. Your choices',
      body: [
        'On your first visit we ask whether to allow analytics cookies. You can accept all or keep essential only, and we remember your choice in your browser.',
        'To change your mind, clear the stored data for slashie.app in your browser settings (the banner will ask again on your next visit). Your browser also lets you block or delete cookies entirely, though blocking essential cookies will stop sign-in from working.',
      ],
    },
    {
      heading: '4. Contact',
      body: [
        `Questions about cookies: ${LEGAL_CONTACT_EMAIL}. See also our Privacy Policy at slashie.app/privacy.`,
      ],
    },
  ],
}
