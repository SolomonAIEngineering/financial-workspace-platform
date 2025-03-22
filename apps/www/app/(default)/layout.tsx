'use client'

import 'aos/dist/aos.css'

import Footer from '@/components/ui/footer'
import Header from '@/components/ui/header'
import AOS from 'aos'
import { useEffect } from 'react'

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    AOS.init({
      once: true,
      disable: 'phone',
      duration: 1000,
      easing: 'ease-out-cubic',
    })
  })

  return (
    <>
      <Header />

      <main className="grow">{children}</main>

      <Footer />
    </>
  )
}
