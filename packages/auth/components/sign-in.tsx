/**
 * @fileoverview Sign In component that provides a customized Clerk authentication form.
 */

import { SignIn as ClerkSignIn } from '@clerk/nextjs'

/**
 * SignIn component renders a customized Clerk sign-in form with the header hidden.
 * This component is designed to be used in authentication flows where a clean,
 * header-less sign-in form is desired.
 *
 * @component
 * @example
 * // Basic usage in a page or component
 * import { SignIn } from './path-to/components/sign-in';
 *
 * function SignInPage() {
 *   return (
 *     <div className="auth-container">
 *       <SignIn />
 *     </div>
 *   );
 * }
 *
 * @example
 * // Usage in a Next.js page
 * // pages/sign-in.tsx or app/sign-in/page.tsx
 * import { SignIn } from '@/components/sign-in';
 *
 * export default function SignInPage() {
 *   return <SignIn />;
 * }
 *
 * @returns {JSX.Element} A configured Clerk SignIn component with custom styling
 */
export const SignIn = () => (
  <ClerkSignIn
    appearance={{
      elements: {
        header: 'hidden',
      },
    }}
  />
)
