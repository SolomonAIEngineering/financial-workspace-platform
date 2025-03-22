export const metadata = {
  title: 'Customers - Stellar',
  description: 'Page description',
}

import Particles from '@/components/particles'
import Illustration from '@/public/images/page-illustration.svg'
import Image from 'next/image'
import CustomersList from './customers-list'

export default function Customers() {
  return (
    <>
      <section className="relative">
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
                Leaders love Stellar
              </div>
              <h1 className="h1 bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-4 text-transparent">
                Trusted by leading companies
              </h1>
              <div className="mx-auto max-w-3xl">
                <p className="text-lg text-slate-400">
                  Stellar powers thousands of high-impact product teams. From
                  next-gen startups who reach for the stars to established
                  greats who change the world.
                </p>
              </div>
            </div>

            <CustomersList />
          </div>
        </div>
      </section>
    </>
  )
}
