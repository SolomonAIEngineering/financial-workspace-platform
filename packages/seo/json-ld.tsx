import type { Thing, WithContext } from 'schema-dts'

/**
 * Props for the JsonLd component.
 * @interface JsonLdProps
 * @property {WithContext<Thing>} code - The JSON-LD structured data object that follows the Schema.org vocabulary.
 */
type JsonLdProps = {
  code: WithContext<Thing>
}

/**
 * A React component that injects JSON-LD structured data into the page's head.
 * JSON-LD helps search engines better understand the content of your website.
 *
 * @component
 * @example
 * ```tsx
 * // Basic usage with Organization schema
 * const organizationData = {
 *   "@context": "https://schema.org",
 *   "@type": "Organization",
 *   "name": "Your Company",
 *   "url": "https://www.example.com",
 *   "logo": "https://www.example.com/logo.png"
 * };
 *
 * return <JsonLd code={organizationData} />;
 *
 * // Usage with Product schema
 * const productData = {
 *   "@context": "https://schema.org",
 *   "@type": "Product",
 *   "name": "Executive Anvil",
 *   "description": "Sleeker than ACME's Classic Anvil",
 *   "price": "119.99",
 *   "priceCurrency": "USD"
 * };
 *
 * return <JsonLd code={productData} />;
 * ```
 */
export const JsonLd = ({ code }: JsonLdProps) => (
  <script
    type="application/ld+json"
    // biome-ignore lint/security/noDangerouslySetInnerHtml: "This is a JSON-LD script, not user-generated content."
    dangerouslySetInnerHTML={{ __html: JSON.stringify(code) }}
  />
)

export * from 'schema-dts'
