import Particles from '@/components/particles'
import Icon01 from '@/public/images/pricing-icon-01.svg'
import Icon02 from '@/public/images/pricing-icon-02.svg'
import Icon03 from '@/public/images/pricing-icon-03.svg'
import Icon04 from '@/public/images/pricing-icon-04.svg'
import Icon05 from '@/public/images/pricing-icon-05.svg'
import Icon06 from '@/public/images/pricing-icon-06.svg'
import Icon07 from '@/public/images/pricing-icon-07.svg'
import IllustrationTop from '@/public/images/pricing-illustration-top.svg'
import Illustration from '@/public/images/pricing-illustration.svg'
import Image from 'next/image'

export default function Features05() {
  return (
    <section className="relative">
      {/* Particles animation */}
      <div className="absolute left-1/2 top-0 -z-10 -mt-24 h-64 w-64 -translate-x-1/2">
        <Particles
          className="absolute inset-0 -z-10"
          quantity={6}
          staticity={30}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 md:pb-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-12 text-center">
            <h2 className="h2 bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-4 text-transparent">
              Stop overpaying for software
            </h2>
            <p className="text-lg text-slate-400">
              There are many variations available, but the majority have
              suffered alteration in some form, by injected humour.
            </p>
          </div>

          {/* Rings illustration */}
          <div className="pb-8 text-center">
            <div className="relative inline-flex items-center justify-center">
              {/* Particles animation */}
              <Particles className="absolute inset-0 -z-10" quantity={10} />
              <div className="inline-flex">
                <Image
                  src={Illustration}
                  width="334"
                  height="334"
                  alt="Features illustration"
                />
              </div>
              <Image
                className="absolute -mt-[40%]"
                src={IllustrationTop}
                width="396"
                height="328"
                alt="Features illustration top"
                aria-hidden="true"
              />
              <div className="absolute flex w-[200%] items-center justify-center space-x-5">
                <div className="-rotate-[4deg]">
                  <Image
                    className="h-11 w-11 animate-[float_2.6s_ease-in-out_infinite] opacity-10 drop-shadow-lg"
                    src={Icon01}
                    width={80}
                    height={80}
                    alt="Pricing icon 01"
                  />
                </div>
                <div className="rotate-[4deg]">
                  <Image
                    className="h-14 w-14 animate-[float_2.4s_ease-in-out_infinite] opacity-25 drop-shadow-lg"
                    src={Icon02}
                    width={80}
                    height={80}
                    alt="Pricing icon 02"
                  />
                </div>
                <div className="-rotate-[4deg]">
                  <Image
                    className="h-16 w-16 animate-[float_2.2s_ease-in-out_infinite] opacity-60 drop-shadow-lg"
                    src={Icon03}
                    width={80}
                    height={80}
                    alt="Pricing icon 03"
                  />
                </div>
                <Image
                  className="animate-float drop-shadow-lg"
                  src={Icon04}
                  width={80}
                  height={80}
                  alt="Pricing icon 04"
                />
                <div className="rotate-[4deg]">
                  <Image
                    className="h-16 w-16 animate-[float_2.2s_ease-in-out_infinite] opacity-60 drop-shadow-lg"
                    src={Icon05}
                    width={80}
                    height={80}
                    alt="Pricing icon 05"
                  />
                </div>
                <div className="-rotate-[4deg]">
                  <Image
                    className="h-14 w-14 animate-[float_2.4s_ease-in-out_infinite] opacity-25 drop-shadow-lg"
                    src={Icon06}
                    width={80}
                    height={80}
                    alt="Pricing icon 06"
                  />
                </div>
                <div className="rotate-[4deg]">
                  <Image
                    className="h-11 w-11 animate-[float_2.6ås_ease-in-out_infinite] opacity-10 drop-shadow-lg"
                    src={Icon07}
                    width={80}
                    height={80}
                    alt="Pricing icon 07"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Features list */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card #1 */}
            <div className="bg-linear-to-tr rounded-3xl border border-slate-800 from-slate-800/50 to-slate-800/10">
              <div className="flex h-full items-center space-x-4 p-4">
                <svg
                  className="shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                >
                  <path
                    className="fill-purple-500"
                    fillOpacity=".24"
                    d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0Z"
                  />
                  <path
                    className="fill-purple-400"
                    fillRule="nonzero"
                    d="M13 6.586 14.414 8l-5.747 5.748-3.081-3.081L7 9.252l1.667 1.667z"
                  />
                </svg>
                <p className="text-sm text-slate-400">
                  Purpose-built for company that requires more than a{' '}
                  <strong className="font-medium text-slate-300">
                    simple plan
                  </strong>{' '}
                  with security infrastructure.
                </p>
              </div>
            </div>
            {/* Card #2 */}
            <div className="bg-linear-to-tr rounded-3xl border border-slate-800 from-slate-800/50 to-slate-800/10">
              <div className="flex h-full items-center space-x-4 p-4">
                <svg
                  className="shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                >
                  <path
                    className="fill-purple-500"
                    fillOpacity=".24"
                    d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0Z"
                  />
                  <path
                    className="fill-purple-400"
                    fillRule="nonzero"
                    d="M13 6.586 14.414 8l-5.747 5.748-3.081-3.081L7 9.252l1.667 1.667z"
                  />
                </svg>
                <p className="text-sm text-slate-400">
                  AI-powered to{' '}
                  <strong className="font-medium text-slate-300">
                    remove the burdens
                  </strong>{' '}
                  of tedious knowledge management and security tasks.
                </p>
              </div>
            </div>
            {/* Card #3 */}
            <div className="bg-linear-to-tr rounded-3xl border border-slate-800 from-slate-800/50 to-slate-800/10">
              <div className="flex h-full items-center space-x-4 p-4">
                <svg
                  className="shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                >
                  <path
                    className="fill-purple-500"
                    fillOpacity=".24"
                    d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0Z"
                  />
                  <path
                    className="fill-purple-400"
                    fillRule="nonzero"
                    d="M13 6.586 14.414 8l-5.747 5.748-3.081-3.081L7 9.252l1.667 1.667z"
                  />
                </svg>
                <p className="text-sm text-slate-400">
                  There's no prioritized support in Stellar. You can use email
                  or live chat and you will hear back in a{' '}
                  <strong className="font-medium text-slate-300">
                    couple of hours
                  </strong>
                  .
                </p>
              </div>
            </div>
            {/* Card #4 */}
            <div className="bg-linear-to-tr rounded-3xl border border-slate-800 from-slate-800/50 to-slate-800/10">
              <div className="flex h-full items-center space-x-4 p-4">
                <svg
                  className="shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                >
                  <path
                    className="fill-purple-500"
                    fillOpacity=".24"
                    d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0Z"
                  />
                  <path
                    className="fill-purple-400"
                    fillRule="nonzero"
                    d="M13 6.586 14.414 8l-5.747 5.748-3.081-3.081L7 9.252l1.667 1.667z"
                  />
                </svg>
                <p className="text-sm text-slate-400">
                  Comprehensive{' '}
                  <strong className="font-medium text-slate-300">
                    developer docs
                  </strong>{' '}
                  and a centralized support center packed many resources.
                </p>
              </div>
            </div>
            {/* Card #5 */}
            <div className="bg-linear-to-tr rounded-3xl border border-slate-800 from-slate-800/50 to-slate-800/10">
              <div className="flex h-full items-center space-x-4 p-4">
                <svg
                  className="shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                >
                  <path
                    className="fill-purple-500"
                    fillOpacity=".24"
                    d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0Z"
                  />
                  <path
                    className="fill-purple-400"
                    fillRule="nonzero"
                    d="M13 6.586 14.414 8l-5.747 5.748-3.081-3.081L7 9.252l1.667 1.667z"
                  />
                </svg>
                <p className="text-sm text-slate-400">
                  No upcharges—and we'd never upsell you to a higher plan or a{' '}
                  <strong className="font-medium text-slate-300">
                    dedicated IP
                  </strong>{' '}
                  to improve deliverability.
                </p>
              </div>
            </div>
            {/* Card #6 */}
            <div className="bg-linear-to-tr rounded-3xl border border-slate-800 from-slate-800/50 to-slate-800/10">
              <div className="flex h-full items-center space-x-4 p-4">
                <svg
                  className="shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                >
                  <path
                    className="fill-purple-500"
                    fillOpacity=".24"
                    d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0Z"
                  />
                  <path
                    className="fill-purple-400"
                    fillRule="nonzero"
                    d="M13 6.586 14.414 8l-5.747 5.748-3.081-3.081L7 9.252l1.667 1.667z"
                  />
                </svg>
                <p className="text-sm text-slate-400">
                  Tool training, dedicated resources, and{' '}
                  <strong className="font-medium text-slate-300">
                    regular updates
                  </strong>{' '}
                  are available for both small and large teams.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
