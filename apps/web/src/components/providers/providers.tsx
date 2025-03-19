'use client';

import * as React from 'react';

import { AppProvider } from '@/components/providers/app-provider';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ReactQueryProvider } from '@/providers/react-query';
import { StaticModalProvider } from '@/components/modals';
import { TailwindProvider } from '@/components/providers/tailwind-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { VersionProvider } from '@/components/context-panel/version-history/version-history-panel';

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableColorScheme
      enableSystem
    >
      <TailwindProvider>
        <ReactQueryProvider>
          <NuqsAdapter>
            <AppProvider>
              <VersionProvider>
                {children}
                <StaticModalProvider />
              </VersionProvider>
            </AppProvider>
          </NuqsAdapter>
        </ReactQueryProvider>
      </TailwindProvider>
    </ThemeProvider>
  );
}
