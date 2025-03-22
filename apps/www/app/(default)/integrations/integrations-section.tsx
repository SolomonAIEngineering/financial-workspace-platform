import IntegrationsCarousel from '@/components/integrations-carousel'
import Particles from '@/components/particles'
import Illustration02 from '@/public/images/page-illustration-02.svg'
import Illustration from '@/public/images/page-illustration.svg'
import Image from 'next/image'

export default function IntegrationsSection() {
  return (
    <section className="relative">
      {/* Illustration 02 */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -mb-16 -translate-x-1/2 opacity-90 blur-2xl md:block"
        aria-hidden="true"
      >
        <Image
          src={Illustration02}
          className="max-w-none"
          width={1440}
          height={427}
          alt="Page Illustration 02"
        />
      </div>

      {/* Opacity layer */}
      <div
        className="absolute inset-0 -z-10 bg-slate-900 opacity-60"
        aria-hidden="true"
      ></div>

      {/* Radial gradient */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 flex aspect-square w-[800px] -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        aria-hidden="true"
      >
        <div className="translate-z-0 absolute inset-0 rounded-full bg-purple-500 opacity-30 blur-[120px]"></div>
        <div className="translate-z-0 absolute h-64 w-64 rounded-full bg-purple-400 opacity-70 blur-[80px]"></div>
      </div>

      {/* Particles animation */}
      <Particles className="absolute inset-0 -z-10 h-96" quantity={15} />

      {/* Illustration */}
      <div
        className="pointer-events-none absolute left-1/2 -z-10 -mt-16 -translate-x-1/2 opacity-90 blur-2xl md:block"
        aria-hidden="true"
      >
        <Image
          src={Illustration}
          className="max-w-none"
          width={1440}
          height={427}
          alt="Page Illustration"
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-32 md:pt-40">
          {/* Section header */}
          <div className="pb-12 text-center md:pb-20">
            <div className="bg-linear-to-r inline-flex from-purple-500 to-purple-200 bg-clip-text pb-3 font-medium text-transparent">
              Integrations & Add-ons
            </div>
            <h1 className="h1 bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-4 text-transparent">
              Make Stellar uniquely yours
            </h1>
            <div className="mx-auto max-w-3xl">
              <p className="text-lg text-slate-400">
                Our landing page template works on all devices, so you only have
                to set it up once, and get beautiful results forever.
              </p>
            </div>
          </div>

          <IntegrationsCarousel />
        </div>
      </div>
    </section>
  )
}
