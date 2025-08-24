# Step 04: Pricing & Social Proof

## Overview

Implement the pricing comparison table focused on freemium conversion and add testimonials carousel for social proof.

## Objectives

- [ ] Create freemium-focused pricing comparison table
- [ ] Implement testimonials carousel with real-looking reviews
- [ ] Add conversion-optimized call-to-action buttons
- [ ] Ensure mobile-responsive pricing display

## Technical Requirements

### 1. Pricing Components

**File:** `src/components/landing/PricingSection.tsx`

- Responsive pricing table
- Highlight free tier benefits
- Clear upgrade path visualization
- Mobile-optimized card layout

**File:** `src/components/landing/TestimonialsSection.tsx`

- Carousel with smooth transitions
- Star ratings display
- User personas with realistic details
- Auto-rotating testimonials

### 2. Data Structures

**File:** `src/lib/pricing-data.ts`

- Pricing tier definitions
- Feature comparison matrix
- Testimonial data with type safety

## Implementation Details

### Pricing Section Component

```typescript
// src/components/landing/PricingSection.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { SignUpButton } from '@clerk/nextjs';

const pricingTiers = [
  {
    name: 'Free Adventurer',
    price: '$0',
    period: 'forever',
    popular: true,
    features: {
      parties: '1',
      encounters: '3', 
      participants: '6',
      cloudSync: false,
      advancedLogging: false,
      customThemes: false
    },
    cta: 'Start Free Forever'
  },
  {
    name: 'Seasoned Adventurer',
    price: '$4.99',
    period: 'month',
    popular: false,
    features: {
      parties: '3',
      encounters: '15',
      participants: '10', 
      cloudSync: true,
      advancedLogging: true,
      customThemes: false
    },
    cta: 'Start Free Trial'
  },
  {
    name: 'Expert DM',
    price: '$9.99',
    period: 'month',
    popular: false,
    features: {
      parties: '10',
      encounters: '50',
      participants: '20',
      cloudSync: true,
      advancedLogging: true,
      customThemes: true
    },
    cta: 'Start Free Trial'
  }
];

const featureLabels = {
  parties: 'Parties',
  encounters: 'Encounters', 
  participants: 'Max Participants',
  cloudSync: 'Cloud Sync',
  advancedLogging: 'Advanced Logging',
  customThemes: 'Custom Themes'
};

export default function PricingSection() {
  return (
    <section className="py-16" aria-labelledby="pricing-heading">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="pricing-heading" className="text-3xl font-bold mb-4">
            Choose Your Adventure Level
          </h2>
          <p className="text-xl text-muted-foreground">
            Start free forever, upgrade when your campaigns grow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <Card 
              key={tier.name}
              className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {tier.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">/{tier.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {Object.entries(featureLabels).map(([key, label]) => {
                  const value = tier.features[key as keyof typeof tier.features];
                  const isBoolean = typeof value === 'boolean';
                  
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      <div className="flex items-center gap-2">
                        {isBoolean ? (
                          value ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground" />
                          )
                        ) : (
                          <Badge variant="outline">{value}</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4">
                  <SignUpButton mode="modal">
                    <Button 
                      className="w-full" 
                      variant={tier.popular ? 'default' : 'outline'}
                    >
                      {tier.cta}
                    </Button>
                  </SignUpButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="link" className="text-primary">
            View All Plans & Features →
          </Button>
        </div>
      </div>
    </section>
  );
}
```

### Testimonials Section

```typescript
// src/components/landing/TestimonialsSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    name: 'Sarah K.',
    role: 'DM for 5 years',
    rating: 5,
    text: "Finally, combat flows smoothly without losing track of anything. My players love how organized our sessions are now.",
    avatar: 'SK'
  },
  {
    id: 2, 
    name: 'Mike R.',
    role: 'New DM',
    rating: 5,
    text: "The automated initiative and lair actions helped me run my first dragon encounter confidently.",
    avatar: 'MR'
  },
  {
    id: 3,
    name: 'Alex T.',
    role: 'Professional DM', 
    rating: 5,
    text: "Started free, upgraded when my campaign grew. Worth every penny for the cloud sync alone.",
    avatar: 'AT'
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(prev => prev === 0 ? testimonials.length - 1 : prev - 1);
  };

  return (
    <section className="py-16 bg-muted/50" aria-labelledby="testimonials-heading">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="testimonials-heading" className="text-3xl font-bold mb-4">
            Loved by Dungeon Masters
          </h2>
          <p className="text-xl text-muted-foreground">
            See what DMs are saying about our combat tracker
          </p>
        </div>

        <div className="relative">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <blockquote className="text-lg italic mb-6 text-muted-foreground">
                "{testimonials[currentIndex].text}"
              </blockquote>
              
              <div className="flex items-center justify-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {testimonials[currentIndex].avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-semibold">{testimonials[currentIndex].name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonials[currentIndex].role}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex"
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline" 
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex"
            onClick={nextTestimonial}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center mt-6 gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

## Testing Requirements

### Unit Tests

**File:** `src/components/landing/__tests__/PricingSection.test.tsx`

- All pricing tiers render correctly
- Feature comparison displays properly
- CTA buttons are functional
- Popular tier highlighting works

**File:** `src/components/landing/__tests__/TestimonialsSection.test.tsx`

- Carousel navigation works
- Auto-rotation functions
- Star ratings display correctly
- Accessibility controls work

## Quality Checklist

- [ ] Pricing table responsive on all devices
- [ ] Testimonial carousel keyboard accessible
- [ ] Star ratings visually consistent
- [ ] CTA buttons properly tracked
- [ ] Loading states handled gracefully
- [ ] Smooth transitions between testimonials

## Next Steps

After completing this step:

1. Test conversion flow from pricing to sign-up
2. Validate carousel performance on mobile
3. A/B test different testimonial orderings
4. Proceed to Step 05: Authenticated Dashboard Layout
