import { BusinessConfig as config } from '@solomonai/platform-config';

export function getAppUrl() {
  if (
    process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production'
  ) {
    return config.platformUrl;
  }

  if (process.env.VERCEL_ENV === 'preview') {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

export function getEmailUrl() {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  return config.webUrl;
}

export function getWebsiteUrl() {
  if (
    process.env.VERCEL_ENV === 'production' ||
    process.env.NODE_ENV === 'production'
  ) {
    return config.webUrl;
  }

  if (process.env.VERCEL_ENV === 'preview') {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

export function getCdnUrl() {
  return 'https://assets.solomon-ai.app';
}
