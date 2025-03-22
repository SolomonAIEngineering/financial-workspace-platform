export default function Cta03() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[3rem] px-8 py-12 md:py-20">
          {/* Radial gradient */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-10 flex aspect-square w-1/3 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            aria-hidden="true"
          >
            <div className="translate-z-0 absolute inset-0 rounded-full bg-purple-500 opacity-70 blur-[120px]"></div>
            <div className="translate-z-0 absolute h-1/4 w-1/4 rounded-full bg-purple-400 blur-[40px]"></div>
          </div>
          {/* Blurred shape */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 -z-10 translate-y-1/2 opacity-50 blur-2xl"
            aria-hidden="true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="434" height="427">
              <defs>
                <linearGradient
                  id="bs5-a"
                  x1="19.609%"
                  x2="50%"
                  y1="14.544%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                fill="url(#bs5-a)"
                fillRule="evenodd"
                d="m0 0 461 369-284 58z"
                transform="matrix(1 0 0 -1 0 427)"
              />
            </svg>
          </div>
          {/* Content */}
          <div className="mx-auto max-w-3xl text-center">
            <div>
              <div className="bg-linear-to-r inline-flex from-purple-500 to-purple-200 bg-clip-text pb-3 font-medium text-transparent">
                Never miss an update
              </div>
            </div>
            <h2 className="h2 bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-4 text-transparent">
              Take control of your business
            </h2>
            <p className="mb-8 text-lg text-slate-400">
              Find out about our latest product changes as we continue improving
              Stellar to enable your team to collaborate better.
            </p>
            <form className="inline-flex w-full max-w-sm">
              <div className="mx-auto flex w-full max-w-xs flex-col justify-center sm:max-w-none sm:flex-row">
                <input
                  type="email"
                  className="form-input mb-3 w-full rounded-full border-slate-700 bg-slate-800/30 py-1.5 sm:mb-0 sm:mr-2"
                  placeholder="Your email"
                  aria-label="Your email"
                />
                <button
                  className="btn bg-linear-to-r group from-white/80 via-white to-white/80 text-slate-900 transition duration-150 ease-in-out hover:bg-white"
                  type="submit"
                >
                  Subscribe{' '}
                  <span className="ml-1 tracking-normal text-purple-500 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                    -&gt;
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
