'use client'

import Illustration from '@/public/images/glow-top.svg'
import { Transition } from '@headlessui/react'
import Image from 'next/image'
import { useState } from 'react'
import Particles from './particles'

export default function Features() {
  const [tab, setTab] = useState<number>(1)

  return (
    <section>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Illustration */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 -mx-28 overflow-hidden rounded-t-[3rem]"
          aria-hidden="true"
        >
          <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2">
            <Image
              src={Illustration}
              className="max-w-none"
              width={1404}
              height={658}
              alt="Features Illustration"
            />
          </div>
        </div>

        <div className="pb-12 pt-16 md:pb-20 md:pt-52">
          <div>
            {/* Section content */}
            <div className="mx-auto flex max-w-xl flex-col space-y-8 space-y-reverse md:max-w-none md:flex-row md:space-x-8 md:space-y-0 lg:space-x-16 xl:space-x-20">
              {/* Content */}
              <div
                className="order-1 max-md:text-center md:order-none md:w-7/12 lg:w-1/2"
                data-aos="fade-down"
              >
                {/* Content #1 */}
                <div>
                  <div className="bg-linear-to-r inline-flex from-purple-500 to-purple-200 bg-clip-text pb-3 font-medium text-transparent">
                    The security first platform
                  </div>
                </div>
                <h3 className="h3 bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-3 text-transparent">
                  Simplify your security with authentication services
                </h3>
                <p className="mb-8 text-lg text-slate-400">
                  Define access roles for the end-users, and extend your
                  authorization capabilities to implement dynamic access
                  control.
                </p>
                <div className="mt-8 max-w-xs space-y-2 max-md:mx-auto">
                  <button
                    className={`flex w-full items-center rounded-sm border bg-slate-800/25 px-3 py-2 text-sm font-medium text-slate-50 transition duration-150 ease-in-out hover:opacity-100 ${tab !== 1 ? 'border-slate-700 opacity-50' : 'border-purple-700 shadow-sm shadow-purple-500/25'}`}
                    onClick={() => setTab(1)}
                  >
                    <svg
                      className="mr-3 shrink-0 fill-slate-300"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                    >
                      <path d="M14 0a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12Zm0 14V2H2v12h12Zm-3-7H5a1 1 0 1 1 0-2h6a1 1 0 0 1 0 2Zm0 4H5a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2Z" />
                    </svg>
                    <span>Simplify your security</span>
                  </button>
                  <button
                    className={`flex w-full items-center rounded-sm border bg-slate-800/25 px-3 py-2 text-sm font-medium text-slate-50 transition duration-150 ease-in-out hover:opacity-100 ${tab !== 2 ? 'border-slate-700 opacity-50' : 'border-purple-700 shadow-sm shadow-purple-500/25'}`}
                    onClick={() => setTab(2)}
                  >
                    <svg
                      className="mr-3 shrink-0 fill-slate-300"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                    >
                      <path d="M2 6H0V2a2 2 0 0 1 2-2h4v2H2v4ZM16 6h-2V2h-4V0h4a2 2 0 0 1 2 2v4ZM14 16h-4v-2h4v-4h2v4a2 2 0 0 1-2 2ZM6 16H2a2 2 0 0 1-2-2v-4h2v4h4v2Z" />
                    </svg>
                    <span>Customer identity</span>
                  </button>
                  <button
                    className={`flex w-full items-center rounded-sm border bg-slate-800/25 px-3 py-2 text-sm font-medium text-slate-50 transition duration-150 ease-in-out hover:opacity-100 ${tab !== 3 ? 'border-slate-700 opacity-50' : 'border-purple-700 shadow-sm shadow-purple-500/25'}`}
                    onClick={() => setTab(3)}
                  >
                    <svg
                      className="mr-3 shrink-0 fill-slate-300"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                    >
                      <path d="M14.3.3c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4l-8 8c-.2.2-.4.3-.7.3-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4l8-8ZM15 7c.6 0 1 .4 1 1 0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8c.6 0 1 .4 1 1s-.4 1-1 1C4.7 2 2 4.7 2 8s2.7 6 6 6 6-2.7 6-6c0-.6.4-1 1-1Z" />
                    </svg>
                    <span>Adaptable authentication</span>
                  </button>
                </div>
              </div>

              {/* Image */}
              <div
                className="md:w-5/12 lg:w-1/2"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <div className="relative -mt-12 py-24">
                  {/* Particles animation */}
                  <Particles
                    className="absolute inset-0 -z-10"
                    quantity={8}
                    staticity={30}
                  />

                  <div className="flex items-center justify-center">
                    <div className="relative flex h-48 w-48 items-center justify-center">
                      {/* Halo effect */}
                      <svg
                        className="pointer-events-none absolute inset-0 left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 transform blur-md will-change-transform"
                        width="480"
                        height="480"
                        viewBox="0 0 480 480"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <linearGradient
                            id="pulse-a"
                            x1="50%"
                            x2="50%"
                            y1="100%"
                            y2="0%"
                          >
                            <stop offset="0%" stopColor="#A855F7" />
                            <stop offset="76.382%" stopColor="#FAF5FF" />
                            <stop offset="100%" stopColor="#6366F1" />
                          </linearGradient>
                        </defs>
                        <g fillRule="evenodd">
                          <path
                            className="pulse"
                            fill="url(#pulse-a)"
                            fillRule="evenodd"
                            d="M240,0 C372.5484,0 480,107.4516 480,240 C480,372.5484 372.5484,480 240,480 C107.4516,480 0,372.5484 0,240 C0,107.4516 107.4516,0 240,0 Z M240,88.8 C156.4944,88.8 88.8,156.4944 88.8,240 C88.8,323.5056 156.4944,391.2 240,391.2 C323.5056,391.2 391.2,323.5056 391.2,240 C391.2,156.4944 323.5056,88.8 240,88.8 Z"
                          />
                          <path
                            className="pulse pulse-1"
                            fill="url(#pulse-a)"
                            fillRule="evenodd"
                            d="M240,0 C372.5484,0 480,107.4516 480,240 C480,372.5484 372.5484,480 240,480 C107.4516,480 0,372.5484 0,240 C0,107.4516 107.4516,0 240,0 Z M240,88.8 C156.4944,88.8 88.8,156.4944 88.8,240 C88.8,323.5056 156.4944,391.2 240,391.2 C323.5056,391.2 391.2,323.5056 391.2,240 C391.2,156.4944 323.5056,88.8 240,88.8 Z"
                          />
                          <path
                            className="pulse pulse-2"
                            fill="url(#pulse-a)"
                            fillRule="evenodd"
                            d="M240,0 C372.5484,0 480,107.4516 480,240 C480,372.5484 372.5484,480 240,480 C107.4516,480 0,372.5484 0,240 C0,107.4516 107.4516,0 240,0 Z M240,88.8 C156.4944,88.8 88.8,156.4944 88.8,240 C88.8,323.5056 156.4944,391.2 240,391.2 C323.5056,391.2 391.2,323.5056 391.2,240 C391.2,156.4944 323.5056,88.8 240,88.8 Z"
                          />
                        </g>
                      </svg>
                      {/* Grid */}
                      <div className="pointer-events-none absolute inset-0 left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-full [mask-image:_radial-gradient(black,_transparent_60%)]">
                        <div className="animate-endless h-[200%]">
                          <div className="absolute inset-0 opacity-20 blur-[2px] [background:repeating-linear-gradient(transparent,transparent_48px,var(--color-white)_48px,var(--color-white)_49px)]" />
                          <div className="absolute inset-0 [background:repeating-linear-gradient(transparent,transparent_48px,var(--color-purple-500)_48px,var(--color-purple-500)_49px)]" />
                          <div className="absolute inset-0 opacity-20 blur-[2px] [background:repeating-linear-gradient(90deg,transparent,transparent_48px,var(--color-white)_48px,var(--color-white)_49px)]" />
                          <div className="absolute inset-0 [background:repeating-linear-gradient(90deg,transparent,transparent_48px,var(--color-purple-500)_48px,var(--color-purple-500)_49px)]" />
                        </div>
                      </div>
                      {/* Icons */}
                      <Transition
                        as="div"
                        show={tab === 1}
                        className={`data-closed:absolute data-enter:data-closed:-rotate-[60deg] data-leave:data-closed:rotate-[60deg] data-closed:opacity-0 transform transition duration-700 ease-[cubic-bezier(0.68,-0.3,0.32,1)]`}
                        unmount={false}
                        appear={true}
                      >
                        <div className="relative flex h-16 w-16 -rotate-[14deg] items-center justify-center rounded-2xl border border-transparent shadow-2xl [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box] before:absolute before:inset-0 before:rounded-2xl before:bg-slate-800/30">
                          <svg
                            className="relative fill-slate-200"
                            xmlns="http://www.w3.org/2000/svg"
                            width="23"
                            height="25"
                          >
                            <path
                              fillRule="nonzero"
                              d="M10.55 15.91H.442L14.153.826 12.856 9.91h10.107L9.253 24.991l1.297-9.082Zm.702-8.919L4.963 13.91h7.893l-.703 4.918 6.289-6.918H10.55l.702-4.918Z"
                            />
                          </svg>
                        </div>
                      </Transition>
                      <Transition
                        as="div"
                        show={tab === 2}
                        className={`data-closed:absolute data-enter:data-closed:-rotate-[60deg] data-leave:data-closed:rotate-[60deg] data-closed:opacity-0 transform transition duration-700 ease-[cubic-bezier(0.68,-0.3,0.32,1)]`}
                        unmount={false}
                        appear={true}
                      >
                        <div className="relative flex h-16 w-16 -rotate-[14deg] items-center justify-center rounded-2xl border border-transparent shadow-2xl [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box] before:absolute before:inset-0 before:rounded-2xl before:bg-slate-800/30">
                          <svg
                            className="relative fill-slate-200"
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                          >
                            <path d="M18 14h-2V8h2c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4v2H8V4c0-2.2-1.8-4-4-4S0 1.8 0 4s1.8 4 4 4h2v6H4c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4v-2h6v2c0 2.2 1.8 4 4 4s4-1.8 4-4-1.8-4-4-4ZM16 4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2h-2V4ZM2 4c0-1.1.9-2 2-2s2 .9 2 2v2H4c-1.1 0-2-.9-2-2Zm4 14c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2h2v2ZM8 8h6v6H8V8Zm10 12c-1.1 0-2-.9-2-2v-2h2c1.1 0 2 .9 2 2s-.9 2-2 2Z" />
                          </svg>
                        </div>
                      </Transition>
                      <Transition
                        as="div"
                        show={tab === 3}
                        className={`data-closed:absolute data-enter:data-closed:-rotate-[60deg] data-leave:data-closed:rotate-[60deg] data-closed:opacity-0 transform transition duration-700 ease-[cubic-bezier(0.68,-0.3,0.32,1)]`}
                        unmount={false}
                        appear={true}
                      >
                        <div className="relative flex h-16 w-16 -rotate-[14deg] items-center justify-center rounded-2xl border border-transparent shadow-2xl [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box] before:absolute before:inset-0 before:rounded-2xl before:bg-slate-800/30">
                          <svg
                            className="relative fill-slate-200"
                            xmlns="http://www.w3.org/2000/svg"
                            width="26"
                            height="14"
                          >
                            <path
                              fillRule="nonzero"
                              d="m10 5.414-8 8L.586 12 10 2.586l6 6 8-8L25.414 2 16 11.414z"
                            />
                          </svg>
                        </div>
                      </Transition>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
