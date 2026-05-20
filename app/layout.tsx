import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Aurex — AI-Powered Portfolio Intelligence',
  description:
    'AI-powered investment intelligence for modern markets. Track your crypto and stock holdings, monitor market exposure, analyze risk allocation, and get AI-driven insights for smarter investment decisions.',
  applicationName: 'Aurex',
  keywords: ['Aurex', 'portfolio', 'trading', 'crypto', 'stocks', 'AI', 'financial intelligence', 'investment', 'BTC', 'ETH', 'NVDA'],
  authors: [{ name: 'Aurex' }],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
    shortcut: '/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#050505',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} bg-[#050505]`}>
      <body className="font-sans antialiased bg-[#050505] text-white min-h-screen">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
