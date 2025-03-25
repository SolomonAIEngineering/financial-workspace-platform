export const metadata = {
  title: 'Integrations Post - Stellar',
  description: 'Page description',
}

import Particles from '@/components/particles'
import IntegrationImg from '@/public/images/integration-image.png'
import IntegrationIcon from '@/public/images/integrations-08.svg'
import Illustration from '@/public/images/page-illustration.svg'
import Avatar from '@/public/images/post-avatar.jpg'
import Star from '@/public/images/star.svg'
import Image from 'next/image'
import Link from 'next/link'

export default function IntegrationsSingle() {
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
        <div className="pt-32 md:pt-40">
          <div className="md:flex md:justify-between">
            {/* Page content */}
            <div className="pb-12 md:grow md:pb-20">
              <div className="max-w-[720px]">
                <div className="flex flex-col space-y-6 lg:flex-row lg:space-x-16 lg:space-y-0">
                  {/* Back button */}
                  <div className="shrink-0">
                    <div className="sticky top-6">
                      <Link
                        className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-transparent [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box] before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-slate-800/30"
                        href="/integrations"
                      >
                        <span className="sr-only">Go back</span>
                        <svg
                          className="h-4 w-4 fill-purple-500"
                          viewBox="0 0 16 16"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M6.7 14.7l1.4-1.4L3.8 9H16V7H3.8l4.3-4.3-1.4-1.4L0 8z" />
                        </svg>
                      </Link>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <article className="mb-12 border-b pb-12 [border-image:linear-gradient(to_right,transparent,var(--color-slate-800),transparent)1]">
                      <figure className="mb-8 rounded-3xl border border-slate-300/10 bg-slate-700/20 p-4">
                        <Image
                          className="w-full rounded-2xl"
                          src={IntegrationImg}
                          width={586}
                          height={316}
                          alt="Integration image"
                        />
                      </figure>

                      <h1 className="sr-only">GitHub</h1>

                      {/* Post content */}
                      <div className="prose prose-headings:text-slate-50 prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:leading-relaxed prose-a:text-purple-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-50 prose-strong:font-medium prose-blockquote:pl-5 prose-blockquote:xl:-ml-5 prose-blockquote:border-l-2 prose-blockquote:border-purple-500 prose-blockquote:font-medium prose-blockquote:text-slate-300 prose-blockquote:italic max-w-none text-slate-400">
                        <h2>Overview</h2>
                        <p>
                          This powerful GitHub integration keeps your work in
                          sync in both applications. It links features to Pull
                          Requests so that details update automatically from In
                          Progress to Done as the PR moves from drafted to
                          merged - there is no need to update the issue in
                          Stellar at all.
                        </p>
                        <p>
                          Move even faster by using a keyboard shortcut that
                          creates the issue's git branch name, assigns the issue
                          and moves the issue to In Progress in one step. This
                          integration supports{' '}
                          <a href="#0">GitHub Enterprise</a>.
                        </p>
                        <h2>How it works</h2>
                        <p>
                          Configure the GitHub integration{' '}
                          <strong className="font-medium text-slate-50">
                            in a couple of minutes
                          </strong>{' '}
                          by authenticating and selecting which repos to connect
                          to Stellar. Once you do, anyone in the workspace can
                          start linking PRs.
                        </p>
                        <p>
                          Link PRs to issues in a few ways. Use the issue ID in
                          the branch name or PR title before creating the PR. To
                          link multiple PRs, or link issues after creating the
                          PR, use magic words along with the issue ID in the PR
                          description.
                        </p>
                      </div>
                    </article>

                    <aside className="border-l-2 border-purple-500 pl-6">
                      <p className="bg-linear-to-r inline-flex from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text pb-4 text-lg font-medium italic text-transparent">
                        “ This integration is so perfect it tickles my brain. It
                        ensures that your work is in sync across your entire
                        team. ”
                      </p>
                      <footer className="flex items-center space-x-4">
                        <Image
                          className="shrink-0 rounded-full"
                          src={Avatar}
                          width={32}
                          height={32}
                          alt="Author"
                        />
                        <div className="text-sm font-medium text-slate-300">
                          Mike Hunt <span className="text-slate-700">-</span>{' '}
                          <a
                            className="text-purple-500 hover:underline"
                            href="#0"
                          >
                            Thunderbolt
                          </a>
                        </div>
                      </footer>
                    </aside>
                  </div>
                </div>
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
                      <div className="mb-5 text-center">
                        <div className="mb-4">
                          <div className="relative inline-flex">
                            <Image
                              src={IntegrationIcon}
                              width={80}
                              height={80}
                              alt="Icon 08"
                            />
                            <Image
                              className="absolute -right-1 top-0"
                              src={Star}
                              width={24}
                              height={24}
                              alt="Star"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                        <button className="btn-sm group relative text-slate-300 transition duration-150 ease-in-out [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box] before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-slate-800/70 hover:text-white">
                          <span className="relative inline-flex items-center">
                            Install Integration{' '}
                            <span className="ml-1 tracking-normal text-purple-500 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                              -&gt;
                            </span>
                          </span>
                        </button>
                      </div>
                      <ul className="text-sm">
                        <li className="flex items-center justify-between space-x-2 border-t py-3 [border-image:linear-gradient(to_right,--theme(--color-slate-700/.3),--theme(--color-slate-700),--theme(--color-slate-700/.3))1]">
                          <span className="text-slate-400">Company</span>
                          <span className="font-medium text-slate-300">
                            Github
                          </span>
                        </li>
                        <li className="flex items-center justify-between space-x-2 border-t py-3 [border-image:linear-gradient(to_right,--theme(--color-slate-700/.3),--theme(--color-slate-700),--theme(--color-slate-700/.3))1]">
                          <span className="text-slate-400">Website</span>
                          <a
                            className="flex items-center space-x-1 font-medium text-purple-500"
                            href="#0"
                          >
                            <span>github.com</span>
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
                            Technology
                          </span>
                        </li>
                        <li className="flex items-center justify-between space-x-2 border-t py-3 [border-image:linear-gradient(to_right,--theme(--color-slate-700/.3),--theme(--color-slate-700),--theme(--color-slate-700/.3))1]">
                          <span className="text-slate-400">Installs</span>
                          <span className="font-medium text-slate-300">
                            100K+
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
