export const metadata = {
  title: 'Sign In - Stellar',
  description: 'Page description',
}

import Link from 'next/link'
import AuthLogo from '../auth-logo'

export default function SignIn() {
  return (
    <>
      {/* Page header */}
      <div className="mx-auto max-w-3xl pb-12 text-center">
        {/* Logo */}
        <AuthLogo />
        {/* Page title */}
        <h1 className="h2 bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text text-transparent">
          Sign in to your account
        </h1>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-sm">
        <form>
          <div className="space-y-4">
            <div>
              <label
                className="mb-1 block text-sm font-medium text-slate-300"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                className="form-input w-full"
                type="email"
                required
              />
            </div>
            <div>
              <div className="flex justify-between">
                <label
                  className="mb-1 block text-sm font-medium text-slate-300"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  className="ml-2 text-sm font-medium text-purple-500 transition duration-150 ease-in-out hover:text-purple-400"
                  href="/reset-password"
                >
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                className="form-input w-full"
                type="password"
                autoComplete="on"
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <button className="btn shadow-xs group w-full bg-purple-500 text-sm text-white hover:bg-purple-600">
              Sign In{' '}
              <span className="ml-1 tracking-normal text-purple-300 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                -&gt;
              </span>
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <div className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link
              className="font-medium text-purple-500 transition duration-150 ease-in-out hover:text-purple-400"
              href="/signup"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div
            className="mr-3 grow border-t border-slate-800"
            aria-hidden="true"
          />
          <div className="text-sm italic text-slate-500">or</div>
          <div
            className="ml-3 grow border-t border-slate-800"
            aria-hidden="true"
          />
        </div>

        {/* Social login */}
        <div className="flex space-x-3">
          <button className="btn group relative h-9 w-full text-slate-300 transition duration-150 ease-in-out [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box] before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-slate-800/30 hover:text-white">
            <span className="relative">
              <span className="sr-only">Continue with Twitter</span>
              <svg
                className="fill-current"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="12"
              >
                <path d="m4.34 0 2.995 3.836L10.801 0h2.103L8.311 5.084 13.714 12H9.482L6.169 7.806 2.375 12H.271l4.915-5.436L0 0h4.34Zm-.635 1.155H2.457l7.607 9.627h1.165L3.705 1.155Z" />
              </svg>
            </span>
          </button>
          <button className="btn group relative h-9 w-full text-slate-300 transition duration-150 ease-in-out [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box] before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-slate-800/30 hover:text-white">
            <span className="relative">
              <span className="sr-only">Continue with GitHub</span>
              <svg
                className="fill-current"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="15"
              >
                <path d="M7.488 0C3.37 0 0 3.37 0 7.488c0 3.276 2.153 6.084 5.148 7.113.374.094.468-.187.468-.374v-1.31c-2.06.467-2.527-.936-2.527-.936-.375-.843-.843-1.124-.843-1.124-.655-.468.094-.468.094-.468.749.094 1.123.75 1.123.75.655 1.216 1.778.842 2.153.654.093-.468.28-.842.468-1.03-1.685-.186-3.37-.842-3.37-3.743 0-.843.281-1.498.75-1.966-.094-.187-.375-.936.093-1.965 0 0 .655-.187 2.059.749a6.035 6.035 0 0 1 1.872-.281c.655 0 1.31.093 1.872.28 1.404-.935 2.059-.748 2.059-.748.374 1.03.187 1.778.094 1.965.468.562.748 1.217.748 1.966 0 2.901-1.778 3.463-3.463 3.65.281.375.562.843.562 1.498v2.059c0 .187.093.468.561.374 2.996-1.03 5.148-3.837 5.148-7.113C14.976 3.37 11.606 0 7.488 0Z" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </>
  )
}
