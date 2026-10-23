import {
  TaskEditableField,
  TaskSuspensionReason,
  TaskTimelineEventType,
} from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import bag from '../i11n.json'
import {
  type TaskActivityEvent,
  type TaskActivityViewer,
  formatTaskActivityTime,
  taskActivityLines,
  taskTimelineAsGuest,
} from './taskActivityLog'

const T = TaskTimelineEventType
type Locale = 'en' | 'zh_hk'

const ALEX = { id: 'owner-1', profile: { name: 'Alex Chen' } }
const JORDAN = { id: 'worker-1', profile: { name: 'Jordan Lee' } }

const OWNER: TaskActivityViewer = { userId: ALEX.id, isOwner: true }
/** The worker the quote or booking event is about. */
const JORDAN_VIEWING: TaskActivityViewer = { userId: JORDAN.id, isOwner: false }
const OTHER_WORKER: TaskActivityViewer = { userId: 'worker-2', isOwner: false }
const GUEST: TaskActivityViewer = { userId: null, isOwner: false }

function event(overrides: Partial<TaskActivityEvent>): TaskActivityEvent {
  return {
    type: T.TaskCreated,
    timestamp: '2026-10-22T14:05:00.000Z',
    byViewer: false,
    actor: null,
    worker: null,
    changedFields: [],
    ...overrides,
  }
}

/** The one sentence `events` reads as for `viewer`, or null when skipped. */
function say(
  overrides: Partial<TaskActivityEvent>,
  viewer: TaskActivityViewer = GUEST,
  locale: Locale = 'en',
): string | null {
  const [line] = taskActivityLines(
    [event(overrides)],
    viewer,
    bag[locale].activity,
  )
  return line?.text ?? null
}

describe('taskActivityLines: you, named or anon', () => {
  const cases: [
    TaskTimelineEventType,
    [string, string, string],
    [string, string, string],
  ][] = [
    [
      T.TaskCreated,
      ['You posted the task', 'Alex Chen posted the task', 'Task posted'],
      ['你發布了這個任務', 'Alex Chen 發布了這個任務', '任務已發布'],
    ],
    [
      T.TaskCancelled,
      [
        'You cancelled the task',
        'Alex Chen cancelled the task',
        'The task was cancelled',
      ],
      ['你取消了這個任務', 'Alex Chen 取消了這個任務', '任務已取消'],
    ],
    [
      T.TaskReopened,
      [
        'You reopened the task',
        'Alex Chen reopened the task',
        'The task was reopened',
      ],
      ['你重新開放了任務', 'Alex Chen 重新開放了任務', '任務已重新開放'],
    ],
    [
      T.QuoteSent,
      ['You sent a quote', 'Alex Chen sent a quote', 'A worker sent a quote'],
      ['你送出了報價', 'Alex Chen 送出了報價', '一位工作者送出了報價'],
    ],
    [
      T.QuoteUpdated,
      [
        'You updated your quote',
        'Alex Chen updated their quote',
        'A worker updated their quote',
      ],
      ['你更新了報價', 'Alex Chen 更新了報價', '一位工作者更新了報價'],
    ],
    [
      T.QuoteWithdrawn,
      [
        'You withdrew your quote',
        'Alex Chen withdrew their quote',
        'A worker withdrew their quote',
      ],
      ['你撤回了報價', 'Alex Chen 撤回了報價', '一位工作者撤回了報價'],
    ],
  ]

  it.each(cases)('%s', (type, en, zh) => {
    for (const [locale, [you, named, anon]] of [
      ['en', en],
      ['zh_hk', zh],
    ] as const) {
      expect(say({ type, byViewer: true, actor: ALEX }, OWNER, locale)).toBe(
        you,
      )
      // "You" wins even when the API leaves the actor out.
      expect(say({ type, byViewer: true }, OWNER, locale)).toBe(you)
      expect(say({ type, actor: ALEX }, GUEST, locale)).toBe(named)
      expect(say({ type }, GUEST, locale)).toBe(anon)
    }
  })

  it('says "Someone" when the actor has no name', () => {
    const nameless = { id: 'user-9', profile: { name: '  ' } }
    expect(say({ type: T.QuoteSent, actor: nameless }, OWNER)).toBe(
      'Someone sent a quote',
    )
    expect(
      say({ type: T.QuoteSent, actor: { id: 'user-9', profile: null } }, OWNER),
    ).toBe('Someone sent a quote')
    expect(say({ type: T.QuoteSent, actor: nameless }, OWNER, 'zh_hk')).toBe(
      '有人 送出了報價',
    )
  })
})

