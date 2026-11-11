import { describe, expect, it } from 'vitest'

import messages from '@/app/(marketing)/i11n.json'
import threadCopy from '@/app/(messages)/messages/i11n.json'

/**
 * The phone demos are replicas of the app's screens, so the labels the app
 * itself draws (not the demo's fictional people and tasks) are the app's own
 * words. These tests fail when a screen's copy changes and the demo did not.
 */
describe('the phone demos use the app’s own labels', () => {
  for (const locale of ['en', 'zh_hk'] as const) {
    const phone = messages[locale].landing.phone

    it(`chat (${locale}): the message box and Send are the thread's`, () => {
      expect(phone.chat.composer).toBe(threadCopy[locale].composerPlaceholder)
      expect(phone.chat.send).toBe(threadCopy[locale].send)
      expect(phone.chat.today).toBe(threadCopy[locale].today)
    })
  }
})
