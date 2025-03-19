type Props = {
  customerName?: string
  logoUrl?: string
  isValidLogo: boolean
}

export function Avatar({ logoUrl, isValidLogo, customerName }: Props) {
  if (isValidLogo) {
    return (
      <img
        src={logoUrl}
        alt="Avatar"
        className="h-10 w-10 overflow-hidden rounded-full border-[0.5px] border-[#2D2D2D]"
      />
    )
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border-[0.5px] border-[#2D2D2D] bg-[#1C1C1C] text-[#F2F2F2]">
      {customerName?.[0]}
    </div>
  )
}
