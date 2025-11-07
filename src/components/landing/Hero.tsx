import Link from 'next/link';
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
 * Hero Component - Main hero section for landing page
 *
 * Renders a responsive hero banner with headline, subhead, CTA button,
 * and optional hero image. Designed for mobile and desktop viewports.
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
      aria-label="Hero section"
      className="w-full py-12 md:py-24 bg-linear-to-b from-slate-900 to-slate-800"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Text content */}
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              {headline}
            </h1>

            <p className="text-lg md:text-xl text-slate-300">{subhead}</p>

            <div className="flex gap-4">
              <Link
                href={ctaHref}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors inline-block"
              >
                {ctaText}
              </Link>
            </div>
          </div>

          {/* Hero image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md h-80">
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
