export default function Faqs() {
  return (
    <section className="relative">
      {/* Blurred shape */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 ml-24 -translate-x-1/2 -translate-y-1/3 opacity-50 blur-2xl"
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
        <div className="border-t py-12 [border-image:linear-gradient(to_right,transparent,var(--color-slate-800),transparent)1] md:py-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-20">
            <div>
              <div className="bg-linear-to-r inline-flex from-purple-500 to-purple-200 bg-clip-text pb-3 font-medium text-transparent">
                Getting started with Stellar
              </div>
            </div>
            <h2 className="h2 bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-4 text-transparent">
              Everything you need to know
            </h2>
          </div>

          {/* Columns */}
          <div className="space-y-8 md:flex md:space-x-12 md:space-y-0">
            {/* Column */}
            <div className="w-full space-y-8 md:w-1/2">
              {/* Item */}
              <div className="space-y-2">
                <h4 className="font-semibold">What is Stellar?</h4>
                <p className="text-slate-400">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Quis enim lobortis scelerisque fermentum.
                </p>
              </div>

              {/* Item */}
              <div className="space-y-2">
                <h4 className="font-semibold">
                  What's an affordable alternative to Stellar?
                </h4>
                <p className="text-slate-400">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Quis enim lobortis scelerisque fermentum.
                </p>
              </div>

              {/* Item */}
              <div className="space-y-2">
                <h4 className="font-semibold">
                  Can I remove the 'Powered by Stellar' branding?
                </h4>
                <p className="text-slate-400">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Quis enim lobortis scelerisque fermentum.
                </p>
              </div>
            </div>

            {/* Column */}
            <div className="w-full space-y-8 md:w-1/2">
              {/* Item */}
              <div className="space-y-2">
                <h4 className="font-semibold">
                  What kind of data can I collect from my customers?
                </h4>
                <p className="text-slate-400">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Quis enim lobortis scelerisque fermentum.
                </p>
              </div>

              {/* Item */}
              <div className="space-y-2">
                <h4 className="font-semibold">Can I use Stellar for free?</h4>
                <p className="text-slate-400">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Quis enim lobortis scelerisque fermentum.
                </p>
              </div>

              {/* Item */}
              <div className="space-y-2">
                <h4 className="font-semibold">
                  Is Stellar affordable for small businesses?
                </h4>
                <p className="text-slate-400">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Quis enim lobortis scelerisque fermentum.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
