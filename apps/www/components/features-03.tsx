import Highlighter, { HighlighterItem } from './highlighter'

import FeatureImg04 from '@/public/images/feature-image-04.png'
import Image from 'next/image'

export default function Features03() {
  return (
    <section className="relative">
      {/* Blurred shape */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 -translate-y-1/4 opacity-50 blur-2xl"
        aria-hidden="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="434" height="427">
          <defs>
            <linearGradient
              id="bs3-a"
              x1="19.609%"
              x2="50%"
              y1="14.544%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            fill="url(#bs3-a)"
            fillRule="evenodd"
            d="m410 0 461 369-284 58z"
            transform="matrix(1 0 0 -1 -410 427)"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-b border-slate-800 pb-12 pt-16 md:pb-20 md:pt-32">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-20">
            <h2 className="h2 bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-4 text-transparent">
              More than a login box
            </h2>
            <p className="text-lg text-slate-400">
              There are many variations available, but the majority have
              suffered alteration in some form, by injected humour, or
              randomised words which don't look even slightly believable.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <div data-aos="fade-down">
              <Highlighter className="group">
                <HighlighterItem>
                  <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-slate-900">
                    {/* Radial gradient */}
                    <div
                      className="pointer-events-none absolute bottom-0 left-1/2 -z-10 aspect-square w-1/2 -translate-x-1/2 translate-y-1/2"
                      aria-hidden="true"
                    >
                      <div className="translate-z-0 absolute inset-0 rounded-full bg-purple-500 blur-[120px]" />
                    </div>
                    <Image
                      src={FeatureImg04}
                      width={768}
                      height={400}
                      alt="Feature 04"
                    />
                  </div>
                </HighlighterItem>
              </Highlighter>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