describe('taskActivityLines: suspensions (BE-108)', () => {
  const R = TaskSuspensionReason

  it('says which suspension was set, to the owner and the parties alike', () => {
    for (const viewer of [OWNER, JORDAN_VIEWING]) {
      expect(
        say({ type: T.TaskSuspended, suspensionReason: R.Slashie }, viewer),
      ).toBe('Slashie suspended the task')
      expect(
        say(
          { type: T.TaskSuspended, suspensionReason: R.PosterSuspended },
          viewer,
        ),
      ).toBe("The task was suspended because the poster's account is suspended")
      expect(
        say(
          { type: T.TaskSuspended, suspensionReason: R.Slashie },
          viewer,
          'zh_hk',
        ),
      ).toBe('Slashie 暫停了此任務')
      expect(
        say(
          { type: T.TaskSuspended, suspensionReason: R.PosterSuspended },
          viewer,
          'zh_hk',
        ),
      ).toBe('因發布者帳戶被暫停，此任務已暫停')
    }
  })

  it('reads a lifted suspension the same for either reason', () => {
    for (const suspensionReason of [R.Slashie, R.PosterSuspended]) {
      expect(say({ type: T.TaskUnsuspended, suspensionReason }, OWNER)).toBe(
        'The task is no longer suspended',
      )
      expect(
        say({ type: T.TaskUnsuspended, suspensionReason }, OWNER, 'zh_hk'),
      ).toBe('此任務已恢復')
    }
  })

  it('leaves out a suspension line that says no reason', () => {
    expect(say({ type: T.TaskSuspended }, OWNER)).toBeNull()
    expect(
      say({ type: T.TaskSuspended, suspensionReason: 'ANOTHER' }, OWNER),
    ).toBeNull()
  })
})

describe('taskActivityLines: you or named only', () => {
  const cases: [TaskTimelineEventType, [string, string], [string, string]][] = [
    [
      T.RescheduleRequested,
      ['You asked for a new time', 'Alex Chen asked for a new time'],
      ['你要求改期', 'Alex Chen 要求改期'],
    ],
    [
      T.RescheduleConfirmed,
      ['You accepted the new time', 'Alex Chen accepted the new time'],
      ['你接受了新時間', 'Alex Chen 接受了新時間'],
    ],
    [
      T.RescheduleDeclined,
      ['You declined the new time', 'Alex Chen declined the new time'],
      ['你拒絕了新時間', 'Alex Chen 拒絕了新時間'],
    ],
    [
      T.RescheduleWithdrawn,
      [
        'You withdrew your request for a new time',
        'Alex Chen withdrew their request for a new time',
      ],
      ['你撤回了改期要求', 'Alex Chen 撤回了改期要求'],
    ],
    [
      T.CancellationRequested,
      [
        'You asked to cancel the booking',
        'Alex Chen asked to cancel the booking',
      ],
      ['你要求取消預約', 'Alex Chen 要求取消預約'],
    ],
    [
      T.CancellationDeclined,
      [
        'You declined the request to cancel',
        'Alex Chen declined the request to cancel',
      ],
      ['你拒絕了取消要求', 'Alex Chen 拒絕了取消要求'],
    ],
    [
      T.CancellationWithdrawn,
      [
        'You withdrew your request to cancel',
        'Alex Chen withdrew their request to cancel',
      ],
      ['你撤回了取消要求', 'Alex Chen 撤回了取消要求'],
    ],
    [
      T.OrderMarkedDone,
      ['You marked the job done', 'Alex Chen marked the job done'],
      ['你標記工作為完成', 'Alex Chen 標記工作為完成'],
    ],
    [
      T.OrderMarkedFailed,
      [
        'You marked the job as not done',
        'Alex Chen marked the job as not done',
      ],
      ['你標記工作為未完成', 'Alex Chen 標記工作為未完成'],
    ],
    [
      T.ReviewLeft,
      ['You left a review', 'Alex Chen left a review'],
      ['你留下了評價', 'Alex Chen 留下了評價'],
    ],
  ]

  it.each(cases)('%s', (type, en, zh) => {
    for (const [locale, [you, named]] of [
      ['en', en],
      ['zh_hk', zh],
    ] as const) {
      // The booked worker reads the owner's line, and the other way round.
      expect(
        say({ type, byViewer: true, actor: JORDAN }, JORDAN_VIEWING, locale),
      ).toBe(you)
      expect(say({ type, actor: ALEX }, JORDAN_VIEWING, locale)).toBe(named)
      // No anon form: the named one with "Someone".
      const someone = bag[locale].activity.someone
      expect(say({ type }, OWNER, locale)).toBe(
        named.replace('Alex Chen', someone),
      )
    }
  })
})

