/**
 * @fileoverview Authentication Provider component that wraps the application with Clerk authentication
 * and handles theme integration with next-themes.
 */

'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import type { Theme } from '@clerk/types'
import { tailwind } from '@solomonai/tailwind-config'
import { useTheme } from 'next-themes'
import type { ComponentProps } from 'react'

/**
 * AuthProvider component provides authentication context to the application using Clerk.
 * It automatically handles theme synchronization with next-themes and applies consistent
 * styling based on the application's design system.
 *
 * @component
 * @example
 * // Basic usage in your app's root layout
 * import { AuthProvider } from './path-to/provider';
 *
 * function RootLayout({ children }) {
 *   return (
 *     <AuthProvider>
 *       {children}
 *     </AuthProvider>
 *   );
 * }
 *
 * @example
 * // Usage with custom Clerk props
 * import { AuthProvider } from './path-to/provider';
 *
 * function RootLayout({ children }) {
 *   return (
 *     <AuthProvider
 *       appearance={{
 *         layout: { socialButtonsPlacement: "bottom" }
 *       }}
 *     >
 *       {children}
 *     </AuthProvider>
 *   );
 * }
 *
 * @param {ComponentProps<typeof ClerkProvider>} properties - All properties supported by Clerk's ClerkProvider
 * @returns {JSX.Element} A configured ClerkProvider component with theme integration
 */
export const AuthProvider = (
  properties: ComponentProps<typeof ClerkProvider>,
) => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const baseTheme = isDark ? dark : undefined
  const variables: Theme['variables'] = {
    // Core
    fontFamily: tailwind.theme.fontFamily.sans.join(', '),
    fontFamilyButtons: tailwind.theme.fontFamily.sans.join(', '),
    fontSize: tailwind.theme.fontSize.sm[0],
    fontWeight: {
      bold: tailwind.theme.fontWeight.bold,
      normal: tailwind.theme.fontWeight.normal,
      medium: tailwind.theme.fontWeight.medium,
    },
    spacingUnit: tailwind.theme.spacing[4],
  }

  const elements: Theme['elements'] = {
    dividerLine: 'bg-border',
    socialButtonsIconButton: 'bg-card',
    navbarButton: 'text-foreground',
    organizationSwitcherTrigger__open: 'bg-background',
    organizationPreviewMainIdentifier: 'text-foreground',
    organizationSwitcherTriggerIcon: 'text-muted-foreground',
    organizationPreview__organizationSwitcherTrigger: 'gap-2',
    organizationPreviewAvatarContainer: 'shrink-0',
  }

  return (
    <ClerkProvider
      {...properties}
      appearance={{ baseTheme, variables, elements }}
    />
  )
}
