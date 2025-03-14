import './globals.css';

import { fontHeading, fontMono, fontSans } from '@/lib/fonts';

import { GA } from '@/components/analytics/ga';
import { META_THEME_COLORS } from '@/config';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Providers } from '@/components/providers/providers';
import { ProvidersServer } from '@/components/providers/providers-server';
import { ReactQueryProvider } from '@/providers/react-query';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/toaster';
import type { Viewport } from 'next';
import { cn } from '@udecode/cn';
import { createMetadata } from '@/lib/navigation/createMetadata';

export const metadata = createMetadata({
  title: 'Solomon AI Contract Workspace',
  titlePrefix: '',
});

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
        <meta name="darkreader-lock" />
        {process.env.NODE_ENV === 'development' ||
        process.env.NEXT_PUBLIC_REACT_SCAN === 'true' ? (
          <script
            src="https://unpkg.com/react-scan/dist/auto.global.js"
            async
          />
        ) : null}
      </head>

      <body
        className={cn(
          'relative min-h-dvh overflow-x-hidden scroll-smooth bg-background font-sans text-clip text-foreground',
          '[&_.slate-selection-area]:bg-brand/[.13]',
          'antialiased',
          fontSans.variable,
          fontHeading.variable,
          fontMono.variable
        )}
        vaul-drawer-wrapper=""
        suppressHydrationWarning
      >
        <ProvidersServer>
          <Providers>
            <div className="flex h-screen w-full overflow-hidden">
              <div className="flex-1 overflow-auto">
                <ReactQueryProvider>
                  <NuqsAdapter>
                    <ThemeProvider
                      attribute="class"
                      defaultTheme="system"
                      enableSystem
                    >
                      {children}
                      <Toaster />
                    </ThemeProvider>
                  </NuqsAdapter>
                </ReactQueryProvider>
              </div>
            </div>
          </Providers>
        </ProvidersServer>
        <GA />
        <Toaster />
      </body>
    </html>
  );
}
