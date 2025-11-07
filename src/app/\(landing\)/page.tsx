import { LandingLayout } from '@/components/layouts/LandingLayout';
import { SeoTags } from '@/components/SeoTags';
import { Hero } from '@/components/landing/Hero';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { CallToAction } from '@/components/landing/CallToAction';
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

      {/* Testimonials Section */}
      {testimonialsData.length > 0 && (
        <section
          role="region"
          aria-label="Testimonials"
          className="w-full py-16 md:py-24 bg-slate-50"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Loved by Dungeon Masters
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonialsData.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="p-6 bg-white rounded-lg shadow-sm border border-slate-200"
                >
                  <div className="flex gap-2 mb-4">
                    {Array.from({ length: testimonial.rating || 5 }).map(
                      (_, i) => (
                        <span key={i} className="text-yellow-400">
                          ★
                        </span>
                      )
                    )}
                  </div>
                  <p className="text-slate-700 mb-4">"{testimonial.text}"</p>
                  <div className="font-semibold text-slate-900">
                    {testimonial.author}
                  </div>
                  {testimonial.title && (
                    <div className="text-sm text-slate-600">
                      {testimonial.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      {pricingData.length > 0 && (
        <section
          role="region"
          aria-label="Pricing"
          className="w-full py-16 md:py-24 bg-white"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-slate-600">
                Choose the plan that fits your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingData.map((tier) => (
                <div
                  key={tier.id}
                  className="p-8 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all"
                >
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 mb-6">
                    {tier.priceMonthly}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="text-slate-700 flex items-center gap-2">
                        <span className="text-blue-600">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
