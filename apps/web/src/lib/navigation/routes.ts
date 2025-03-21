import { defineRoute, useParseParams } from './@';

export type RouteSchemas = {
  document: {
    params: {
      documentId: string;
    };
  };
  transaction: {
    params: {
      transactionId: string;
    };
  };
  recurringTransaction: {
    params: {
      recurringTransactionId: string;
    };
  };
  home: {
    search?: {
      showId?: string;
    };
  };
  loginProvider: {
    params: {
      provider: 'github' | 'google';
    };
    search?: {
      callbackUrl?: string;
    };
  };
  preview: {
    params: {
      documentId: string;
    };
  };
  user: {
    params: {
      userId: string;
    };
  };
};

export const routes = {
  account: defineRoute('/dashboard/account'),
  dashboard: defineRoute('/dashboard'),
  document: defineRoute<RouteSchemas['document']>('/dashboard/[documentId]'),
  transaction: defineRoute<RouteSchemas['transaction']>(
    '/dashboard/[transactionId]'
  ),
  recurringTransaction: defineRoute<RouteSchemas['recurringTransaction']>(
    '/dashboard/[recurringTransactionId]'
  ),
  faq: defineRoute('/faq'),
  home: defineRoute<RouteSchemas['home']>('/dashboard'),
  login: defineRoute('/login'),
  loginProvider: defineRoute<RouteSchemas['loginProvider']>(
    '/api/auth/[provider]/login'
  ),
  loginProviderCallback: defineRoute<RouteSchemas['loginProvider']>(
    '/api/auth/[provider]/callback'
  ),
  preview: defineRoute<RouteSchemas['preview']>('/preview/[documentId]'),
  privacy: defineRoute('https://www.solomon-ai.app/privacy'),
  root: defineRoute('/'),
  settings: defineRoute('/settings'),
  signup: defineRoute('/signup'),
  terms: defineRoute('https://www.solomon-ai.app/terms-of-service'),
  user: defineRoute<RouteSchemas['user']>('/user/[userId]'),
  onboardingTeam: defineRoute('/onboarding/team'),
  onboardingProfile: defineRoute('/onboarding/profile'),
  onboardingBankConnections: defineRoute('/onboarding/bank-connections'),
  onboardingComplete: defineRoute('/onboarding/complete'),
  financialOverview: defineRoute('/financial-overview'),
  financialAnalytics: defineRoute('/financial-analytics'),
  documents: defineRoute('/documents'),
  templates: defineRoute('/templates'),
  messages: defineRoute('/messages'),
  analytics: defineRoute('/analytics'),
  calendar: defineRoute('/calendar'),
  transactions: defineRoute('/transactions'),
  recurringTransactions: defineRoute('/recurring-transactions'),
  invoices: defineRoute('/invoices'),
  customers: defineRoute('/customers'),
  help: defineRoute('/help'),
  editor: defineRoute('/editor'),
};

export const useDocumentId = () => {
  return useParseParams('document').documentId;
};

/**
 * An array of routes that are used for authentication. These routes will
 * redirect logged in users to /settings
 */
export const authRoutes = [routes.login(), routes.signup()];

export const DEFAULT_LOGIN_REDIRECT = routes.home();
