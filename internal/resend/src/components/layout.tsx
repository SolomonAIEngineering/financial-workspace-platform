import * as React from 'react'

import CONSTANTS from '../../constants/constants'
// biome-ignore lint/style/useImportType: need access to `children`, not just the type
import type { ReactNode } from 'react'

/**
 * Props interface for the Layout component
 * @interface LayoutProps
 * @property {ReactNode} children - The content to be rendered within the layout
 */
interface LayoutProps {
  children: ReactNode
}

/**
 * Layout component that provides a consistent structure for all email templates
 * This component wraps email content with common styling and footer elements.
 *
 * @component
 * @param {LayoutProps} props - Component props
 * @param {ReactNode} props.children - The email-specific content to render
 *
 * @example
 * ```tsx
 * <Layout>
 *   <p>Your email content here</p>
 * </Layout>
 * ```
 *
 * @returns {JSX.Element} A React Email component with consistent layout structure
 *
 * @remarks
 * The layout includes:
 * - Tailwind CSS styling
 * - Responsive container structure
 * - White background with consistent padding
 * - Social media footer with links to:
 *   - X (Twitter)
 *   - Discord
 *   - GitHub
 * - Consistent font styling (sans-serif)
 * - Proper HTML email structure
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => (
  <html>
    <head />
    <body
      style={{
        backgroundColor: 'white',
        fontFamily: 'sans-serif',
        color: '#27272a',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>
        <div
          style={{
            margin: '0 auto',
            backgroundColor: '#f9fafb',
            padding: '1.5rem',
          }}
        >
          {children}
        </div>
        <div
          style={{
            margin: '0 auto',
            padding: '1.5rem',
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          <p>
            Connect with us on social media!
            <br />
            <a href={CONSTANTS.URLS.X}>X (formerly Twitter)</a> |{' '}
            <a href={CONSTANTS.URLS.DISCORD}>Discord</a> |{' '}
            <a href={CONSTANTS.URLS.GITHUB}>GitHub</a>
          </p>
        </div>
      </div>
    </body>
  </html>
)
