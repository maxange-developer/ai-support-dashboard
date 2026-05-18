import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://lore.massimilianoangelone.com'),
  title: {
    default: 'Lore — Multi-tenant RAG Copilot · by Massimiliano Angelone',
    template: '%s · Lore',
  },
  description: 'A multi-tenant RAG copilot with embeddable widget, streaming chat, and per-message cost tracking. Built end-to-end with Next.js 16, Supabase, and OpenAI.',
  keywords: ['RAG', 'multi-tenant', 'AI copilot', 'support automation', 'Next.js', 'Supabase'],
  authors: [{ name: 'Massimiliano Angelone', url: 'https://massimilianoangelone.com' }],
  creator: 'Massimiliano Angelone',
  publisher: 'Massimiliano Angelone',
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    title: 'Lore — Multi-tenant RAG Copilot',
    description: 'A multi-tenant RAG copilot with embeddable widget, streaming chat, and per-message cost tracking.',
    url: 'https://lore.massimilianoangelone.com',
    siteName: 'Lore',
    images: [
      {
        url: '/og/lore-og.webp',
        width: 1200,
        height: 630,
        alt: 'Lore — Multi-tenant RAG Copilot',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lore — Multi-tenant RAG Copilot',
    description: 'A multi-tenant RAG copilot with embeddable widget, streaming chat, and per-message cost tracking.',
    images: ['/og/lore-og.webp'],
    creator: '@massiangelone',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [{ rel: 'mask-icon', url: '/favicon.svg', color: '#1F8BFF' }],
  },
  manifest: '/site.webmanifest',
  themeColor: '#000000',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
