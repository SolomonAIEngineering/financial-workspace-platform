import Particles from './particles'

export default function Cta02() {
  return (
    <section className="relative">
      {/* Particles animation */}
      <div className="absolute left-1/2 top-0 -z-10 -mt-24 h-80 w-80 -translate-x-1/2">
        <Particles
          className="absolute inset-0 -z-10"
          quantity={6}
          staticity={30}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative border-b border-t px-8 py-12 [border-image:linear-gradient(to_right,transparent,var(--color-slate-800),transparent)1] md:py-20">
          {/* Blurred shape */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-10 -mt-24 ml-24 -translate-x-1/2 opacity-70 blur-2xl"
            aria-hidden="true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="434" height="427">
              <defs>
                <linearGradient
                  id="bs4-a"
                  x1="19.609%"
                  x2="50%"
                  y1="14.544%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#A855F7"></stop>
                  <stop
                    offset="100%"
                    stopColor="#6366F1"
                    stopOpacity="0"
                  ></stop>
                </linearGradient>
              </defs>
              <path
                fill="url(#bs4-a)"
                fillRule="evenodd"
                d="m0 0 461 369-284 58z"
                transform="matrix(1 0 0 -1 0 427)"
              ></path>
            </svg>
          </div>
          {/* Content */}
          <div className="mx-auto max-w-3xl text-center">
            <div>
              <div className="bg-linear-to-r inline-flex from-purple-500 to-purple-200 bg-clip-text pb-3 font-medium text-transparent">
                The security first platform
              </div>
            </div>
            <h2 className="h2 bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-4 text-transparent">
              Supercharge your security
            </h2>
            <p className="mb-8 text-lg text-slate-400">
              All the lorem ipsum generators on the Internet tend to repeat
              predefined chunks as necessary, making this the first true
              generator on the Internet.
            </p>
            <div>
              <a
                className="btn bg-linear-to-r group from-white/80 via-white to-white/80 text-slate-900 transition duration-150 ease-in-out hover:bg-white"
                href="#0"
              >
                Start Building{' '}
                <span className="ml-1 tracking-normal text-purple-500 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                  -&gt;
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
