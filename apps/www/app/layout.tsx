import './css/style.css'

import Footer from '@/components/ui/footer'
import Header from '@/components/ui/header'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Solomon AI - Financial Management Platform for SMBs',
  description: 'Powerful financial management platform for small and medium-sized businesses',
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
      <body className={`${inter.variable} font-inter antialiased bg-slate-900 text-slate-100 tracking-tight`}>
        <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
