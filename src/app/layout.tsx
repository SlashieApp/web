import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { BRAND_PRIMARY } from '@/theme/brand'
import { Providers } from './providers'
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  // Absolute base for canonical/og URLs + the opengraph-image route.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      'https://slashie.app',
  ),
  title: 'Slashie App - Local Trades and Home Tasks Marketplace',
  description:
    'Slashie is a local trades and home tasks marketplace that connects homeowners with skilled professionals for home repairs, maintenance, and improvements.',
  manifest: '/manifest.json',
}

// App Router requires themeColor in the viewport export (a metadata-export
// themeColor is warned about and silently dropped by Next 15+).
export const viewport: Viewport = {
  themeColor: BRAND_PRIMARY,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakartaSans.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