describe('taskActivityLines: a decision on one quote', () => {
  const cases: [
    TaskTimelineEventType,
    { owner: string; own: string; anon: string },
    { owner: string; own: string; anon: string },
  ][] = [
    [
      T.QuoteDeclined,
      {
        owner: "You declined Jordan Lee's quote",
        own: 'Alex Chen declined your quote',
        anon: 'A quote was declined',
      },
      {
        owner: '你拒絕了 Jordan Lee 的報價',
        own: 'Alex Chen 拒絕了你的報價',
        anon: '一個報價被拒絕',
      },
    ],
    [
      T.QuoteAccepted,
      {
        owner: 'You booked Jordan Lee',
        own: 'Alex Chen accepted your quote',
        anon: 'A worker was booked',
      },
      {
        owner: '你預約了 Jordan Lee',
        own: 'Alex Chen 接受了你的報價',
        anon: '已預約一位工作者',
      },
    ],
  ]

  it.each(cases)('%s', (type, en, zh) => {
    for (const [locale, forms] of [
      ['en', en],
      ['zh_hk', zh],
    ] as const) {
      // The owner did it and sees who it was about.
      expect(
        say(
          { type, byViewer: true, actor: ALEX, worker: JORDAN },
          OWNER,
          locale,
        ),
      ).toBe(forms.owner)
      // The quote's own worker: the event's worker is them.
      expect(
        say({ type, actor: ALEX, worker: JORDAN }, JORDAN_VIEWING, locale),
      ).toBe(forms.own)
      // Another worker and a guest get neither name.
      expect(say({ type }, OTHER_WORKER, locale)).toBe(forms.anon)
      expect(say({ type }, GUEST, locale)).toBe(forms.anon)
    }
  })

  it('QUOTE_NOT_SELECTED (nobody acted)', () => {
    const type = T.QuoteNotSelected
    expect(say({ type, worker: JORDAN }, OWNER)).toBe(
      "Jordan Lee's quote wasn't selected",
    )
    expect(say({ type, worker: JORDAN }, JORDAN_VIEWING)).toBe(
      "Your quote wasn't selected",
    )
    expect(say({ type }, OTHER_WORKER)).toBe("A quote wasn't selected")
    expect(say({ type }, GUEST)).toBe("A quote wasn't selected")
    expect(say({ type, worker: JORDAN }, OWNER, 'zh_hk')).toBe(
      'Jordan Lee 的報價未獲選',
    )
    expect(say({ type, worker: JORDAN }, JORDAN_VIEWING, 'zh_hk')).toBe(
      '你的報價未獲選',
    )
    expect(say({ type }, GUEST, 'zh_hk')).toBe('一個報價未獲選')
  })

  it('never names a worker for anyone but the owner and that worker', () => {
    // Should the API ever send another worker's `worker`, it stays anon.
    expect(
      say({ type: T.QuoteAccepted, actor: ALEX, worker: JORDAN }, OTHER_WORKER),
    ).toBe('A worker was booked')
    expect(say({ type: T.QuoteDeclined, worker: JORDAN }, GUEST)).toBe(
      'A quote was declined',
    )
  })

  it("reads like anyone else's quote when the name it needs is missing", () => {
    // The owner, with no worker or a worker with no name.
    expect(say({ type: T.QuoteAccepted, byViewer: true }, OWNER)).toBe(
      'A worker was booked',
    )
    expect(
      say(
        { type: T.QuoteDeclined, worker: { id: JORDAN.id, profile: null } },
        OWNER,
      ),
    ).toBe('A quote was declined')
    // The quote's worker, when the API leaves out who answered.
    expect(say({ type: T.QuoteDeclined, worker: JORDAN }, JORDAN_VIEWING)).toBe(
      'A quote was declined',
    )
    expect(
      say({ type: T.QuoteAccepted, worker: JORDAN }, JORDAN_VIEWING, 'zh_hk'),
    ).toBe('已預約一位工作者')
    // ...but "Someone" when they are there without a name.
    expect(
      say(
        {
          type: T.QuoteDeclined,
          actor: { id: ALEX.id, profile: { name: '' } },
          worker: JORDAN,
        },
        JORDAN_VIEWING,
        'zh_hk',
      ),
    ).toBe('有人 拒絕了你的報價')
  })
})

