'use client'

import { getAuthToken } from '@/utils/auth'

import { orderReceiptPdfUrl } from './reviewModel'

export async function downloadOrderReceiptPdf(orderId: string): Promise<void> {
  const base = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? ''
  if (!base.trim()) {
    throw new Error('Receipt download is unavailable.')
  }
  const token = getAuthToken()
  const response = await fetch(orderReceiptPdfUrl(orderId, base), {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'apollo-require-preflight': 'true',
    },
  })
  if (!response.ok) {
    throw new Error('Receipt download failed.')
  }
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = `slashie-job-${orderId}.pdf`
  anchor.rel = 'noopener'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(objectUrl)
}
