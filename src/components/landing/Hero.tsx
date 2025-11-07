import Link from 'next/link';
import type { Route } from 'next';
import Image from 'next/image';

interface HeroProps {
  headline: string;
  subhead: string;
  ctaText: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
}

/**
 * Hero Component - Header banner for landing page
 *
 * Displays main headline, subheading, CTA button, and hero image.
 * Responsive design with image on right (md breakpoint+).
 */
export function Hero({
  headline,
  subhead,
  ctaText,
  ctaHref,
  imageUrl,
  imageAlt,
}: HeroProps) {
  return (
    <section
      role="region"
      aria-label="Hero"
      className="w-full py-12 md:py-24 bg-linear-to-b from-slate-50 to-white"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Content Column */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {headline}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8">
              {subhead}
            </p>
            <div className="flex gap-4">
              <Link
                href={ctaHref as Route}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors inline-block"
              >
                {ctaText}
              </Link>
            </div>
          </div>

          {/* Image Column */}
          <div className="hidden md:flex justify-center">
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={500}
              height={400}
              className="rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
