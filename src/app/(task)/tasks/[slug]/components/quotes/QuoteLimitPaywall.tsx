'use client'

import { Button, Card, Link } from '@ui'

import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'

export function QuoteLimitPaywall() {
  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      eyebrow="Monthly quote limit reached"
      description="You've used all free quotes this UTC month. Upgrade to Slashie Unlimited for unlimited quoting — separate from job payments between you and the customer."
    >
      <Button asChild size="sm" w="full">
        <Link href="/billing" _hover={{ textDecoration: 'none' }}>
          Upgrade on billing
        </Link>
      </Button>
    </Card>
  )
}
