import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Dock, Header } from '@ui'
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
  title: 'Slashie App - Local Trades and Home Tasks Marketplace',
  description:
    'Slashie is a local trades and home tasks marketplace that connects homeowners with skilled professionals for home repairs, maintenance, and improvements.',
  manifest: '/manifest.json',
  themeColor: '#00dc82',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${plusJakartaSans.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