describe('taskActivityLines: the same line for everyone', () => {
  const cases: [TaskTimelineEventType, string, string][] = [
    [
      T.CancellationLapsed,
      'The request to cancel lapsed at the booked time',
      '取消要求在預約時間到時失效',
    ],
    [T.OrderCancelled, 'The booking was cancelled', '預約已取消'],
    [
      T.OrderConflict,
      'Done and not done were both marked. Sort it out on the booking.',
      '雙方的標記不一致，請在預約中處理。',
    ],
    [T.OrderCompleted, 'Job completed', '工作已完成'],
  ]

  it.each(cases)('%s', (type, en, zh) => {
    expect(say({ type }, OWNER)).toBe(en)
    expect(say({ type, byViewer: true, actor: ALEX }, OWNER)).toBe(en)
    expect(say({ type, actor: JORDAN, worker: JORDAN }, JORDAN_VIEWING)).toBe(
      en,
    )
    expect(say({ type }, OWNER, 'zh_hk')).toBe(zh)
  })
})

describe('taskActivityLines: TASK_UPDATED names the fields', () => {
  const F = TaskEditableField
  const edited = (changedFields: string[], viewer = OWNER, locale?: Locale) =>
    say(
      {
        type: T.TaskUpdated,
        byViewer: viewer === OWNER,
        actor: ALEX,
        changedFields,
      },
      viewer,
      locale,
    )

  it('joins one, two and three fields', () => {
    expect(edited([F.Title])).toBe('You edited the task: title')
    expect(edited([F.Budget, F.Datetime])).toBe(
      'You edited the task: budget and timing',
    )
    expect(edited([F.Title, F.Budget, F.Datetime])).toBe(
      'You edited the task: title, budget and timing',
    )
    expect(edited([F.Title, F.Budget, F.Datetime], OWNER, 'zh_hk')).toBe(
      '你修改了任務：標題、預算、時間',
    )
    expect(edited([F.Budget, F.Datetime], GUEST)).toBe(
      'Alex Chen edited the task: budget and timing',
    )
    expect(
      say({ type: T.TaskUpdated, changedFields: [F.Location] }, GUEST),
    ).toBe('The task was edited: location')
    expect(
      say({ type: T.TaskUpdated, changedFields: [F.Location] }, GUEST, 'zh_hk'),
    ).toBe('任務已修改：地點')
  })

  it('has a word for every editable field', () => {
    const words: [TaskEditableField, string, string][] = [
      [F.Title, 'title', '標題'],
      [F.Description, 'description', '描述'],
      [F.Categories, 'categories', '類別'],
      [F.Budget, 'budget', '預算'],
      [F.Location, 'location', '地點'],
      [F.Datetime, 'timing', '時間'],
      [F.ContactMethod, 'contact method', '聯絡方式'],
      [F.Status, 'status', '狀態'],
      [F.Hidden, 'visibility', '可見度'],
    ]
    expect(words.map(([field]) => field).sort()).toEqual(
      Object.values(F).sort(),
    )
    for (const [field, en, zh] of words) {
      expect(edited([field])).toBe(`You edited the task: ${en}`)
      expect(edited([field], OWNER, 'zh_hk')).toBe(`你修改了任務：${zh}`)
    }
  })

  it('drops the field list when there are none to name', () => {
    expect(edited([])).toBe('You edited the task')
    expect(edited([], GUEST)).toBe('Alex Chen edited the task')
    expect(say({ type: T.TaskUpdated }, GUEST)).toBe('The task was edited')
    expect(edited([], OWNER, 'zh_hk')).toBe('你修改了任務')
    expect(edited([], GUEST, 'zh_hk')).toBe('Alex Chen 修改了任務')
    expect(say({ type: T.TaskUpdated }, GUEST, 'zh_hk')).toBe('任務已修改')
    // A field this build doesn't know is left out.
    expect(edited(['PET_POLICY'])).toBe('You edited the task')
    expect(edited(['PET_POLICY', F.Budget])).toBe('You edited the task: budget')
    expect(say({ type: T.TaskUpdated, changedFields: null }, GUEST)).toBe(
      'The task was edited',
    )
  })

  it('names a field once', () => {
    expect(edited([F.Budget, F.Budget, F.Title])).toBe(
      'You edited the task: budget and title',
    )
  })
})

