export const metadata = {
  title: 'Customer Post - Stellar',
  description: 'Page description',
}

import Particles from '@/components/particles'
import CustomerBadge from '@/public/images/customer-badge.svg'
import Illustration from '@/public/images/page-illustration.svg'
import Image from 'next/image'
import Link from 'next/link'
import RelatedPosts from './related-posts'

export default function CustomerSingle() {
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
        <div className="border-b pt-32 [border-image:linear-gradient(to_right,transparent,var(--color-slate-800),transparent)1] md:pt-40">
          <div className="md:flex md:justify-between">
            {/* Page content */}
            <div className="pb-12 md:grow md:pb-20">
              <div className="max-w-3xl">
                <article className="mb-12 border-b pb-12 [border-image:linear-gradient(to_right,transparent,var(--color-slate-800),transparent)1]">
                  <div className="mb-4">
                    <Link
                      className="group inline-flex text-sm font-medium text-purple-500"
                      href="/customers"
                    >
                      <span className="mr-1 tracking-normal transition-transform duration-150 ease-in-out group-hover:-translate-x-0.5">
                        &lt;-
                      </span>{' '}
                      Go Back
                    </Link>
                  </div>

                  <header>
                    <h1 className="h2 bg-linear-to-r inline-flex from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-4 text-transparent">
                      How Airbnb leverages Stellar X to onboard new hosts
                    </h1>
                    <div className="mb-8 flex items-center space-x-4 text-sm">
                      <img
                        className="rounded-full"
                        src="../images/customer-avatar-03.jpg"
                        width="32"
                        height="32"
                        alt="Customer Avatar 03"
                      />
                      <div>
                        <div className="font-medium text-slate-300">
                          Becky Taylor
                        </div>
                        <div className="text-slate-500">
                          Product Marketing Manager
                        </div>
                      </div>
                    </div>
                  </header>

                  {/* Post content */}
                  <div className="prose prose-headings:text-slate-50 prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:leading-relaxed prose-a:text-purple-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-50 prose-strong:font-medium prose-blockquote:pl-5 prose-blockquote:xl:-ml-5 prose-blockquote:border-l-2 prose-blockquote:border-purple-500 prose-blockquote:font-medium prose-blockquote:text-slate-300 prose-blockquote:italic max-w-none text-slate-400">
                    <p>
                      <a href="#0">Airbnb</a> is an American San Francisco-based
                      company operating an online marketplace for short- and
                      long-term homestays and experiences. The company acts as a
                      broker and charges a commission from each booking. The
                      company was founded in 2008 by Brian Chesky, Nathan
                      Blecharczyk, and Joe Gebbia. Airbnb is a shortened version
                      of its original name, AirBedandBreakfast.com. Airbnb is
                      the most well-known company for short-term housing
                      rentals.
                    </p>
                    <p>
                      Regulation of{' '}
                      <strong>
                        short-term rentals can include requirements for hosts to
                        have business licenses
                      </strong>
                      , payment of hotel taxes and compliance with building,
                      city and zoning standards. The hotel industry has lobbied
                      for stricter regulations on short-term home rental and in
                      addition to government-imposed restrictions, many
                      homeowner associations also limit short term rentals.
                    </p>
                    <h2>Why do Airbnb need web governance policies?</h2>
                    <p>Brian Chesky, Co-Founder and CEO at Airbnb:</p>
                    <p>
                      Through spending twenty years working with hots, Airbnb
                      reflected that a lack of governance policy is a systemic
                      issue with most short rentals. Without web governance,
                      hosts usually experience a lack of process and
                      accountability leading to:
                    </p>
                    <ul>
                      <li>
                        An organic sprawl of content, creating bloated websites
                      </li>
                      <li>Inconsistent, poorer quality content</li>
                      <li>
                        Weak user experience impacting the ability to support
                        digital goals
                      </li>
                    </ul>
                    <p>
                      When these problems become acute enough, large website
                      redesign projects begin. But{' '}
                      <strong>
                        without governance being put in place at the same time,
                        the same problem will only happen again
                      </strong>
                      . Airbnb mitigate this risk by baking web governance into
                      their working process with clients from strategy through
                      to site launch and beyond.
                    </p>
                    <h2>Good governance leads to stronger results</h2>
                    <p>
                      With a strong process for content governance, the benefits
                      are clear for both Airbnb as a company and their clients.
                      Since its founding in 2008, Airbnb has become one of the
                      most successful and valuable start-ups in the world, and
                      has had a significant impact on the industry of renting
                      homes and the hospitality industry more generally.
                    </p>
                    <blockquote>
                      <p>
                        “With a strong process for content governance, the
                        benefits are clear for both Airbnb as a company and
                        their clients. Since its founding in 2008, Airbnb has
                        become one of the most successful and valuable start-ups
                        in the world, and has had a significant impact on the
                        industry of renting homes and the hospitality industry
                        more generally.
                      </p>
                    </blockquote>
                    <p>
                      Airbnb has also had a significant impact on the
                      hospitality industry, particularly in the area of hotels
                      and other traditional accommodation providers, which are
                      often referred to as the HORECA industry. Some industry
                      experts believe that Airbnb's rapid growth has disrupted
                      the traditional HORECA model, and has led to a decline in
                      revenue and occupancy rates for traditional hotels in
                      certain markets.
                    </p>
                    <h2>How do you get organisation wide buy-in?</h2>
                    <p>
                      Mike reflected that the optimum time to introduce a web
                      governance policy is during a website relaunch project
                      because of the collective energy focused on creating a
                      better user experience. Voltaire recommends starting
                      governance policy in line with strategy kick-off.
                    </p>
                  </div>
                </article>

                <RelatedPosts />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="pb-12 md:w-64 md:shrink-0 md:pb-20 md:pt-[3.75rem] lg:w-80 lg:pt-0">
              <div className="sticky top-6 md:pl-6 lg:pl-10">
                {/* Sidebar content */}
                <div className="space-y-6">
                  {/* Widget */}
                  <div className="bg-linear-to-tr rounded-3xl border border-slate-800 from-slate-800 to-slate-800/25">
                    <div className="px-5 py-6">
                      <div className="mb-5">
                        <div className="flex items-center space-x-4">
                          <Image
                            src={CustomerBadge}
                            width={64}
                            height={64}
                            alt="Customer badge"
                          />
                          <div className="text-lg font-semibold text-slate-100">
                            Airbnb Inc.
                          </div>
                        </div>
                      </div>
                      <ul className="text-sm">
                        <li className="flex items-center justify-between space-x-2 border-t py-3 [border-image:linear-gradient(to_right,--theme(--color-slate-700/.3),--theme(--color-slate-700),--theme(--color-slate-700/.3))1]">
                          <span className="text-slate-400">Location</span>
                          <span className="font-medium text-slate-300">
                            San Francisco
                          </span>
                        </li>
                        <li className="flex items-center justify-between space-x-2 border-t py-3 [border-image:linear-gradient(to_right,--theme(--color-slate-700/.3),--theme(--color-slate-700),--theme(--color-slate-700/.3))1]">
                          <span className="text-slate-400">Website</span>
                          <a
                            className="flex items-center space-x-1 font-medium text-purple-500"
                            href="#0"
                          >
                            <span>airbnb.com</span>
                            <svg
                              className="fill-current"
                              xmlns="http://www.w3.org/2000/svg"
                              width="9"
                              height="9"
                            >
                              <path d="m1.285 8.514-.909-.915 5.513-5.523H1.663l.01-1.258h6.389v6.394H6.794l.01-4.226z" />
                            </svg>
                          </a>
                        </li>
                        <li className="flex items-center justify-between space-x-2 border-t py-3 [border-image:linear-gradient(to_right,--theme(--color-slate-700/.3),--theme(--color-slate-700),--theme(--color-slate-700/.3))1]">
                          <span className="text-slate-400">Industry</span>
                          <span className="font-medium text-slate-300">
                            Hospitality
                          </span>
                        </li>
                        <li className="flex items-center justify-between space-x-2 border-t py-3 [border-image:linear-gradient(to_right,--theme(--color-slate-700/.3),--theme(--color-slate-700),--theme(--color-slate-700/.3))1]">
                          <span className="text-slate-400">Product</span>
                          <span className="font-medium text-slate-300">
                            Stellar X
                          </span>
                        </li>
                        <li className="flex items-center justify-between space-x-2 border-t py-3 [border-image:linear-gradient(to_right,--theme(--color-slate-700/.3),--theme(--color-slate-700),--theme(--color-slate-700/.3))1]">
                          <span className="text-slate-400">Impact</span>
                          <span className="font-medium text-slate-300">
                            +7% new hosts
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
