'use client'

import { useState } from 'react'

export default function Pricing() {
  const [annual, setAnnual] = useState<boolean>(true)

  return (
    <div className="relative">
      {/* Blurred shape */}
      <div
        className="pointer-events-none absolute bottom-0 left-2/3 -mb-20 -translate-x-1/2 opacity-70 blur-2xl max-md:hidden"
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
            d="m661 736 461 369-284 58z"
            transform="matrix(1 0 0 -1 -661 1163)"
          />
        </svg>
      </div>
      {/* Content */}
      <div className="grid text-sm md:grid-cols-4 xl:-mx-6 [&>div:nth-last-of-type(-n+4)]:pb-6 max-md:[&>div:nth-last-of-type(-n+4)]:mb-8 max-md:[&>div:nth-last-of-type(-n+4)]:rounded-b-3xl md:[&>div:nth-last-of-type(1)]:rounded-br-3xl [&>div:nth-last-of-type(2)]:before:border-b-2 md:[&>div:nth-last-of-type(3)]:rounded-bl-3xl max-md:[&>div:nth-of-type(-n+4):nth-of-type(n+1)]:rounded-t-3xl [&>div:nth-of-type(-n+4)]:py-6 md:[&>div:nth-of-type(2)]:rounded-tl-3xl [&>div:nth-of-type(3)]:before:border-t-2 md:[&>div:nth-of-type(4)]:rounded-tr-3xl [&>div:nth-of-type(4n+1)]:bg-transparent max-md:[&>div:nth-of-type(4n+2)]:order-1 [&>div:nth-of-type(4n+3)]:relative [&>div:nth-of-type(4n+3)]:before:pointer-events-none [&>div:nth-of-type(4n+3)]:before:absolute [&>div:nth-of-type(4n+3)]:before:-inset-px [&>div:nth-of-type(4n+3)]:before:-z-10 [&>div:nth-of-type(4n+3)]:before:rounded-[inherit] [&>div:nth-of-type(4n+3)]:before:border-x-2 [&>div:nth-of-type(4n+3)]:before:border-purple-500 max-md:[&>div:nth-of-type(4n+3)]:order-2 max-md:[&>div:nth-of-type(4n+4)]:order-3 max-md:[&>div:nth-of-type(4n+5)]:hidden max-md:md:[&>div:nth-of-type(n)]:mb-0 [&>div]:bg-slate-700/20">
        {/* Pricing toggle */}
        <div className="flex flex-col justify-end px-6">
          <div className="border-slate-800 pb-5 md:border-b">
            {/* Toggle switch */}
            <div className="max-md:text-center">
              <div className="inline-flex items-center whitespace-nowrap">
                <div className="mr-2 text-sm font-medium text-slate-500 md:max-lg:hidden">
                  Monthly
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    id="toggle"
                    className="peer sr-only"
                    checked={annual}
                    onChange={() => setAnnual(!annual)}
                  />
                  <label
                    htmlFor="toggle"
                    className="before:shadow-xs relative flex h-6 w-11 cursor-pointer items-center rounded-full bg-slate-400 px-0.5 outline-slate-400 transition-colors before:h-5 before:w-5 before:rounded-full before:bg-white before:transition-transform before:duration-150 peer-checked:bg-purple-500 peer-checked:before:translate-x-full peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-400 peer-focus-visible:peer-checked:outline-purple-500"
                  >
                    <span className="sr-only">Pay Yearly</span>
                  </label>
                </div>
                <div className="ml-2 text-sm font-medium text-slate-500">
                  Yearly <span className="text-teal-500">(-20%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Pro price */}
        <div className="flex flex-col justify-end px-6">
          <div className="mb-4 grow border-b border-slate-800 pb-4">
            <div className="bg-linear-to-r from-purple-500 to-purple-200 bg-clip-text pb-0.5 text-base font-medium text-transparent">
              Pro
            </div>
            <div className="mb-1">
              <span className="text-lg font-medium text-slate-500">$</span>
              <span className="text-3xl font-bold text-slate-50">
                {annual ? '24' : '29'}
              </span>
              <span className="text-sm font-medium text-slate-600">/mo</span>
            </div>
            <div className="text-slate-500">Everything at your fingertips.</div>
          </div>
          <div className="border-b border-slate-800 pb-4">
            <a
              className="btn-sm bg-linear-to-r group w-full from-white/80 via-white to-white/80 text-slate-900 transition duration-150 ease-in-out hover:bg-white"
              href="#0"
            >
              Get Started{' '}
              <span className="ml-1 tracking-normal text-purple-500 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                -&gt;
              </span>
            </a>
          </div>
        </div>
        {/* Team price */}
        <div className="flex flex-col justify-end px-6">
          <div className="mb-4 grow border-b border-slate-800 pb-4">
            <div className="bg-linear-to-r from-purple-500 to-purple-200 bg-clip-text pb-0.5 text-base font-medium text-transparent">
              Team
            </div>
            <div className="mb-1">
              <span className="text-lg font-medium text-slate-500">$</span>
              <span className="text-3xl font-bold text-slate-50">
                {annual ? '49' : '54'}
              </span>
              <span className="text-sm font-medium text-slate-600">/mo</span>
            </div>
            <div className="text-slate-500">Everything at your fingertips.</div>
          </div>
          <div className="border-b border-slate-800 pb-4">
            <a
              className="btn-sm group w-full bg-purple-500 text-white transition duration-150 ease-in-out hover:bg-purple-600"
              href="#0"
            >
              Get Started{' '}
              <span className="ml-1 tracking-normal text-purple-300 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                -&gt;
              </span>
            </a>
          </div>
        </div>
        {/* Enterprise price */}
        <div className="flex flex-col justify-end px-6">
          <div className="mb-4 grow border-b border-slate-800 pb-4">
            <div className="bg-linear-to-r from-purple-500 to-purple-200 bg-clip-text pb-0.5 text-base font-medium text-transparent">
              Enterprise
            </div>
            <div className="mb-1">
              <span className="text-lg font-medium text-slate-500">$</span>
              <span className="text-3xl font-bold text-slate-50">
                {annual ? '79' : '85'}
              </span>
              <span className="text-sm font-medium text-slate-600">/mo</span>
            </div>
            <div className="text-slate-500">Everything at your fingertips.</div>
          </div>
          <div className="border-b border-slate-800 pb-4">
            <a
              className="btn-sm bg-linear-to-r group w-full from-white/80 via-white to-white/80 text-slate-900 transition duration-150 ease-in-out hover:bg-white"
              href="#0"
            >
              Get Started{' '}
              <span className="ml-1 tracking-normal text-purple-500 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                -&gt;
              </span>
            </a>
          </div>
        </div>
        {/* # Usage */}
        <div className="flex flex-col justify-end px-6">
          <div className="mt-4 py-2 font-medium text-slate-50">Usage</div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="mt-4 py-2 font-medium text-slate-50 md:hidden">
            Usage
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="mt-4 py-2 font-medium text-slate-50 md:hidden">
            Usage
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="mt-4 py-2 font-medium text-slate-50 md:hidden">
            Usage
          </div>
        </div>
        {/* Social Connections */}
        <div className="flex flex-col justify-end px-6">
          <div className="border-b border-slate-800 py-2 text-slate-400">
            Social Connections
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              100 <span className="md:hidden">Social Connections</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              250 <span className="md:hidden">Social Connections</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              Unlimited <span className="md:hidden">Social Connections</span>
            </span>
          </div>
        </div>
        {/* Custom Domains */}
        <div className="flex flex-col justify-end px-6">
          <div className="border-b border-slate-800 py-2 text-slate-400">
            Custom Domains
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              4 <span className="md:hidden">Custom Domains</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              Unlimited <span className="md:hidden">Custom Domains</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              Unlimited <span className="md:hidden">Custom Domains</span>
            </span>
          </div>
        </div>
        {/* User Role Management */}
        <div className="flex flex-col justify-end px-6">
          <div className="border-b border-slate-800 py-2 text-slate-400">
            User Role Management
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              Unlimited <span className="md:hidden">User Role Management</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              Unlimited <span className="md:hidden">User Role Management</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              Unlimited <span className="md:hidden">User Role Management</span>
            </span>
          </div>
        </div>
        {/* External Databases */}
        <div className="flex flex-col justify-end px-6">
          <div className="border-b border-slate-800 py-2 text-slate-400">
            External Databases
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              1 <span className="md:hidden">External Databases</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              5 <span className="md:hidden">External Databases</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              Unlimited <span className="md:hidden">External Databases</span>
            </span>
          </div>
        </div>
        {/* # Features */}
        <div className="flex flex-col justify-end px-6">
          <div className="mt-4 py-2 font-medium text-slate-50">Features</div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="mt-4 py-2 font-medium text-slate-50 md:hidden">
            Features
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="mt-4 py-2 font-medium text-slate-50 md:hidden">
            Features
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="mt-4 py-2 font-medium text-slate-50 md:hidden">
            Features
          </div>
        </div>
        {/* Custom Connection */}
        <div className="flex flex-col justify-end px-6">
          <div className="border-b border-slate-800 py-2 text-slate-400">
            Custom Connection
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              <span className="md:hidden">Custom Connection</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              <span className="md:hidden">Custom Connection</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              <span className="md:hidden">Custom Connection</span>
            </span>
          </div>
        </div>
        {/* Advanced Deployment Options */}
        <div className="flex flex-col justify-end px-6">
          <div className="border-b border-slate-800 py-2 text-slate-400">
            Advanced Deployment Options
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              <span className="md:hidden">Advanced Deployment Options</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              <span className="md:hidden">Advanced Deployment Options</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              <span className="md:hidden">Advanced Deployment Options</span>
            </span>
          </div>
        </div>
        {/* Extra Add-ons */}
        <div className="flex flex-col justify-end px-6">
          <div className="border-b border-slate-800 py-2 text-slate-400">
            Extra Add-ons
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              <span className="md:hidden">Extra Add-ons</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              <span className="md:hidden">Extra Add-ons</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              <span className="md:hidden">Extra Add-ons</span>
            </span>
          </div>
        </div>
        {/* Admin Roles */}
        <div className="flex flex-col justify-end px-6">
          <div className="border-b border-slate-800 py-2 text-slate-400">
            Admin Roles
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex items-center border-b border-slate-800 py-2 text-slate-400 max-md:hidden">
            <span>
              <span className="md:hidden">Admin Roles</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex items-center border-b border-slate-800 py-2 text-slate-400 max-md:hidden">
            <span>
              <span className="md:hidden">Admin Roles</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              <span className="md:hidden">Admin Roles</span>
            </span>
          </div>
        </div>
        {/* Deploy and Monitor */}
        <div className="flex flex-col justify-end px-6">
          <div className="border-b border-slate-800 py-2 text-slate-400">
            Deploy and Monitor
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex items-center border-b border-slate-800 py-2 text-slate-400 max-md:hidden">
            <span>
              <span className="md:hidden">Deploy and Monitor</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex items-center border-b border-slate-800 py-2 text-slate-400 max-md:hidden">
            <span>
              <span className="md:hidden">Deploy and Monitor</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              <span className="md:hidden">Deploy and Monitor</span>
            </span>
          </div>
        </div>
        {/* Enterprise Add-ons */}
        <div className="flex flex-col justify-end px-6">
          <div className="border-b border-slate-800 py-2 text-slate-400">
            Enterprise Add-ons
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex items-center border-b border-slate-800 py-2 text-slate-400 max-md:hidden">
            <span>
              <span className="md:hidden">Enterprise Add-ons</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex items-center border-b border-slate-800 py-2 text-slate-400 max-md:hidden">
            <span>
              <span className="md:hidden">Enterprise Add-ons</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              <span className="md:hidden">Enterprise Add-ons</span>
            </span>
          </div>
        </div>
        {/* # Support */}
        <div className="flex flex-col justify-end px-6">
          <div className="mt-4 py-2 font-medium text-slate-50">Support</div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="mt-4 hidden py-2 font-medium text-slate-50">
            Support
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="mt-4 py-2 font-medium text-slate-50 md:hidden">
            Support
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="mt-4 py-2 font-medium text-slate-50 md:hidden">
            Support
          </div>
        </div>
        {/* Premium Support */}
        <div className="flex flex-col justify-end px-6">
          <div className="border-b border-slate-800 py-2 text-slate-400">
            Premium Support
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex items-center border-b border-slate-800 py-2 text-slate-400 max-md:hidden">
            <span>
              <span className="md:hidden">Premium Support</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              <span className="md:hidden">Premium Support</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end px-6">
          <div className="flex h-full items-center border-b border-slate-800 py-2 text-slate-400">
            <svg
              className="mr-3 shrink-0 fill-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="9"
            >
              <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
            </svg>
            <span>
              <span className="md:hidden">Premium Support</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
