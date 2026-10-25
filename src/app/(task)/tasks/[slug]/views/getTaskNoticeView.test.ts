import { OrderPartyRole, OrderStatus, QuoteStatus } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import bag from '../i11n.json'
import {
  type TaskNoticeCounterparty,
  type TaskNoticeInput,
  getTaskNoticeView,
  taskNoticePersonName,
} from './getTaskNoticeView'
import { TASK_NOTICE_VIEWS } from './index'

const OWNER = 'owner-1'
const WORKER = 'worker-1'
const BY_SLASHIE = { bySlashie: true, posterSuspended: false }
const WITH_POSTER = { bySlashie: false, posterSuspended: true }
const BOTH = { bySlashie: true, posterSuspended: true }

const workerSuspended = (canReopen: boolean): TaskNoticeCounterparty => ({
  role: OrderPartyRole.Worker,
  name: 'Jordan Lee',
  canReopen,
})
const customerSuspended: TaskNoticeCounterparty = {
  role: OrderPartyRole.Customer,
  name: 'Alex Chen',
  canReopen: false,
}

function booking(
  counterpartySuspension: TaskNoticeCounterparty | null = null,
  status: string = OrderStatus.Active,
): TaskNoticeInput['order'] {
  return { status, workerUserId: WORKER, counterpartySuspension }
}

const owner = { userId: OWNER, isOwner: true }
const bookedWorker = { userId: WORKER, isOwner: false }
const quoting = (quoteStatus: string) => ({
  userId: 'worker-2',
  isOwner: false,
  quoteStatus,
})

function notice(input: Partial<TaskNoticeInput>) {
  return getTaskNoticeView({
    suspension: null,
    order: null,
    viewer: null,
    ...input,
  })
}

describe('getTaskNoticeView: the owner', () => {
  it('is told to contact support about a task Slashie suspended, booked or not', () => {
    expect(notice({ viewer: owner, suspension: BY_SLASHIE })).toBe(
      'notice.owner.taskSuspended',
    )
    expect(
      notice({
        viewer: owner,
        suspension: BOTH,
        order: booking(workerSuspended(false), OrderStatus.Completed),
      }),
    ).toBe('notice.owner.taskSuspended')
  })

  it('can reopen a live booking whose worker is suspended, when the API allows it', () => {
    expect(
      notice({ viewer: owner, order: booking(workerSuspended(true)) }),
    ).toBe('notice.owner.workerSuspended')
    expect(
      notice({
        viewer: owner,
        order: booking(workerSuspended(true), OrderStatus.Conflict),
      }),
    ).toBe('notice.owner.workerSuspended')
  })

  it('is told the booking is on hold when the API does not let them reopen', () => {
    expect(
      notice({ viewer: owner, order: booking(workerSuspended(false)) }),
    ).toBe('notice.owner.workerSuspendedOnHold')
  })

  it('gets none once the booking has finished, for their own account, or with nothing suspended', () => {
    for (const status of [OrderStatus.Completed, OrderStatus.Cancelled]) {
      expect(
        notice({
          viewer: owner,
          order: booking(workerSuspended(false), status),
        }),
      ).toBeNull()
    }
    expect(notice({ viewer: owner, suspension: WITH_POSTER })).toBeNull()
    expect(notice({ viewer: owner, order: booking() })).toBeNull()
  })
})

describe('getTaskNoticeView: the booked worker', () => {
  it('hears that their customer is suspended, from the booking or the task', () => {
    expect(
      notice({ viewer: bookedWorker, order: booking(customerSuspended) }),
    ).toBe('notice.worker.customerSuspended')
    expect(
      notice({
        viewer: bookedWorker,
        suspension: WITH_POSTER,
        order: booking(null, OrderStatus.Conflict),
      }),
    ).toBe('notice.worker.customerSuspended')
  })

  it('hears that Slashie suspended the task, which wins over the poster', () => {
    expect(
      notice({
        viewer: bookedWorker,
        suspension: BY_SLASHIE,
        order: booking(),
      }),
    ).toBe('notice.worker.taskSuspended')
    expect(
      notice({
        viewer: bookedWorker,
        suspension: BOTH,
        order: booking(customerSuspended),
      }),
    ).toBe('notice.worker.taskSuspended')
  })

  it('gets none once the booking has finished', () => {
    expect(
      notice({
        viewer: bookedWorker,
        suspension: BOTH,
        order: booking(customerSuspended, OrderStatus.Completed),
      }),
    ).toBeNull()
  })
})

describe('getTaskNoticeView: a quoting worker', () => {
  it('hears their quote is on hold, Slashie first', () => {
    expect(
      notice({ viewer: quoting(QuoteStatus.Pending), suspension: BY_SLASHIE }),
    ).toBe('notice.worker.taskSuspended')
    expect(
      notice({ viewer: quoting(QuoteStatus.Pending), suspension: WITH_POSTER }),
    ).toBe('notice.worker.posterSuspended')
    expect(
      notice({ viewer: quoting(QuoteStatus.Pending), suspension: BOTH }),
    ).toBe('notice.worker.taskSuspended')
  })

  it('gets none for a quote that is not pending, or with nothing suspended', () => {
    for (const status of [QuoteStatus.Withdrawn, QuoteStatus.Closed]) {
      expect(notice({ viewer: quoting(status), suspension: BOTH })).toBeNull()
    }
    expect(notice({ viewer: quoting(QuoteStatus.Pending) })).toBeNull()
  })
})

describe('getTaskNoticeView: anyone else', () => {
  it('gets none, a guest included', () => {
    expect(notice({ suspension: BOTH })).toBeNull()
    expect(
      notice({
        viewer: { userId: 'someone', isOwner: false },
        suspension: BOTH,
        order: booking(customerSuspended),
      }),
    ).toBeNull()
  })
})

describe('taskNoticePersonName', () => {
  it('names the suspended person, else the poster, else the fallback', () => {
    expect(
      taskNoticePersonName(booking(workerSuspended(true)), 'Alex', 'Customer'),
    ).toBe('Jordan Lee')
    expect(taskNoticePersonName(booking(), ' Alex Chen ', 'Customer')).toBe(
      'Alex Chen',
    )
    expect(taskNoticePersonName(null, '  ', 'Customer')).toBe('Customer')
  })
})

describe('notice copy', () => {
  it('has every title and body in English and Traditional Chinese, without em dashes', () => {
    for (const config of Object.values(TASK_NOTICE_VIEWS)) {
      for (const key of [config.title, config.body]) {
        expect(bag.en.notice[key]).toEqual(expect.any(String))
        expect(bag.zh_hk.notice[key]).toEqual(expect.any(String))
      }
    }
    const text = JSON.stringify([
      bag.en.notice,
      bag.zh_hk.notice,
      bag.en.reopen,
      bag.zh_hk.reopen,
      bag.en.serverErrors,
      bag.zh_hk.serverErrors,
    ])
    expect(text).not.toContain('—')
  })
})
