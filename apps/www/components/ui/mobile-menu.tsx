'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

export default function MobileMenu() {
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false)

  const trigger = useRef<HTMLButtonElement>(null)
  const mobileNav = useRef<HTMLDivElement>(null)

  // close the mobile menu on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }): void => {
      if (!mobileNav.current || !trigger.current) return
      if (
        !mobileNavOpen ||
        mobileNav.current.contains(target as Node) ||
        trigger.current.contains(target as Node)
      )
        return
      setMobileNavOpen(false)
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })

  // close the mobile menu if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if (!mobileNavOpen || keyCode !== 27) return
      setMobileNavOpen(false)
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  })

  return (
    <div className="ml-4 flex items-center md:hidden">
      {/* Hamburger button */}
      <button
        ref={trigger}
        className={`group inline-flex h-8 w-8 items-center justify-center text-center text-slate-300 transition hover:text-white`}
        aria-controls="mobile-nav"
        aria-expanded={mobileNavOpen}
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <span className="sr-only">Menu</span>
        <svg
          className="pointer-events-none h-4 w-4 fill-current"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            className="origin-center -translate-y-[5px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
            y="7"
            width="16"
            height="2"
            rx="1"
          />
          <rect
            className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
            y="7"
            width="16"
            height="2"
            rx="1"
          />
          <rect
            className="origin-center translate-y-[5px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
            y="7"
            width="16"
            height="2"
            rx="1"
          />
        </svg>
      </button>

      {/*Mobile navigation */}
      <nav
        id="mobile-nav"
        ref={mobileNav}
        className="absolute left-0 top-full z-20 w-full overflow-hidden px-4 transition-all duration-300 ease-in-out sm:px-6"
        style={
          mobileNavOpen
            ? { maxHeight: mobileNav.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0.8 }
        }
      >
        <ul className="rounded-lg border border-transparent px-4 py-1.5 [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box]">
          <li>
            <Link
              className="flex py-1.5 text-sm font-medium text-slate-300 hover:text-white"
              href="/about"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              className="flex py-1.5 text-sm font-medium text-slate-300 hover:text-white"
              href="/integrations"
            >
              Integrations
            </Link>
          </li>
          <li>
            <Link
              className="flex py-1.5 text-sm font-medium text-slate-300 hover:text-white"
              href="/pricing"
            >
              Pricing
            </Link>
          </li>
          <li>
            <Link
              className="flex py-1.5 text-sm font-medium text-slate-300 hover:text-white"
              href="/customers"
            >
              Customers
            </Link>
          </li>
          <li>
            <Link
              className="flex py-1.5 text-sm font-medium text-slate-300 hover:text-white"
              href="/changelog"
            >
              Changelog
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
