# Step 02: Hero Section & Value Propositions

## Overview

Implement the hero section with compelling messaging and the three-column value proposition
showcase that highlights core benefits.

## Objectives

- [ ] Create an engaging hero section with trust indicators
- [ ] Implement the three-column value proposition layout
- [ ] Add visual elements and icons
- [ ] Ensure mobile responsiveness and accessibility

## Technical Requirements

### 1. Hero Section Components

**File:** `src/components/landing/HeroSection.tsx`

- Compelling headline and subheadline
- Primary CTA button with analytics tracking
- Trust indicators with user avatars
- Responsive typography and spacing

**File:** `src/components/landing/ValuePropositionSection.tsx`

- Three-column grid layout
- Icon integration (Lucide React)
- Benefit descriptions with examples
- Mobile-responsive stack layout

### 2. Visual Assets

**File:** `src/components/ui/icons.tsx` (enhance existing)

- Combat-themed icons (crossed swords, cloud, castle)
- Consistent sizing and styling
- Accessibility attributes

## Implementation Details

### Hero Section Component

```typescript
// src/components/landing/HeroSection.tsx
'use client';

import { Button } from '@/components/ui/button';
import { SignUpButton } from '@clerk/nextjs';
import { Users } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="text-center py-16 md:py-24" aria-labelledby="hero-heading">
      <div className="max-w-4xl mx-auto px-4">
        <h1 
          id="hero-heading" 
          className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r 
          from-primary to-primary/80 bg-clip-text text-transparent"
        >
          Master Your D&D Combat Encounters
        </h1>
        
        <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          The comprehensive tool that makes combat tracking effortless for Dungeon 
          Masters
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <SignUpButton mode="modal">
            <Button size="lg" className="text-lg px-8 py-4 shadow-lg">
              Start Free Trial
            </Button>
          </SignUpButton>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Trusted by 10,000+ Dungeon Masters</span>
          </div>
        </div>
        
        {/* Trust indicators - user avatars */}
        <div className="mt-8 flex justify-center">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 
                to-purple-500 border-2 border-background flex items-center 
                justify-center text-xs font-semibold text-white"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Value Proposition Component

```typescript
// src/components/landing/ValuePropositionSection.tsx
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Swords, Cloud, Castle } from 'lucide-react';

const benefits = [
  {
    icon: Swords,
    title: "Streamline Combat Flow",
    description: "Track initiative, HP, and status effects in real-time",
    example: "Never lose track of turn order or conditions again"
  },
  {
    icon: Cloud,
    title: "Never Lose Progress", 
    description: "Cloud sync keeps your campaigns safe across all devices",
    example: "Access your campaigns from tablet, phone, or computer"
  },
  {
    icon: Castle,
    title: "Scale Your Adventures",
    description: "From single encounters to epic campaigns with unlimited possibilities", 
    example: "Start free, upgrade as your campaigns grow"
  }
];

export default function ValuePropositionSection() {
  return (
    <section className="py-16" aria-labelledby="benefits-heading">
      <div className="max-w-6xl mx-auto px-4">
        <h2 id="benefits-heading" className="text-3xl font-bold text-center mb-12">
          Why DMs Choose Our Combat Tracker
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{benefit.title}</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">{benefit.description}</p>
                  <p className="text-sm text-primary font-medium">{benefit.example}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

## Testing Requirements

### Unit Tests

**File:** `src/components/landing/__tests__/HeroSection.test.tsx`

- Renders hero headline correctly
- Sign-up button is present and clickable
- Trust indicators display properly
- Responsive layout works

**File:** `src/components/landing/__tests__/ValuePropositionSection.test.tsx`

- All three benefits render
- Icons display correctly
- Card hover effects work
- Mobile layout stacks properly

## Quality Checklist

- [ ] Gradient text works across browsers
- [ ] Icons are properly sized and aligned
- [ ] Mobile responsiveness verified
- [ ] Color contrast meets WCAG guidelines
- [ ] Hover effects are smooth and accessible
- [ ] Typography hierarchy is clear

## Next Steps

After completing this step:

1. Update `LandingPage.tsx` to include new sections
2. Test visual hierarchy and spacing
3. Validate mobile experience
4. Proceed to Step 03: Interactive Demo Components
