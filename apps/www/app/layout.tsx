import './css/style.css'

import Header from '@/components/ui/header'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Solomon AI - Financial Management Platform for SMBs',
  description:
    'Powerful financial management platform for small and medium-sized businesses',
  keywords: 'finance, smb, business, financial management, accounting',
  authors: [{ name: 'Solomon AI' }],
  viewport: 'width=device-width, initial-scale=1.0',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} font-inter bg-slate-900 tracking-tight text-slate-100 antialiased`}
      >
        <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
          <Header />
          <main className="flex-grow">{children}</main>
        </div>
      </body>
    </html>
  )
}