describe('taskActivityLines: the log', () => {
  it('keeps the API order (oldest first) and skips types it does not know', () => {
    const lines = taskActivityLines(
      [
        event({ type: T.TaskCreated, byViewer: true }),
        event({ type: 'QUOTE_PINNED', timestamp: '2026-10-22T15:00:00.000Z' }),
        event({
          type: T.QuoteSent,
          actor: JORDAN,
          timestamp: '2026-10-22T16:00:00.000Z',
        }),
        event({
          type: T.ReviewLeft,
          byViewer: true,
          timestamp: '2026-10-23T09:00:00.000Z',
        }),
      ],
      OWNER,
      bag.en.activity,
    )
    expect(lines.map((line) => line.text)).toEqual([
      'You posted the task',
      'Jordan Lee sent a quote',
      'You left a review',
    ])
    expect(lines.map((line) => line.at)).toEqual([
      '2026-10-22T14:05:00.000Z',
      '2026-10-22T16:00:00.000Z',
      '2026-10-23T09:00:00.000Z',
    ])
    expect(new Set(lines.map((line) => line.key)).size).toBe(3)
  })

  it('skips names inherited from Object too', () => {
    expect(say({ type: 'toString' })).toBeNull()
    expect(say({ type: 'constructor' })).toBeNull()
  })

  it('files every type under task, quote, booking or review', () => {
    const kinds = Object.fromEntries(
      Object.values(T).map((type) => [
        type,
        taskActivityLines(
          [event({ type, suspensionReason: TaskSuspensionReason.Slashie })],
          OWNER,
          bag.en.activity,
        )[0]?.kind,
      ]),
    )
    expect(kinds).toEqual({
      TASK_CREATED: 'task',
      TASK_UPDATED: 'task',
      TASK_CANCELLED: 'task',
      TASK_REOPENED: 'task',
      TASK_SUSPENDED: 'task',
      TASK_UNSUSPENDED: 'task',
      QUOTE_SENT: 'quote',
      QUOTE_UPDATED: 'quote',
      QUOTE_WITHDRAWN: 'quote',
      QUOTE_DECLINED: 'quote',
      QUOTE_ACCEPTED: 'quote',
      QUOTE_NOT_SELECTED: 'quote',
      RESCHEDULE_REQUESTED: 'booking',
      RESCHEDULE_CONFIRMED: 'booking',
      RESCHEDULE_DECLINED: 'booking',
      RESCHEDULE_WITHDRAWN: 'booking',
      CANCELLATION_REQUESTED: 'booking',
      CANCELLATION_DECLINED: 'booking',
      CANCELLATION_WITHDRAWN: 'booking',
      CANCELLATION_LAPSED: 'booking',
      ORDER_CANCELLED: 'booking',
      ORDER_MARKED_DONE: 'booking',
      ORDER_MARKED_FAILED: 'booking',
      ORDER_CONFLICT: 'booking',
      ORDER_COMPLETED: 'booking',
      REVIEW_LEFT: 'review',
    })
  })

  it('reads every type, from every side, with no placeholder or em dash left', () => {
    const shapes: Partial<TaskActivityEvent>[] = [
      {
        byViewer: true,
        actor: ALEX,
        worker: JORDAN,
        suspensionReason: TaskSuspensionReason.Slashie,
      },
      {
        actor: ALEX,
        worker: JORDAN,
        suspensionReason: TaskSuspensionReason.PosterSuspended,
      },
      { actor: ALEX, suspensionReason: TaskSuspensionReason.Slashie },
      { suspensionReason: TaskSuspensionReason.PosterSuspended },
    ]
    const viewers = [OWNER, JORDAN_VIEWING, OTHER_WORKER, GUEST]
    for (const locale of ['en', 'zh_hk'] as const) {
      for (const type of Object.values(T)) {
        for (const shape of shapes) {
          for (const viewer of viewers) {
            const text = say({ type, ...shape }, viewer, locale)
            expect(text, `${type} ${locale}`).toBeTruthy()
            expect(text).not.toMatch(/[{}—]/)
          }
        }
      }
    }
  })
})

