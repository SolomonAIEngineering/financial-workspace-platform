import LogoImg from '@/public/images/logo.svg'
import Image from 'next/image'
import Link from 'next/link'

export default function Logo() {
  return (
    <Link className="inline-flex" href="/" aria-label="Cruip">
      <Image
        className="max-w-none"
        src={LogoImg}
        width={38}
        height={38}
        priority
        alt="Stellar"
      />
    </Link>
  )
}
