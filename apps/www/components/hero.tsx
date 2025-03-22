'use client'

import { useEffect, useState } from 'react'

import Illustration from '@/public/images/glow-bottom.svg'
import Image from 'next/image'
import Particles from './particles'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Particles animation */}
        <Particles className="absolute inset-0 -z-10" />

        {/* Illustration */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 -mx-28 overflow-hidden rounded-b-[3rem]"
          aria-hidden="true"
        >
          <div className="absolute bottom-0 left-1/2 -z-10 -translate-x-1/2">
            <Image
              src={Illustration}
              className="max-w-none transform transition-opacity duration-1000 ease-in-out"
              style={{ opacity: isVisible ? 1 : 0 }}
              width={2146}
              priority
              alt="Hero Illustration"
            />
          </div>
        </div>

        <div className="pb-16 pt-32 md:pb-32 md:pt-52">
          {/* Hero content */}
          <div className="mx-auto max-w-3xl text-center">
            <div
              className={`mb-6 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              <div className="relative inline-flex before:absolute before:inset-0 before:bg-purple-500 before:blur-md">
                <a
                  className="btn-sm group relative py-0.5 text-slate-300 shadow-sm transition duration-150 ease-in-out [background:linear-gradient(var(--color-purple-500),var(--color-purple-500))_padding-box,linear-gradient(var(--color-purple-500),var(--color-purple-200)_75%,transparent_100%)_border-box] before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-slate-800/50 hover:text-white"
                  href="#0"
                  aria-label="Learn about beta features"
                >
                  <span className="relative inline-flex items-center">
                    AI Workspace is now in beta{' '}
                    <span className="ml-1 tracking-normal text-purple-500 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                      -&gt;
                    </span>
                  </span>
                </a>
              </div>
            </div>
            <h1
              className={`h1 transform bg-gradient-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-4 text-transparent transition-all delay-100 duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              Seamless Human-AI Collaboration
            </h1>
            <p
              className={`mb-8 transform text-lg text-slate-300 transition-all delay-200 duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              Build powerful workflows with our intuitive workspace designed for
              teams to collaborate efficiently with AI systems.
            </p>
            <div
              className={`mx-auto max-w-xs transform space-y-4 transition-all delay-300 duration-700 sm:inline-flex sm:max-w-none sm:justify-center sm:space-x-4 sm:space-y-0 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
            >
              <div>
                <a
                  className="btn group w-full bg-gradient-to-r from-white/80 via-white to-white/80 text-slate-900 transition duration-150 ease-in-out hover:bg-white hover:shadow-lg"
                  href="#0"
                  aria-label="Get started with our platform"
                >
                  Get Started{' '}
                  <span className="ml-1 tracking-normal text-purple-500 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                    -&gt;
                  </span>
                </a>
              </div>
              <div>
                <a
                  className="btn w-full bg-slate-900/25 text-slate-200 transition duration-150 ease-in-out hover:bg-slate-900/30 hover:text-white hover:shadow-lg"
                  href="#0"
                  aria-label="View documentation"
                >
                  <svg
                    className="mr-3 shrink-0 fill-slate-300"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                  >
                    <path d="m1.999 0 1 2-1 2 2-1 2 1-1-2 1-2-2 1zM11.999 0l1 2-1 2 2-1 2 1-1-2 1-2-2 1zM11.999 10l1 2-1 2 2-1 2 1-1-2 1-2-2 1zM6.292 7.586l2.646-2.647L11.06 7.06 8.413 9.707zM0 13.878l5.586-5.586 2.122 2.121L2.12 16z" />
                  </svg>
                  <span>Read the docs</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
