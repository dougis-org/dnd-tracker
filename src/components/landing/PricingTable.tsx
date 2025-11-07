/**
 * PricingTable Component - Renders pricing tiers from data
 *
 * Displays pricing information with features and CTA buttons.
 * Accepts pricing tier data as a prop.
 */

import Link from 'next/link';
import type { Route } from 'next';

interface PricingTier {
  id: string;
  name: string;
  priceMonthly: string;
  features: string[];
}

interface PricingTableProps {
  data: PricingTier[];
}

export function PricingTable({ data }: PricingTableProps) {
  return (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((tier) => (
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
                  <li
                    key={i}
                    className="text-slate-700 flex items-center gap-2"
                  >
                    <span className="text-blue-600">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={`/sign-up?tier=${tier.id}` as Route}
                className="block w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-center"
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
