'use client'

import 'swiper/swiper.min.css'

import Highlighter, { HighlighterItem } from './highlighter'
// Import Swiper
import { useEffect, useState } from 'react'
import Swiper, { Navigation } from 'swiper'

import CarouselImg01 from '@/public/images/carousel-icon-01.svg'
import CarouselImg02 from '@/public/images/carousel-icon-02.svg'
import CarouselImg03 from '@/public/images/carousel-icon-03.svg'
import CarouselImg04 from '@/public/images/carousel-icon-04.svg'
import CarouselImg05 from '@/public/images/carousel-icon-05.svg'
import Image from 'next/image'
import Particles from './particles'

Swiper.use([Navigation])

export default function TestimonialsCarousel() {
  const [swiperInitialized, setSwiperInitialized] = useState<boolean>(false)

  useEffect(() => {
    const carousel = new Swiper('.stellar-carousel', {
      breakpoints: {
        320: {
          slidesPerView: 1,
        },
        640: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
      },
      grabCursor: true,
      loop: false,
      centeredSlides: false,
      initialSlide: 0,
      spaceBetween: 24,
      navigation: {
        nextEl: '.carousel-next',
        prevEl: '.carousel-prev',
      },
    })
    setSwiperInitialized(true)
  }, [])

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-12 md:pt-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-20">
            <div>
              <div className="bg-linear-to-r inline-flex from-purple-500 to-purple-200 bg-clip-text pb-3 font-medium text-transparent">
                The security first platform
              </div>
            </div>
            <h2 className="h2 bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-4 text-transparent">
              Spot issues faster
            </h2>
            <p className="text-lg text-slate-400">
              All the lorem ipsum generators on the Internet tend to repeat
              predefined chunks as necessary, making this the first true
              generator on the Internet.
            </p>
          </div>

          {/* Carousel built with Swiper.js [https://swiperjs.com/] */}
          {/* * Custom styles in src/css/additional-styles/theme.scss */}
          <div className="before:bg-linear-to-l after:bg-linear-to-r relative before:absolute before:inset-0 before:z-20 before:-translate-x-full before:from-transparent before:to-slate-900 before:to-20% after:absolute after:inset-0 after:z-20 after:translate-x-full after:from-transparent after:to-slate-900 after:to-20%">
            <div className="stellar-carousel swiper-container group">
              <Highlighter
                className="swiper-wrapper w-fit"
                refresh={swiperInitialized}
              >
                {/* Carousel items */}
                <HighlighterItem className="swiper-slide group/slide h-auto">
                  <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-slate-900">
                    {/* Particles animation */}
                    <Particles
                      className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-in-out group-hover/slide:opacity-100 group-[.swiper-slide-active]/slide:opacity-100"
                      quantity={3}
                      refresh={swiperInitialized}
                    />
                    {/* Radial gradient */}
                    <div
                      className="pointer-events-none absolute bottom-0 left-1/2 -z-10 aspect-square w-1/3 -translate-x-1/2 translate-y-1/2"
                      aria-hidden="true"
                    >
                      <div className="translate-z-0 absolute inset-0 rounded-full bg-slate-800 blur-[60px] transition-colors duration-500 ease-in-out group-[.swiper-slide-active]/slide:bg-purple-500" />
                    </div>
                    <div className="flex h-full flex-col p-6">
                      <Image
                        className="mb-3"
                        src={CarouselImg01}
                        width={56}
                        height={56}
                        alt="Icon 01"
                      />
                      <div className="grow">
                        <div className="mb-1 text-lg font-bold">
                          Anonymous User
                        </div>
                        <div className="mb-3 text-slate-400">
                          Incorporate rich user profiling, and facilitate more
                          transactions.
                        </div>
                      </div>
                      <div className="text-right">
                        <a
                          className="group inline-flex items-center text-sm font-medium text-slate-300 transition duration-150 ease-in-out hover:text-white"
                          href="#0"
                        >
                          Learn More{' '}
                          <span className="ml-1 tracking-normal text-purple-500 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                            -&gt;
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </HighlighterItem>
                <HighlighterItem className="swiper-slide group/slide h-auto">
                  <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-slate-900">
                    {/* Particles animation */}
                    <Particles
                      className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-in-out group-hover/slide:opacity-100 group-[.swiper-slide-active]/slide:opacity-100"
                      quantity={3}
                      refresh={swiperInitialized}
                    />
                    {/* Radial gradient */}
                    <div
                      className="pointer-events-none absolute bottom-0 left-1/2 -z-10 aspect-square w-1/3 -translate-x-1/2 translate-y-1/2"
                      aria-hidden="true"
                    >
                      <div className="translate-z-0 absolute inset-0 rounded-full bg-slate-800 blur-[60px] transition-colors duration-500 ease-in-out group-[.swiper-slide-active]/slide:bg-purple-500" />
                    </div>
                    <div className="flex h-full flex-col p-6">
                      <Image
                        className="mb-3"
                        src={CarouselImg02}
                        width={56}
                        height={56}
                        alt="Icon 01"
                      />
                      <div className="grow">
                        <div className="mb-1 text-lg font-bold">
                          Bot Detection
                        </div>
                        <div className="mb-3 text-slate-400">
                          Incorporate rich user profiling, and facilitate more
                          transactions.
                        </div>
                      </div>
                      <div className="text-right">
                        <a
                          className="group inline-flex items-center text-sm font-medium text-slate-300 transition duration-150 ease-in-out hover:text-white"
                          href="#0"
                        >
                          Learn More{' '}
                          <span className="ml-1 tracking-normal text-purple-500 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                            -&gt;
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </HighlighterItem>
                <HighlighterItem className="swiper-slide group/slide h-auto">
                  <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-slate-900">
                    {/* Particles animation */}
                    <Particles
                      className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-in-out group-hover/slide:opacity-100 group-[.swiper-slide-active]/slide:opacity-100"
                      quantity={3}
                      refresh={swiperInitialized}
                    />
                    {/* Radial gradient */}
                    <div
                      className="pointer-events-none absolute bottom-0 left-1/2 -z-10 aspect-square w-1/3 -translate-x-1/2 translate-y-1/2"
                      aria-hidden="true"
                    >
                      <div className="translate-z-0 absolute inset-0 rounded-full bg-slate-800 blur-[60px] transition-colors duration-500 ease-in-out group-[.swiper-slide-active]/slide:bg-purple-500" />
                    </div>
                    <div className="flex h-full flex-col p-6">
                      <Image
                        className="mb-3"
                        src={CarouselImg03}
                        width={56}
                        height={56}
                        alt="Icon 01"
                      />
                      <div className="grow">
                        <div className="mb-1 text-lg font-bold">
                          Social integrations
                        </div>
                        <div className="mb-3 text-slate-400">
                          Incorporate rich user profiling, and facilitate more
                          transactions.
                        </div>
                      </div>
                      <div className="text-right">
                        <a
                          className="group inline-flex items-center text-sm font-medium text-slate-300 transition duration-150 ease-in-out hover:text-white"
                          href="#0"
                        >
                          Learn More{' '}
                          <span className="ml-1 tracking-normal text-purple-500 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                            -&gt;
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </HighlighterItem>
                <HighlighterItem className="swiper-slide group/slide h-auto">
                  <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-slate-900">
                    {/* Particles animation */}
                    <Particles
                      className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-in-out group-hover/slide:opacity-100 group-[.swiper-slide-active]/slide:opacity-100"
                      quantity={3}
                      refresh={swiperInitialized}
                    />
                    {/* Radial gradient */}
                    <div
                      className="pointer-events-none absolute bottom-0 left-1/2 -z-10 aspect-square w-1/3 -translate-x-1/2 translate-y-1/2"
                      aria-hidden="true"
                    >
                      <div className="translate-z-0 absolute inset-0 rounded-full bg-slate-800 blur-[60px] transition-colors duration-500 ease-in-out group-[.swiper-slide-active]/slide:bg-purple-500" />
                    </div>
                    <div className="flex h-full flex-col p-6">
                      <Image
                        className="mb-3"
                        src={CarouselImg04}
                        width={56}
                        height={56}
                        alt="Icon 01"
                      />
                      <div className="grow">
                        <div className="mb-1 text-lg font-bold">
                          Progressive Profiling
                        </div>
                        <div className="mb-3 text-slate-400">
                          Incorporate rich user profiling, and facilitate more
                          transactions.
                        </div>
                      </div>
                      <div className="text-right">
                        <a
                          className="group inline-flex items-center text-sm font-medium text-slate-300 transition duration-150 ease-in-out hover:text-white"
                          href="#0"
                        >
                          Learn More{' '}
                          <span className="ml-1 tracking-normal text-purple-500 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                            -&gt;
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </HighlighterItem>
                <HighlighterItem className="swiper-slide group/slide h-auto">
                  <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-slate-900">
                    {/* Particles animation */}
                    <Particles
                      className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-in-out group-hover/slide:opacity-100 group-[.swiper-slide-active]/slide:opacity-100"
                      quantity={3}
                      refresh={swiperInitialized}
                    />
                    {/* Radial gradient */}
                    <div
                      className="pointer-events-none absolute bottom-0 left-1/2 -z-10 aspect-square w-1/3 -translate-x-1/2 translate-y-1/2"
                      aria-hidden="true"
                    >
                      <div className="translate-z-0 absolute inset-0 rounded-full bg-slate-800 blur-[60px] transition-colors duration-500 ease-in-out group-[.swiper-slide-active]/slide:bg-purple-500" />
                    </div>
                    <div className="flex h-full flex-col p-6">
                      <Image
                        className="mb-3"
                        src={CarouselImg05}
                        width={56}
                        height={56}
                        alt="Icon 05"
                      />
                      <div className="grow">
                        <div className="mb-1 text-lg font-bold">
                          Secure Access
                        </div>
                        <div className="mb-3 text-slate-400">
                          Incorporate rich user profiling, and facilitate more
                          transactions.
                        </div>
                      </div>
                      <div className="text-right">
                        <a
                          className="group inline-flex items-center text-sm font-medium text-slate-300 transition duration-150 ease-in-out hover:text-white"
                          href="#0"
                        >
                          Learn More{' '}
                          <span className="ml-1 tracking-normal text-purple-500 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                            -&gt;
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </HighlighterItem>
              </Highlighter>
            </div>
          </div>

          {/* Arrows */}
          <div className="mt-8 flex justify-end">
            <button className="carousel-prev group relative z-20 flex h-12 w-12 items-center justify-center">
              <span className="sr-only">Previous</span>
              <svg
                className="h-4 w-4 fill-slate-500 transition duration-150 ease-in-out group-hover:fill-purple-500"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6.7 14.7l1.4-1.4L3.8 9H16V7H3.8l4.3-4.3-1.4-1.4L0 8z" />
              </svg>
            </button>
            <button className="carousel-next group relative z-20 flex h-12 w-12 items-center justify-center">
              <span className="sr-only">Next</span>
              <svg
                className="h-4 w-4 fill-slate-500 transition duration-150 ease-in-out group-hover:fill-purple-500"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.3 14.7l-1.4-1.4L12.2 9H0V7h12.2L7.9 2.7l1.4-1.4L16 8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
