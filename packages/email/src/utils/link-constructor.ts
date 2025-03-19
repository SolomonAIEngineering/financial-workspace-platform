import punycode from 'punycode'

export function linkConstructor({
  domain,
  key,
  pretty,
  searchParams,
}: {
  domain?: string
  key?: string
  pretty?: boolean
  searchParams?: Record<string, string>
}) {
  if (!domain) {
    return ''
  }

  let url = `https://${punycode.toASCII(domain)}${key && key !== '_root' ? `/${punycode.toASCII(key)}` : ''}`

  if (searchParams) {
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      search.set(key, value)
    }
    url += `?${search.toString()}`
  }

  return pretty ? url.replace(/^https?:\/\//, '') : url
}

export function linkConstructorSimple({
  domain,
  key,
}: {
  domain: string
  key: string
}) {
  return `https://${domain}${key === '_root' ? '' : `/${key}`}`
}
