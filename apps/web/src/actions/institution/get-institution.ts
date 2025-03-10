'use server';

import { InstitutionsSchema } from '@solomon-ai/financial-engine-sdk/resources/institutions';
import { engine } from '@/lib/engine';

type GetAccountParams = {
  countryCode: string;
  query?: string;
};

export async function getInstitutions({
  countryCode,
  query,
}: GetAccountParams): Promise<InstitutionsSchema> {
  try {
    return engine.institutions.list({
      countryCode: countryCode as any,
      q: query,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return { data: [] };
  }
}
