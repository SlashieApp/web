'use client'

export const DASHBOARD_TRADE_OPTIONS = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Landscaping',
  'HVAC',
] as const

export type DashboardTrade = (typeof DASHBOARD_TRADE_OPTIONS)[number]

export type DashboardProfile = {
  fullName: string
  bio: string
  phoneNumber: string
  location: string
  preferredTrades: DashboardTrade[]
}

export type DashboardWorkerProfile = {
  isActive: boolean
  businessName: string
  tagline: string
  serviceArea: string
  yearsExperience: string
  hourlyRatePence: number
  skills: DashboardTrade[]
  verificationDocumentName: string
  joinedAt: string | null
}

export type DashboardMessage = {
  id: string
  counterpart: string
  taskTitle: string
  preview: string
  updatedAt: string
  unread: boolean
}

export type DashboardHistoryEntry = {
  id: string
  title: string
  location: string
  completedAt: string
  valuePence: number
  summary: string
  role: 'customer' | 'worker'
}

export type DashboardDemoState = {
  profile: DashboardProfile
  worker: DashboardWorkerProfile
  messages: DashboardMessage[]
  history: DashboardHistoryEntry[]
}

const STORAGE_PREFIX = 'handybox.dashboard.v1'

function titleCase(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function getDisplayNameFromEmail(email: string | null | undefined) {
  const localPart = (email ?? '').split('@')[0]?.trim()
  if (!localPart) return 'HandyBox Member'

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((piece) => titleCase(piece))
    .join(' ')
}

function buildDefaultMessages(displayName: string): DashboardMessage[] {
  return [
    {
      id: 'message-checkin',
      counterpart: 'Project Support',
      taskTitle: 'Kitchen tap replacement',
      preview: `Hi ${displayName.split(' ')[0]}, your shortlist is ready and three pros are available this week.`,
      updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      unread: true,
    },
    {
      id: 'message-booking',
      counterpart: 'Scheduling Assistant',
      taskTitle: 'Garden fence repair',
      preview:
        'We can hold your preferred Saturday morning slot once you confirm the quote.',
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      unread: false,
    },
    {
      id: 'message-profile',
      counterpart: 'Trust & Safety',
      taskTitle: 'Worker profile',
      preview:
        'Complete your profile and upload ID to unlock quoting and earnings tools.',
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      unread: false,
    },
  ]
}

function buildDefaultHistory(): DashboardHistoryEntry[] {
  return [
    {
      id: 'history-bathroom',
      title: 'Bathroom extractor fan service',
      location: 'Manchester',
      completedAt: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 18,
      ).toISOString(),
      valuePence: 18500,
      summary: 'Completed with parts supplied and safety check recorded.',
      role: 'customer',
    },
    {
      id: 'history-garden',
      title: 'Garden gate hinge replacement',
      location: 'Leeds',
      completedAt: new Date(
        Date.now() - 1000 * 60 * 60 * 24 * 39,
      ).toISOString(),
      valuePence: 9200,
      summary: 'Same-day repair with photo proof and invoice delivered.',
      role: 'customer',
    },
  ]
}

export function createDefaultDashboardState(
  email: string | null | undefined,
): DashboardDemoState {
  const displayName = getDisplayNameFromEmail(email)

  return {
    profile: {
      fullName: displayName,
      bio: 'Homeowner focused on clear briefs, fast communication, and reliable scheduling.',
      phoneNumber: '',
      location: 'Greater London',
      preferredTrades: ['Plumbing', 'Electrical'],
    },
    worker: {
      isActive: false,
      businessName: '',
      tagline: '',
      serviceArea: 'Greater London',
      yearsExperience: '3',
      hourlyRatePence: 4500,
      skills: ['Plumbing'],
      verificationDocumentName: '',
      joinedAt: null,
    },
    messages: buildDefaultMessages(displayName),
    history: buildDefaultHistory(),
  }
}

function normaliseTrades(value: unknown): DashboardTrade[] {
  if (!Array.isArray(value)) return []

  return value.filter((item): item is DashboardTrade =>
    DASHBOARD_TRADE_OPTIONS.includes(item as DashboardTrade),
  )
}

function mergeDashboardState(
  raw: unknown,
  fallback: DashboardDemoState,
): DashboardDemoState {
  if (!raw || typeof raw !== 'object') return fallback

  const input = raw as Partial<DashboardDemoState>
  const profile = (input.profile ?? {}) as Partial<DashboardProfile>
  const worker = (input.worker ?? {}) as Partial<DashboardWorkerProfile>

  return {
    profile: {
      ...fallback.profile,
      ...profile,
      preferredTrades:
        normaliseTrades(profile.preferredTrades).length > 0
          ? normaliseTrades(profile.preferredTrades)
          : fallback.profile.preferredTrades,
    },
    worker: {
      ...fallback.worker,
      ...worker,
      skills:
        normaliseTrades(worker.skills).length > 0
          ? normaliseTrades(worker.skills)
          : fallback.worker.skills,
      hourlyRatePence:
        typeof worker.hourlyRatePence === 'number'
          ? worker.hourlyRatePence
          : fallback.worker.hourlyRatePence,
      joinedAt:
        typeof worker.joinedAt === 'string' || worker.joinedAt === null
          ? worker.joinedAt
          : fallback.worker.joinedAt,
    },
    messages: Array.isArray(input.messages)
      ? input.messages.filter((item): item is DashboardMessage =>
          Boolean(
            item &&
              typeof item === 'object' &&
              typeof item.id === 'string' &&
              typeof item.counterpart === 'string' &&
              typeof item.preview === 'string',
          ),
        )
      : fallback.messages,
    history: Array.isArray(input.history)
      ? input.history.filter((item): item is DashboardHistoryEntry =>
          Boolean(
            item &&
              typeof item === 'object' &&
              typeof item.id === 'string' &&
              typeof item.title === 'string' &&
              typeof item.location === 'string',
          ),
        )
      : fallback.history,
  }
}

function getStorageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`
}

export function readDashboardDemoState(
  userId: string,
  email: string | null | undefined,
) {
  const fallback = createDefaultDashboardState(email)

  if (typeof window === 'undefined') return fallback

  const raw = window.localStorage.getItem(getStorageKey(userId))
  if (!raw) return fallback

  try {
    return mergeDashboardState(JSON.parse(raw), fallback)
  } catch {
    return fallback
  }
}

export function writeDashboardDemoState(
  userId: string,
  nextState: DashboardDemoState,
) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(nextState))
}
