import { headers } from 'next/headers'

import countries from './countries.json'
import flags from './country-flag'
import { EU_COUNTRY_CODES } from './eu-countries'
import timezones from './timezones.json'

/**
 * Retrieves the country code from the request headers.
 * Uses Vercel's built-in geo-location headers.
 *
 * @returns {Promise<string>} Two-letter ISO country code (e.g., "US", "DE", "GB")
 * @default "US" - Returns "US" if the header is not present
 */
export async function getCountryCode() {
  return (await headers()).get('x-vercel-ip-country') || 'US'
}

/**
 * Retrieves the timezone from the request headers.
 * Uses Vercel's built-in geo-location headers.
 *
 * @returns {Promise<string>} IANA timezone identifier (e.g., "Europe/Berlin", "America/New_York")
 * @default "Europe/Berlin" - Returns "Europe/Berlin" if the header is not present
 */
export async function getTimezone() {
  return (await headers()).get('x-vercel-ip-timezone') || 'Europe/Berlin'
}

/**
 * Returns all available IANA timezones.
 *
 * @returns {Record<string, string[]>} Object containing timezone information
 */
export function getTimezones() {
  return timezones
}

/**
 * Retrieves detailed information about the current country based on the IP.
 *
 * @returns {Promise<Object>} Country information
 * @property {string | undefined} currencyCode - The three-letter currency code (e.g., "USD", "EUR")
 * @property {Object | undefined} currency - Currency information including name and symbol
 * @property {string | undefined} languages - Comma-separated list of languages spoken in the country
 */
export async function getCountryInfo() {
  const country = await getCountryCode()

  const countryInfo = countries.find((x) => x.cca2 === country)

  const currencyCode =
    countryInfo?.currencies && Object.keys(countryInfo.currencies)[0]
  const currency =
    currencyCode &&
      countryInfo?.currencies &&
      currencyCode in countryInfo.currencies
      ? countryInfo.currencies[
      currencyCode as keyof typeof countryInfo.currencies
      ]
      : undefined
  const languages =
    countryInfo && Object.values(countryInfo.languages).join(', ')

  return {
    currencyCode,
    currency,
    languages,
  }
}

/**
 * Checks if the current IP address is from a European Union country.
 *
 * @returns {Promise<boolean>} True if the country code is in the EU_COUNTRY_CODES list
 */
export async function isEU() {
  const countryCode = (await headers()).get('x-vercel-ip-country')

  if (countryCode && EU_COUNTRY_CODES.includes(countryCode)) {
    return true
  }

  return false
}

/**
 * Gets the flag emoji for the current country.
 *
 * @returns {Promise<string>} Flag emoji for the country (e.g., "🇺🇸", "🇩🇪")
 */
export async function getCountry() {
  const country = await getCountryCode()

  return flags[country as keyof typeof flags]
}
