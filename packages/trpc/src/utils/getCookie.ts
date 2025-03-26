import { z } from "zod";

/**
 * Zod schema for validating request cookie objects
 * @example
 * ```ts
 * const cookie = RequestCookieSchema.parse({ name: "session", value: "abc123" });
 * ```
 */
export const RequestCookieSchema = z.object({
  name: z.string(),
  value: z.string(),
});

/**
 * Type definition for a request cookie object
 * @property {string} name - The name of the cookie
 * @property {string} value - The value of the cookie
 */
export type RequestCookie = z.infer<typeof RequestCookieSchema>;

/**
 * Retrieves a cookie value by name from an array of cookies
 * @param {RequestCookie[] | undefined} cookies - Array of cookie objects to search through
 * @param {string} name - Name of the cookie to find
 * @returns {string | undefined} The cookie value if found, undefined otherwise
 * @example
 * ```ts
 * const cookies = [{ name: "session", value: "abc123" }];
 * const value = getCookie(cookies, "session"); // "abc123"
 * ```
 */
export const getCookie = (
  cookies: RequestCookie[] | undefined,
  name: string
) => {
  return cookies?.find((cookie) => cookie.name === name)?.value;
};

/**
 * Retrieves a cookie value by name and converts it to a number
 * @param {RequestCookie[] | undefined} cookies - Array of cookie objects to search through
 * @param {string} name - Name of the cookie to find
 * @returns {number | undefined} The cookie value as a number if found and valid, undefined otherwise
 * @example
 * ```ts
 * const cookies = [{ name: "count", value: "42" }];
 * const value = getCookieNumber(cookies, "count"); // 42
 * ```
 */
export const getCookieNumber = (
  cookies: RequestCookie[] | undefined,
  name: string
) => {
  const cookie = getCookie(cookies, name);

  if (!cookie) return;

  return Number.parseInt(cookie);
};
