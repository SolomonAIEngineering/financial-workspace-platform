import Highlighter, { HighlighterItem02 } from '@/components/highlighter'

import Particles from '@/components/particles'
import CustomerImg01 from '@/public/images/customer-01.svg'
import CustomerImg02 from '@/public/images/customer-02.svg'
import CustomerImg03 from '@/public/images/customer-03.svg'
import CustomerImg04 from '@/public/images/customer-04.svg'
import CustomerImg05 from '@/public/images/customer-05.svg'
import CustomerImg06 from '@/public/images/customer-06.svg'
import CustomerImg07 from '@/public/images/customer-07.svg'
import CustomerImg08 from '@/public/images/customer-08.svg'
import CustomerImg09 from '@/public/images/customer-09.svg'
import CustomerImg10 from '@/public/images/customer-10.svg'
import CustomerAvatar01 from '@/public/images/customer-avatar-01.jpg'
import CustomerAvatar02 from '@/public/images/customer-avatar-02.jpg'
import CustomerBg01 from '@/public/images/customer-bg-01.png'
import CustomerBg02 from '@/public/images/customer-bg-02.png'
import CustomerBg03 from '@/public/images/customer-bg-03.png'
import CustomerBg04 from '@/public/images/customer-bg-04.png'
import CustomerBg05 from '@/public/images/customer-bg-05.png'
import CustomerBg06 from '@/public/images/customer-bg-06.png'
import CustomerBg07 from '@/public/images/customer-bg-07.png'
import CustomerBg08 from '@/public/images/customer-bg-08.png'
import CustomerBg09 from '@/public/images/customer-bg-09.png'
import CustomerBg10 from '@/public/images/customer-bg-10.png'
import Image from 'next/image'
import Link from 'next/link'

export default function CustomersList() {
  const items = [
    {
      name: 'Customer name',
      img: CustomerImg01,
      bg: CustomerBg01,
      link: '/customers/single-post',
    },
    {
      name: 'Customer name',
      img: CustomerImg02,
      bg: CustomerBg02,
      link: '/customers/single-post',
    },
    {
      name: 'Customer name',
      img: CustomerImg03,
      bg: CustomerBg03,
      link: '/customers/single-post',
    },
    {
      name: 'Customer name',
      img: CustomerImg04,
      bg: CustomerBg04,
      link: '/customers/single-post',
    },
    {
      name: 'Customer name',
      img: CustomerImg05,
      bg: CustomerBg05,
      link: '/customers/single-post',
    },
    {
      name: 'Customer name',
      img: CustomerImg06,
      bg: CustomerBg06,
      link: '/customers/single-post',
    },
    {
      name: 'Customer name',
      img: CustomerImg07,
      bg: CustomerBg07,
      link: '/customers/single-post',
    },
    {
      name: 'Customer name',
      img: CustomerImg08,
      bg: CustomerBg08,
      link: '/customers/single-post',
    },
    {
      name: 'Customer name',
      img: CustomerImg09,
      bg: CustomerBg09,
      link: '/customers/single-post',
    },
    {
      name: 'Customer name',
      img: CustomerImg10,
      bg: CustomerBg10,
      link: '/customers/single-post',
    },
  ]

  return (
    <div className="mx-auto max-w-[352px] pb-12 sm:max-w-[728px] md:pb-20 lg:max-w-none">
      <Highlighter className="[&_*:nth-child(n+10):not(:nth-child(n+11))]:order-2! group grid gap-6 sm:grid-cols-2 lg:grid-cols-3 [&_*:nth-child(n+5):not(:nth-child(n+12))]:order-1">
        {items.map((item, index) => (
          <div key={index}>
            <Link href={item.link}>
              <HighlighterItem02>
                <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-slate-900">
                  {/* Particles animation */}
                  <Particles className="absolute inset-0 -z-10" quantity={3} />
                  <div className="flex items-center justify-center">
                    <Image
                      className="aspect-video h-full w-full object-cover"
                      src={item.bg}
                      width={352}
                      height={198}
                      alt="Customer Background"
                      aria-hidden="true"
                    />
                    <Image
                      className="absolute"
                      src={item.img}
                      alt={item.name}
                    />
                  </div>
                </div>
              </HighlighterItem02>
            </Link>
          </div>
        ))}

        {/* Testimonial #01 */}
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <p className="bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-3 font-medium text-transparent">
            <span className="line-clamp-4">
              “We struggled to bring all our conversations into one place until
              we found Stellar. The UI is very clean and we love the integration
              with Spark.”
            </span>
          </p>
          <div className="mb-2 inline-flex">
            <Image
              className="rounded-full"
              src={CustomerAvatar01}
              width={32}
              height={32}
              alt="Customer Avatar 01"
            />
          </div>
          <div className="text-sm font-medium text-slate-300">
            Mike Hunt <span className="text-slate-700">-</span>{' '}
            <a className="text-purple-500 hover:underline" href="#0">
              Thunderbolt
            </a>
          </div>
        </div>
        {/* Testimonial #02 */}
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <p className="bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-3 font-medium text-transparent">
            <span className="line-clamp-4">
              “We struggled to bring all our conversations into one place until
              we found Stellar. The UI is very clean and we love the integration
              with Spark.”
            </span>
          </p>
          <div className="mb-2 inline-flex">
            <Image
              className="rounded-full"
              src={CustomerAvatar02}
              width={32}
              height={32}
              alt="Customer Avatar 02"
            />
          </div>
          <div className="text-sm font-medium text-slate-300">
            Mirko Mitt <span className="text-slate-700">-</span>{' '}
            <a className="text-purple-500 hover:underline" href="#0">
              Mildrink
            </a>
          </div>
        </div>
      </Highlighter>
    </div>
  )
}
