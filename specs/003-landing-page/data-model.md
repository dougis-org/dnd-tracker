# Data Model — Landing Page

This feature is UI-only and uses mock/static data. The minimal data shapes used for components are documented below so tests and fixtures remain consistent.

## Testimonial

```json
{
  "id": "string",
  "author": "string",
  "title": "string|null",
  "imageUrl": "string|null",
  "text": "string",
  "rating": 5
}
```

## PricingTier

```json
{
  "id": "string",
  "name": "string",
  "priceMonthly": "string", // e.g. "$9/mo"
  "features": ["string"]
}
```

## FeatureCard

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "icon": "string" // name of shadcn icon or SVG path
}
```

Notes:

- These shapes live as fixtures under `tests/fixtures/landing/` and as mock data under `src/app/(landing)/data` for local rendering.

These shapes live as fixtures under `tests/fixtures/landing/` and as mock data under `src/app/(landing)/data` for local rendering.

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
  title?: string;
  text: string;
  imageUrl?: string | null;
  rating?: number;
}

interface PricingTier {
  id: string;
  name: string;
  priceMonthly: string;
  features: string[];
}
```

Place fixture JSON under `tests/fixtures/landing/`.
