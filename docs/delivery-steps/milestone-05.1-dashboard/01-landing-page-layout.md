# Step 01: Landing Page Foundation

## Overview

Create the foundational layout and routing structure for the new landing page that adapts based on user authentication state.

## Objectives

- [ ] Create a new landing page component that replaces the current placeholder
- [ ] Implement authentication-aware routing
- [ ] Set up the basic responsive layout structure
- [ ] Add SEO meta tags and accessibility foundations

## Technical Requirements

### 1. Page Structure Setup

**File:** `src/app/page.tsx`

- Replace current demo page with proper landing page
- Integrate with Clerk authentication state
- Add proper TypeScript interfaces
- Include SEO meta tags

**File:** `src/components/LandingPage.tsx`

- Main landing page component for non-authenticated users
- Responsive grid layout using shadcn/ui
- Semantic HTML structure for accessibility

**File:** `src/components/Dashboard.tsx`

- Main dashboard component for authenticated users
- Card-based layout for stats and actions
- Navigation integration

### 2. Layout Components

**File:** `src/components/landing/LandingLayout.tsx`

- Container component for landing page sections
- Responsive breakpoints
- Proper spacing and typography scale

**File:** `src/components/dashboard/DashboardLayout.tsx`

- Container for authenticated user dashboard
- Grid system for dashboard cards
- Mobile-optimized layout

### 3. SEO and Accessibility

**File:** `src/app/layout.tsx` (update)

- Enhanced meta tags for landing page
- OpenGraph and Twitter Card support
- Structured data markup

## Implementation Details

### Authentication-Aware Page Component

```typescript
// src/app/page.tsx
import { SignedIn, SignedOut } from '@clerk/nextjs';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'D&D Combat Tracker - Master Your Encounters',
  description: 'The comprehensive tool that makes D&D combat tracking effortless for Dungeon Masters. Free forever plan available.',
  keywords: 'D&D, combat tracker, initiative, dungeon master, RPG',
  openGraph: {
    title: 'D&D Combat Tracker - Master Your Encounters',
    description: 'Streamline your D&D combat with automated initiative tracking, lair actions, and cloud sync.',
    type: 'website',
    url: 'https://dnd-combat-tracker.com',
  },
};

export default function HomePage() {
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </>
  );
}
```

### Landing Page Foundation

```typescript
// src/components/LandingPage.tsx
'use client';

import { Button } from '@/components/ui/button';
import { SignUpButton } from '@clerk/nextjs';
import LandingLayout from './landing/LandingLayout';

export default function LandingPage() {
  return (
    <LandingLayout>
      <div className="space-y-16">
        {/* Hero Section Placeholder */}
        <section className="text-center py-16" aria-labelledby="hero-heading">
          <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold tracking-tight">
            Master Your D&D Combat Encounters
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
            The comprehensive tool that makes combat tracking effortless for Dungeon Masters
          </p>
          <div className="mt-8">
            <SignUpButton mode="modal">
              <Button size="lg" className="text-lg px-8 py-4">
                Start Free Trial
              </Button>
            </SignUpButton>
          </div>
        </section>

        {/* Additional sections will be added in subsequent steps */}
      </div>
    </LandingLayout>
  );
}
```

## Testing Requirements

### Unit Tests

**File:** `src/components/__tests__/LandingPage.test.tsx`

- Renders correctly for non-authenticated users
- Contains proper semantic HTML structure
- Includes accessibility landmarks
- Sign-up button functionality

**File:** `src/components/__tests__/Dashboard.test.tsx`

- Renders correctly for authenticated users
- Shows user-specific content
- Navigation integration works

### Accessibility Tests

- Screen reader navigation
- Keyboard-only navigation
- Color contrast validation
- ARIA labels and landmarks

## Quality Checklist

- [ ] TypeScript strict mode compliance
- [ ] ESLint passes without warnings
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] SEO meta tags properly configured
- [ ] Accessibility audit passes
- [ ] Performance budget under 2 seconds load time

## Dependencies

- Clerk authentication components
- shadcn/ui Button and layout components
- Next.js metadata API
- Existing Layout component integration

## Next Steps

After completing this step:

1. Test authentication state switching
2. Validate responsive design
3. Run accessibility audit
4. Proceed to Step 02: Hero Section implementation
