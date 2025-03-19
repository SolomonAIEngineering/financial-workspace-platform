export function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const randomBytesArray = new Uint8Array(length)

  // Use browser crypto API (works in both Node.js and browsers)
  if (typeof window === 'undefined') {
    // Node.js environment
    const { randomBytes } = require('crypto')
    const bytes = randomBytes(length)
    randomBytesArray.set(bytes)
  } else {
    // Browser environment
    crypto.getRandomValues(randomBytesArray)
  }

  let result = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytesArray[i] % charset.length
    result += charset[randomIndex]
  }

  return result
}
