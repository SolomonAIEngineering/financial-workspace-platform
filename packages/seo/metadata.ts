import merge from 'lodash.merge'
import type { Metadata } from 'next'

/**
 * Configuration type for generating metadata for Next.js pages.
 * Extends Next.js Metadata type with required title and description fields.
 *
 * @interface MetadataGenerator
 * @extends {Omit<Metadata, 'description' | 'title'>}
 * @property {string} title - The page title that will be displayed in browser tabs and search results
 * @property {string} description - A concise description of the page content for SEO purposes
 * @property {string} [image] - Optional URL to the page's social sharing image
 */
type MetadataGenerator = Omit<Metadata, 'description' | 'title'> & {
  title: string
  description: string
  image?: string
}

const applicationName = 'next-forge'
const author: Metadata['authors'] = {
  name: 'Yoan Yomba',
  url: 'https://solomon-ai.app/',
}
const publisher = 'Yoan Yomba'
const twitterHandle = '@yoanyomba'

/**
 * Creates a comprehensive metadata object for Next.js pages with SEO best practices.
 * Includes configuration for OpenGraph, Twitter Cards, and Apple Web App properties.
 *
 * @function createMetadata
 * @param {MetadataGenerator} config - The metadata configuration object
 * @param {string} config.title - The page title
 * @param {string} config.description - The page description
 * @param {string} [config.image] - Optional social sharing image URL
 * @param {Partial<Metadata>} [config.properties] - Additional metadata properties to merge
 * @returns {Metadata} Complete metadata object for the page
 *
 * @example
 * ```typescript
 * // Basic usage
 * const metadata = createMetadata({
 *   title: 'Welcome Page',
 *   description: 'Welcome to our awesome website',
 * });
 *
 * // With social sharing image
 * const metadataWithImage = createMetadata({
 *   title: 'Product Page',
 *   description: 'Check out our latest product',
 *   image: 'https://example.com/product-image.jpg',
 * });
 *
 * // With additional custom properties
 * const customMetadata = createMetadata({
 *   title: 'Blog Post',
 *   description: 'An interesting article about...',
 *   robots: {
 *     index: true,
 *     follow: true,
 *   },
 * });
 * ```
 */
export const createMetadata = ({
  title,
  description,
  image,
  ...properties
}: MetadataGenerator): Metadata => {
  const parsedTitle = `${title} | ${applicationName}`
  const defaultMetadata: Metadata = {
    title: parsedTitle,
    description,
    applicationName,
    authors: [author],
    creator: author.name,
    formatDetection: {
      telephone: false,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: parsedTitle,
    },
    openGraph: {
      title: parsedTitle,
      description,
      type: 'website',
      siteName: applicationName,
      locale: 'en_US',
    },
    publisher,
    twitter: {
      card: 'summary_large_image',
      creator: twitterHandle,
    },
  }

  const metadata: Metadata = merge(defaultMetadata, properties)

  if (image && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: title,
      },
    ]
  }

  return metadata
}
