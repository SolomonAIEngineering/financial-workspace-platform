import FinancialEngine from '@solomon-ai/workspace-financial-backend-sdk';

// Define fallback values for development
const DEFAULT_API_KEY =
  process.env.NODE_ENV === 'production' ? '' : 'SOLOMONAI';
const DEFAULT_API_ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? ''
    : 'https://engine.solomon-ai-platform.com';

// Log config for debugging
console.info('Financial Engine SDK Configuration:', {
  apiKeyPresent: process.env.API_SECRET_KEY ? 'yes' : 'no',
  endpointPresent: process.env.FINANCIAL_ENGINE_BASE_URL ? 'yes' : 'no',
  environment: process.env.NODE_ENV,
  usingDefaults:
    !process.env.API_SECRET_KEY || !process.env.FINANCIAL_ENGINE_BASE_URL,
  endpoint: process.env.FINANCIAL_ENGINE_BASE_URL ?? DEFAULT_API_ENDPOINT,
});

export const engine = new FinancialEngine({
  bearerToken: process.env.API_SECRET_KEY ?? 'SOLOMONAI',
  defaultHeaders: {
    'X-API-Key': process.env.API_SECRET_KEY ?? 'SOLOMONAI',

    Authorization: `Bearer ${process.env.API_SECRET_KEY ?? 'SOLOMONAI'}`,
  },
  baseURL:
    process.env.FINANCIAL_ENGINE_BASE_URL ??
    'https://engine.solomon-ai-platform.com',
});
