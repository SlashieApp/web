/* Web Push click routes must stay aligned with `notificationHref` in src/utils/notifications.ts. */

self.addEventListener('push', (event) => {
  const payload = readPushPayload(event)
  const data =
    payload.data && typeof payload.data === 'object' ? payload.data : {}
  const title = textField(payload.title) || textField(data.title) || 'Slashie'
  const body = textField(payload.body) || textField(data.body) || ''
  const url = notificationPath({
    type: textField(data.type) || textField(payload.type),
    taskId: textField(data.taskId) || textField(payload.taskId),
    orderId: textField(data.orderId) || textField(payload.orderId),
    url: textField(data.url) || textField(payload.url),
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
  const url = event.notification.data?.url || '/tasks'
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windows) => {
        for (const client of windows) {
          if (client.url.includes(url) && 'focus' in client)
            return client.focus()
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

function notificationPath(input) {
  if (input.url.startsWith('/')) return input.url
  const taskId = input.taskId
  if (input.type === 'REVIEW_PROMPT' && taskId) {
    return input.orderId
      ? `/tasks/${taskId}/review?orderId=${encodeURIComponent(input.orderId)}`
      : `/tasks/${taskId}/review`
  }
  if (!taskId) return '/tasks'
  return input.orderId
    ? `/tasks/${taskId}?orderId=${encodeURIComponent(input.orderId)}`
    : `/tasks/${taskId}`
}
