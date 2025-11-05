# Data Model Notes — Feature 003

This feature uses only mock/static data for UI rendering. No database changes required.

Suggested mock shapes (TypeScript interfaces for tests/fixtures):

```ts
interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface Testimonial {
  id: string;
  author: string;
  text: string;
  source?: string;
}

interface PricingTier {
  id: string;
  name: string;
  priceMonthly: string;
  features: string[];
}
```

Place fixture JSON under `tests/fixtures/landing/`.
