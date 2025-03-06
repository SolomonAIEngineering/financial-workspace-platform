/**
 * @fileoverview Sign Up component that provides a customized Clerk registration form.
 */

import { SignUp as ClerkSignUp } from '@clerk/nextjs'

/**
 * SignUp component renders a customized Clerk sign-up form with the header hidden.
 * This component is designed to be used in authentication flows where a clean,
 * header-less registration form is desired.
 *
 * @component
 * @example
 * // Basic usage in a page or component
 * import { SignUp } from './path-to/components/sign-up';
 *
 * function SignUpPage() {
 *   return (
 *     <div className="auth-container">
 *       <SignUp />
 *     </div>
 *   );
 * }
 *
 * @example
 * // Usage in a Next.js page
 * // pages/sign-up.tsx or app/sign-up/page.tsx
 * import { SignUp } from '@/components/sign-up';
 *
 * export default function SignUpPage() {
 *   return <SignUp />;
 * }
 *
 * @returns {JSX.Element} A configured Clerk SignUp component with custom styling
 */
export const SignUp = () => (
  <ClerkSignUp
    appearance={{
      elements: {
        header: 'hidden',
      },
    }}
  />
)
