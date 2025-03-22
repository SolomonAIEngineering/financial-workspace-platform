import Highlighter, { HighlighterItem02 } from '@/components/highlighter'
import Particles from '@/components/particles'
import CustomerImg02 from '@/public/images/customer-02.svg'
import CustomerImg03 from '@/public/images/customer-03.svg'
import CustomerImg06 from '@/public/images/customer-06.svg'
import CustomerBg02 from '@/public/images/customer-bg-02.png'
import CustomerBg03 from '@/public/images/customer-bg-03.png'
import CustomerBg06 from '@/public/images/customer-bg-06.png'
import Image from 'next/image'
import Link from 'next/link'

export default function RelatedPosts() {
  const items = [
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
      img: CustomerImg06,
      bg: CustomerBg06,
      link: '/customers/single-post',
    },
  ]

  return (
    <aside>
      <h2 className="bg-linear-to-r inline-flex from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-8 text-lg font-bold text-transparent">
        Related stories
      </h2>
      <div className="mx-auto sm:max-w-[728px] lg:max-w-none">
        <Highlighter className="group grid gap-4 sm:grid-cols-3 lg:grid-cols-3 lg:gap-6">
          {items.map((item, index) => (
            <div key={index}>
              <Link href={item.link}>
                <HighlighterItem02>
                  <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-slate-900">
                    {/* Particles animation */}
                    <Particles
                      className="absolute inset-0 -z-10"
                      quantity={3}
                    />
                    <div className="flex h-32 items-center justify-center lg:h-36">
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
        </Highlighter>
      </div>
    </aside>
  )
}
