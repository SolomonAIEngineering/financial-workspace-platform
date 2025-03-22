import Illustration from '@/public/images/auth-illustration.svg'
import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="grow">
      <section className="relative">
        {/* Illustration */}
        <div
          className="pointer-events-none absolute left-1/2 -z-10 -mt-36 -translate-x-1/2 opacity-70 blur-2xl md:block"
          aria-hidden="true"
        >
          <Image
            src={Illustration}
            className="max-w-none"
            width={1440}
            height={450}
            priority
            alt="Page Illustration"
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="pb-12 pt-32 md:pb-20 md:pt-40">{children}</div>
        </div>
      </section>
    </main>
  )
}
