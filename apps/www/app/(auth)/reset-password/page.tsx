export const metadata = {
  title: 'Reset Password - Stellar',
  description: 'Page description',
}

import AuthLogo from '../auth-logo'

export default function ResetPassword() {
  return (
    <>
      {/* Page header */}
      <div className="mx-auto max-w-3xl pb-12 text-center">
        {/* Logo */}
        <AuthLogo />
        {/* Page title */}
        <h1 className="h2 bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 bg-clip-text text-transparent">
          Reset your password
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
          </div>
          <div className="mt-6">
            <button className="btn shadow-xs group w-full bg-purple-500 text-sm text-white hover:bg-purple-600">
              Reset Password{' '}
              <span className="ml-1 tracking-normal text-purple-300 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                -&gt;
              </span>
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
