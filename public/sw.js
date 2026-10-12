/*
 * Web Push for Messages (FE-202). The API pushes a flash or message with
 * `data: { threadId, itemId, type, flashKind, taskId, orderId }`; the text is
 * exactly the flash title and body. A tap opens the thread, or the review
 * page for review prompts.
 */

self.addEventListener('push', (event) => {
  const payload = readPushPayload(event)
  const data =
    payload.data && typeof payload.data === 'object' ? payload.data : {}
  const title = textField(payload.title) || textField(data.title) || 'Slashie'
  const body = textField(payload.body) || textField(data.body) || ''
  const url = pushPath({
    threadId: textField(data.threadId),
    flashKind: textField(data.flashKind),
    taskId: textField(data.taskId),
    orderId: textField(data.orderId),
  })
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: { url },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/messages'
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windows) => {
        const target = new URL(url, self.location.origin).href
        for (const client of windows) {
          if (client.url === target && 'focus' in client) return client.focus()
        }
        if (self.clients.openWindow) return self.clients.openWindow(url)
        return undefined
      }),
  )
})

function readPushPayload(event) {
  if (!event.data) return {}
  try {
    const json = event.data.json()
    return json && typeof json === 'object' ? json : {}
  } catch {
    return { body: event.data.text() }
  }
}

function textField(value) {
  return typeof value === 'string' ? value.trim() : ''
}

/** In-app path only: every route is built here, never taken from the payload. */
function pushPath(input) {
  const taskId = input.taskId
  if (input.flashKind === 'REVIEW_PROMPT' && taskId) {
    return input.orderId
      ? `/tasks/${encodeURIComponent(taskId)}/review?orderId=${encodeURIComponent(input.orderId)}`
      : `/tasks/${encodeURIComponent(taskId)}/review`
  }
  if (input.threadId) return `/messages/${encodeURIComponent(input.threadId)}`
  return '/messages'
}
