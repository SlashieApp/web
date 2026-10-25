'use client'

import { useState } from 'react'
import { LuCirclePause } from 'react-icons/lu'

import { LEGAL_CONTACT_EMAIL } from '@/content/legal/company'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, InfoBar, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'
import {
  TASK_NOTICE_VIEWS,
  getTaskNoticeView,
  taskNoticePersonName,
} from '../../views'
import { ReopenTaskDialog } from './ReopenTaskDialog'

/**
 * The suspension notice at the top of task detail, above the Task summary
 * (BE-108): what happened, what it means, and its one action. Which notice,
 * if any, is `getTaskNoticeView`'s call (views/README.md). Contact support
 * mails the app's contact address; Reopen task asks first. The frozen
 * actions themselves are hidden by the permissions.
 */
export function TaskSuspensionNotice() {
  const { task, myOrder, myQuote, me, permissions, reopeningTask } =
    useTaskDetail()
  const t = useI11n(bag)
  const [reopenOpen, setReopenOpen] = useState(false)
  if (!task) return null

  const name = getTaskNoticeView({
    suspension: task.suspension,
    order: myOrder,
    viewer: me
      ? {
          userId: me.id,
          isOwner: permissions.isOwner,
          quoteStatus: myQuote?.status ?? null,
        }
      : null,
  })
  if (!name) return null
  const config = TASK_NOTICE_VIEWS[name]
  const person = taskNoticePersonName(
    myOrder,
    task.poster?.profile?.name,
    t.fallbackCustomer,
  )
  const reopen = config.action === 'reopen' && permissions.canReopen

  const action =
    config.action === 'contactSupport' ? (
      <Button asChild size="sm" variant="secondary">
        <Link
          href={`mailto:${LEGAL_CONTACT_EMAIL}`}
          _hover={{ textDecoration: 'none' }}
        >
          {t.notice.contactSupport}
        </Link>
      </Button>
    ) : reopen ? (
      <Button
        type="button"
        size="sm"
        variant="primary"
        loading={reopeningTask}
        onClick={() => setReopenOpen(true)}
      >
        {t.reopen.action}
      </Button>
    ) : null

  return (
    <>
      <InfoBar
        tone="warning"
        icon={<LuCirclePause size={20} />}
        hideBadge
        heading={formatMessage(t.notice[config.title], { name: person })}
        action={action}
        data-task-notice={name}
      >
        {formatMessage(t.notice[config.body], { name: person })}
      </InfoBar>
      {reopen ? (
        <ReopenTaskDialog open={reopenOpen} onOpenChange={setReopenOpen} />
      ) : null}
    </>
  )
}
