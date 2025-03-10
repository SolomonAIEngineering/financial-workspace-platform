import FinancialEngine from '@solomon-ai/financial-engine-sdk';

// Define fallback values for development
const DEFAULT_API_KEY = process.env.NODE_ENV === 'production' ? '' : 'SOLOMONAI';
const DEFAULT_API_ENDPOINT = process.env.NODE_ENV === 'production'
  ? ''
  : 'https://engine.solomon-ai-platform.com';

// Log config for debugging
console.info('Financial Engine SDK Configuration:', {
  apiKeyPresent: process.env.MIDDAY_ENGINE_API_KEY ? 'yes' : 'no',
  endpointPresent: process.env.ENGINE_API_ENDPOINT ? 'yes' : 'no',
  environment: process.env.NODE_ENV,
  usingDefaults: !process.env.MIDDAY_ENGINE_API_KEY || !process.env.ENGINE_API_ENDPOINT,
  endpoint: process.env.ENGINE_API_ENDPOINT ?? DEFAULT_API_ENDPOINT,
});

export const engine = new FinancialEngine({
  bearerToken: process.env.MIDDAY_ENGINE_API_KEY ?? "SOLOMONAI",
  defaultHeaders: {
    "x-api-key": process.env.MIDDAY_ENGINE_API_KEY ?? "SOLOMONAI",
    Authorization: `Bearer ${process.env.MIDDAY_ENGINE_API_KEY ?? "SOLOMONAI"}`,
  },
  baseURL:
    process.env.ENGINE_API_ENDPOINT ?? "https://engine.solomon-ai-platform.com",
});