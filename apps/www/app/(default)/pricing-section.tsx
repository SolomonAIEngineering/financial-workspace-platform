import Pricing from '@/components/pricing'

export default function PricingSection() {
  return (
    <section className="relative">
      {/* Radial gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-0 flex aspect-square w-1/3 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="translate-z-0 absolute inset-0 rounded-full bg-purple-500 opacity-50 blur-[120px]" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Content */}
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-20">
            <div>
              <div className="bg-linear-to-r inline-flex from-purple-500 to-purple-200 bg-clip-text pb-3 font-medium text-transparent">
                Pricing plans
              </div>
            </div>
            <h2 className="h2 bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-4 text-transparent">
              Flexible plans and features
            </h2>
            <p className="text-lg text-slate-400">
              All the lorem ipsum generators on the Internet tend to repeat
              predefined chunks as necessary, making this the first true
              generator on the Internet.
            </p>
          </div>
          <Pricing />
        </div>
      </div>
    </section>
  )
}
