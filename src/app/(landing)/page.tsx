import { LandingLayout } from '@/components/layouts/LandingLayout';
import { SeoTags } from '@/components/SeoTags';
import { Hero } from '@/components/landing/Hero';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { CallToAction } from '@/components/landing/CallToAction';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';
import { Testimonials } from '@/components/landing/Testimonials';
import { PricingTable } from '@/components/landing/PricingTable';
import featuresData from './data/features.json';
import testimonialsData from './data/testimonials.json';
import pricingData from './data/pricing.json';

/**
 * LandingPage - Marketing/landing page for D&D Tracker
 *
 * Rendered at `/` in development when NEXT_PUBLIC_FEATURE_LANDING is true.
 * Includes hero, features showcase, testimonials, pricing, and calls-to-action.
 */
export default function LandingPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const canonicalUrl = `${appUrl}/`;

  return (
    <LandingLayout>
      <SeoTags
        title="D&D Tracker - Campaign Management Made Easy"
        description="Organize campaigns, manage characters, track combat in real-time. Everything a Dungeon Master needs in one place."
        canonical={canonicalUrl}
        ogTitle="D&D Tracker - Campaign Management Made Easy"
        ogDescription="Organize campaigns, manage characters, track combat in real-time. Everything a Dungeon Master needs in one place."
        ogImage={`${appUrl}/og-image.png`}
        twitterCard="summary_large_image"
      />

      {/* Hero Section */}
      <Hero
        headline="Master Your Campaigns Effortlessly"
        subhead="D&D Tracker brings all your campaign management tools into one intuitive platform. From character sheets to combat tracking to encounter building, we've got you covered."
        ctaText="Start Free"
        ctaHref="/sign-up"
        imageUrl="/hero-placeholder.png"
        imageAlt="Hero banner showing D&D campaign tools"
      />

      {/* Features Section */}
      <section
        role="region"
        aria-label="Features"
        className="w-full py-16 md:py-24 bg-white"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600">
              Powerful tools designed specifically for Dungeon Masters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature) => (
              <FeatureCard key={feature.id} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <InteractiveDemo />

      {/* Testimonials Section */}
      <Testimonials data={testimonialsData} />

      {/* Pricing Section */}
      <PricingTable data={pricingData} />

      {/* Final CTA */}
      <section className="w-full py-16 md:py-24 bg-linear-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Game?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of Dungeon Masters using D&D Tracker today
          </p>
          <CallToAction
            primaryText="Start Free"
            primaryHref="/sign-up"
            secondaryText="Learn More"
            secondaryHref="/help"
          />
        </div>
      </section>
    </LandingLayout>
  );
}
