import {
  COMPANY_LEGAL_NAME,
  COMPANY_NUMBER,
  COMPANY_REGISTERED_OFFICE,
  LEGAL_CONTACT_EMAIL,
} from './company'
import type { LegalDocument } from './types'

// FOUNDER-DRAFTED MVP LEGAL COPY reflecting how the product actually works
// (public task listings with approximate location, contact sharing on quote
// acceptance, Stripe subscription billing, consent-gated PostHog analytics).
// SOLICITOR / DPO REVIEW REQUIRED before public London launch.
export const PRIVACY_DOCUMENT: LegalDocument = {
  title: 'Privacy Policy',
  description:
    'How Slashie collects, uses, and protects your data on the map-first local task marketplace.',
  lastUpdated: '8 July 2026',
  intro: [
    `This policy explains how ${COMPANY_LEGAL_NAME} ("Slashie", "we", "us") collects and uses personal data when you use slashie.app and the Slashie apps. Slashie Ltd is the data controller, registered in England and Wales (company no. ${COMPANY_NUMBER}) at ${COMPANY_REGISTERED_OFFICE}. Contact us about privacy at ${LEGAL_CONTACT_EMAIL}.`,
  ],
  sections: [
    {
      heading: '1. Data we collect',
      body: [
        'Account data: name, email address, phone number, and password (stored hashed). If you sign in with Google we receive your name, email, and profile picture from Google.',
        'Profile data: photo, bio, skills, service area, and any verification information you complete.',
        'Marketplace data: tasks you post (descriptions, photos, budget, timing, and location), quotes you send, orders, messages, and reviews.',
        'Location data: the location you give a task, and an approximate location from your browser or device when you allow it (used to show nearby tasks on the map).',
        'Billing data: for worker subscriptions, Stripe processes your payment and we hold billing metadata such as your Stripe customer id, plan, and subscription status. We never see or store full card details.',
        'Usage data: with your consent, analytics about how you use the product (pages visited, device and browser type, interactions). We do not send your email address to our analytics tool.',
      ],
    },
    {
      heading: '2. Why we use it (lawful bases)',
      body: [
        'To run the marketplace, that is to show tasks on the map, match workers to nearby work, deliver quotes, messages, and notifications, and bill worker subscriptions. Lawful basis: performance of our contract with you.',
        'To keep the Service safe, prevent fraud, spam, and abuse, enforce our Terms, and improve the product. Lawful basis: our legitimate interests in operating a safe, working service.',
        'To measure product usage through analytics cookies. Lawful basis: your consent, which you can decline or withdraw at any time.',
        'To meet legal obligations, such as tax and accounting rules for subscription billing, or responding to lawful requests. Lawful basis: legal obligation.',
      ],
    },
    {
      heading: '3. What other users see',
      body: [
        'Tasks are public listings: title, description, budget, photos, and an approximate location are visible to workers browsing the map. Your exact address and direct contact details are shared only with the worker whose quote you accept (and, for workers, with the customer who accepts your quote). Worker profiles, verification status, and reviews are public.',
      ],
    },
    {
      heading: '4. Job payments',
      body: [
        'Payment for jobs is arranged directly between customer and worker, outside Slashie. We do not process, record, or hold job payments or job payment card details. The only payments we process are worker subscriptions, via Stripe.',
      ],
    },
    {
      heading: '5. Who we share data with',
      body: [
        'We share data with service providers who help us run Slashie, under contract and only on our instructions: Stripe (subscription billing), Resend (email delivery), Twilio (SMS and phone verification), PostHog (product analytics, only if you consent), MongoDB Atlas (database hosting), Vercel and Render (application hosting), our content delivery network (serving the site and images), and Mapbox (maps and geocoding).',
        'We do not sell your personal data. We may disclose data if the law requires it, or as part of a company sale or restructuring (in which case this policy continues to apply).',
      ],
    },
    {
      heading: '6. International transfers',
      body: [
        'We aim to keep personal data in the UK and EEA. Where a provider processes data outside those regions, we rely on UK adequacy regulations or appropriate safeguards such as the UK International Data Transfer Agreement or Standard Contractual Clauses with the UK addendum.',
      ],
    },
    {
      heading: '7. How long we keep it',
      body: [
        'Account data is kept while your account is active. Completed task and order records are retained so both parties keep a history of the work. When you close your account we delete or anonymise your personal data, unless we must keep some of it for legal, billing, or safety reasons (for example subscription invoices, or records connected to a safety report).',
      ],
    },
    {
      heading: '8. Your rights',
      body: [
        `Under UK GDPR you can ask us for access to, correction of, or deletion of your personal data, object to or restrict processing, take your data with you (portability), and withdraw consent where processing is based on consent (such as analytics). Email ${LEGAL_CONTACT_EMAIL} and we will respond within the statutory timescale. You can also complain to the Information Commissioner's Office (ico.org.uk).`,
      ],
    },
    {
      heading: '9. Cookies and analytics',
      body: [
        'We use essential cookies to keep you signed in and to remember your cookie choice. Analytics cookies (PostHog) are set only if you accept them in the cookie banner; if you decline, the product works exactly the same without analytics. See the Cookie Policy at slashie.app/cookies for the full list.',
      ],
    },
    {
      heading: '10. Under-18s',
      body: [
        'Slashie is for adults only. We do not knowingly collect personal data from anyone under 18, and we remove accounts that we discover belong to under-18s. If you believe an under-18 is using Slashie, please contact us.',
      ],
    },
    {
      heading: '11. Changes to this policy',
      body: [
        'We will update this policy as the product evolves and will announce material changes in the app or by email. The date at the top shows when it last changed.',
      ],
    },
    {
      heading: '12. Contact',
      body: [
        `Privacy questions or requests: ${LEGAL_CONTACT_EMAIL}, or write to ${COMPANY_LEGAL_NAME}, ${COMPANY_REGISTERED_OFFICE}.`,
      ],
    },
  ],
}
