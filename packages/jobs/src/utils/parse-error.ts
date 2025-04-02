/**
 * Parses an unknown error object to extract standardized error information
 * 
 * This utility function attempts to extract structured error information from 
 * API error responses. If the error follows the expected format with an "error" 
 * property containing "code" and "message", it returns those values. Otherwise,
 * it returns a default error object.
 *
 * @param {unknown} error - The error object to parse, typically from a caught exception
 * @returns {{code: string, message: string}} A standardized error object with code and message
 *
 * @example
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const { code, message } = parseAPIError(error);
 *   console.error(`Error ${code}: ${message}`);
 * }
 */
export function parseAPIError(error: unknown) {
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const apiError = error as { error: { code: string; message: string } };

    return {
      code: apiError.error.code,
      message: apiError.error.message,
    };
  }

  return { code: 'unknown', message: 'An unknown error occurred' };
}
