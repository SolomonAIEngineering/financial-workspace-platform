import Icon from '@/public/images/about-icon.svg'
import AboutIllustration from '@/public/images/about-illustration.svg'
import Illustration from '@/public/images/page-illustration.svg'
import Image from 'next/image'
import Particles from './particles'

export default function HeroAbout() {
  return (
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
      <Particles className="absolute inset-0 -z-10 h-96" quantity={10} />

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
        <div className="pb-10 pt-32 md:pt-40">
          {/* Hero content */}
          <div className="text-center">
            <div className="bg-linear-to-r inline-flex from-purple-500 to-purple-200 bg-clip-text pb-3 font-medium text-transparent">
              The folks behind the product
            </div>
            <h1 className="h1 bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-6 text-transparent">
              Turning security into innovation
            </h1>
            {/* Rings illustration */}
            <div className="relative inline-flex items-center justify-center">
              {/* Particles animation */}
              <div className="absolute inset-0 -z-10" aria-hidden="true">
                <canvas
                  data-particle-animation
                  data-particle-quantity="10"
                ></canvas>
              </div>
              <div className="inline-flex [mask-image:_radial-gradient(circle_at_bottom,transparent_15%,black_70%)]">
                <Image
                  src={AboutIllustration}
                  width={446}
                  height={446}
                  alt="About illustration"
                />
              </div>
              <Image
                className="animate-float absolute mt-[30%] drop-shadow-lg"
                src={Icon}
                width={72}
                height={72}
                alt="About icon"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
