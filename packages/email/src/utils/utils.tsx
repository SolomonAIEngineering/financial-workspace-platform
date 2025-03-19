/**
 * Get a pretty URL from a given URL
 * @param url - The URL to get the pretty URL from
 * @returns The pretty URL
 */
export const getPrettyUrl = (url?: string | null) => {
  if (!url) return ''
  // remove protocol (http/https) and www.
  // also remove trailing slash
  return url
    .replace(/(^\w+:|^)\/\//, '')
    .replace('www.', '')
    .replace(/\/$/, '')
}
