import type messages from '@/app/(marketing)/i11n.json'

type LandingCopy = (typeof messages)['en']['landing']

/** Demo strings for the phone (`landing.phone` in the marketing i11n bag). */
export type PhoneCopy = LandingCopy['phone']

/** Step text for the scroll story (`landing.story`). */
export type StoryCopy = LandingCopy['story']

export type DemoTaskId = keyof PhoneCopy['tasks']
