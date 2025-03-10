'use server';

import { InstitutionsSchema } from '@solomon-ai/financial-engine-sdk/resources/institutions';
import { authActionClient } from '../safe-action';
import { engine } from '@/lib/engine';
import { getInstitutionsSchema } from './schema';

/**
 * @typedef {Object} GetAccountParams
 * @property {string} countryCode - ISO country code to filter institutions by
 *   country (e.g., 'US', 'GB')
 * @property {string} [query] - Optional search query to filter institutions by
 *   name or other attributes
 * @institution
 *
 * Parameters for retrieving financial institutions.
 */
type GetAccountParams = {
  countryCode: string;
  query?: string;
};

/**
 * @example
 *   // Get all US institutions
 *   const usInstitutions = await getInstitutions({ countryCode: 'US' });
 *
 *   // Search for institutions with "Chase" in the name
 *   const chaseInstitutions = await getInstitutions({
 *     countryCode: 'US',
 *     query: 'Chase',
 *   });
 *
 * @function getInstitutions
 * @param {GetAccountParams} params - Parameters for filtering the institutions
 * @param {string} params.countryCode - ISO country code to filter institutions
 *   by country
 * @param {string} [params.query] - Optional search query to filter institutions
 *   by name
 * @returns {Promise<InstitutionsSchema>} A promise that resolves to an object
 *   containing an array of institution data in the `data` property
 * @throws {Error} Errors are caught and logged, returning an empty data array
 *   in case of failure
 * @institution
 *
 * Retrieves a list of financial institutions based on country code and optional search query.
 *
 * This server function fetches available financial institutions that can be connected to the
 * user's account. The results can be filtered by country code and an optional search query
 * to help users find specific institutions.
 */
export const getInstitutionsAction = authActionClient
  .schema(getInstitutionsSchema)
  .action(async ({ parsedInput: { countryCode, query } }) => {
    try {
      return engine.institutions.list({
        countryCode: countryCode as any,
        q: query,
      });
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      return { data: [] };
    }
  });
