import Logo from '@/public/images/logo.svg'
import Image from 'next/image'
import Link from 'next/link'

export default function AuthLogo() {
  return (
    <div className="mb-5">
      <Link className="inline-flex" href="/">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-transparent shadow-2xl [background:linear-gradient(var(--color-slate-900),var(--color-slate-900))_padding-box,conic-gradient(var(--color-slate-400),var(--color-slate-700)_25%,var(--color-slate-700)_75%,var(--color-slate-400)_100%)_border-box] before:absolute before:inset-0 before:rounded-2xl before:bg-slate-800/30">
          <Image
            className="relative"
            src={Logo}
            width={42}
            height={42}
            alt="Stellar"
          />
        </div>
      </Link>
    </div>
  )
}
