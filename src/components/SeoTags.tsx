/**
 * SeoTags - Server Component for rendering SEO meta tags
 *
 * This is a Next.js Server Component that renders meta tags to the document head.
 * It's designed for use in static/SSR pages to ensure meta tags are available to
 * E2E tests, crawlers, and social media sharers.
 *
 * Usage:
 * ```tsx
 * <SeoTags
 *   title="Page Title"
 *   description="Page description"
 *   canonical="https://example.com/path"
 *   ogTitle="Open Graph Title"
 *   ogDescription="Open Graph description"
 *   twitterCard="summary_large_image"
 * />
 * ```
 */

interface SeoTagsProps {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
}

export function SeoTags({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard = 'summary_large_image',
}: SeoTagsProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />

      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph tags */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Card tags */}
      <meta name="twitter:card" content={twitterCard} />
      {ogTitle && <meta name="twitter:title" content={ogTitle} />}
      {ogDescription && <meta name="twitter:description" content={ogDescription} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </>
  );
}