describe('taskTimelineAsGuest', () => {
  it("turns the owner's log into the one a guest gets", () => {
    const owners = [
      event({ type: T.TaskCreated, byViewer: true, actor: ALEX }),
      // An ops edit: nobody the guest may know.
      event({ type: T.TaskUpdated, changedFields: ['BUDGET'] }),
      event({ type: T.QuoteSent, actor: JORDAN, worker: JORDAN }),
      event({
        type: T.QuoteAccepted,
        byViewer: true,
        actor: ALEX,
        worker: JORDAN,
      }),
      event({ type: T.RescheduleRequested, actor: JORDAN, worker: JORDAN }),
      event({ type: T.OrderCompleted, worker: JORDAN }),
      event({ type: T.ReviewLeft, byViewer: true, actor: ALEX }),
      event({ type: 'QUOTE_PINNED' }),
      // BE-108: guests never get the suspension lines; a reopen they do.
      event({
        type: T.TaskSuspended,
        suspensionReason: TaskSuspensionReason.Slashie,
      }),
      event({
        type: T.TaskUnsuspended,
        suspensionReason: TaskSuspensionReason.Slashie,
      }),
      event({ type: T.TaskReopened, byViewer: true, actor: ALEX }),
    ]
    const guests = taskTimelineAsGuest(owners, ALEX.id)
    expect(guests).toEqual([
      { ...owners[0], byViewer: false },
      owners[1],
      { ...owners[2], actor: null, worker: null },
      { ...owners[3], byViewer: false, actor: null, worker: null },
      { ...owners[10], byViewer: false },
    ])
    expect(
      taskActivityLines(guests, GUEST, bag.en.activity).map((l) => l.text),
    ).toEqual([
      'Alex Chen posted the task',
      'The task was edited: budget',
      'A worker sent a quote',
      'A worker was booked',
      'Alex Chen reopened the task',
    ])
  })

  it('is empty without a timeline', () => {
    expect(taskTimelineAsGuest(undefined, ALEX.id)).toEqual([])
    expect(taskTimelineAsGuest(null, null)).toEqual([])
  })
})

describe('formatTaskActivityTime', () => {
  const now = new Date('2026-11-01T09:00:00.000Z')
  const utc = { now, timeZone: 'UTC' }

  it('gives the day and the 24-hour time', () => {
    expect(
      formatTaskActivityTime('2026-10-22T14:05:00.000Z', 'en-GB', utc),
    ).toBe('22 Oct, 14:05')
    expect(
      formatTaskActivityTime('2026-10-22T14:05:00.000Z', 'zh-HK', utc),
    ).toBe('10月22日 14:05')
    expect(
      formatTaskActivityTime('2026-03-05T00:07:00.000Z', 'en-GB', utc),
    ).toBe('5 Mar, 00:07')
  })

  it('adds the year when it is not this year', () => {
    expect(
      formatTaskActivityTime('2025-12-30T18:00:00.000Z', 'en-GB', utc),
    ).toBe('30 Dec 2025, 18:00')
    expect(
      formatTaskActivityTime('2025-12-30T18:00:00.000Z', 'zh-HK', utc),
    ).toBe('2025年12月30日 18:00')
  })

  it('uses the time zone it is given', () => {
    expect(
      formatTaskActivityTime('2026-10-22T14:05:00.000Z', 'en-GB', {
        now,
        timeZone: 'Asia/Hong_Kong',
      }),
    ).toBe('22 Oct, 22:05')
  })

  it('is empty for a timestamp it cannot read', () => {
    expect(formatTaskActivityTime('not a date', 'en-GB', utc)).toBe('')
  })
})
