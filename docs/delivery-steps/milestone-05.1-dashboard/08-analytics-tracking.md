# Step 08: Analytics & Conversion Tracking

## Overview

Implement comprehensive analytics tracking for landing page conversion optimization, user
journey analysis, and dashboard engagement metrics.

## Objectives

- [ ] Set up conversion funnel tracking from landing to sign-up
- [ ] Implement demo interaction analytics
- [ ] Track dashboard feature usage and engagement
- [ ] Create A/B testing framework for optimization
- [ ] Ensure GDPR compliance and user privacy

## Technical Requirements

### 1. Analytics Components

**File:** `src/lib/analytics/tracking.ts`

- Event tracking utilities
- Conversion funnel management
- User journey mapping
- Privacy-compliant data collection

**File:** `src/lib/analytics/events.ts`

- Standardized event definitions
- Landing page interaction events
- Dashboard usage events
- Conversion milestone events

**File:** `src/components/analytics/AnalyticsProvider.tsx`

- Analytics context provider
- Event batching and optimization
- Error handling and fallbacks

### 2. Conversion Optimization

**File:** `src/lib/analytics/conversion.ts`

- Conversion rate calculations
- Funnel drop-off analysis
- User segmentation utilities
- A/B test result tracking

**File:** `src/hooks/useAnalytics.ts`

- React hook for component-level tracking
- Automatic page view tracking
- User interaction logging

## Implementation Details

### Analytics Tracking System

```typescript
// src/lib/analytics/tracking.ts
interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId: string;
  timestamp: number;
  properties?: Record<string, any>;
}

interface ConversionEvent extends AnalyticsEvent {
  conversionType: 'signup' | 'trial_start' | 'subscription' | 'demo_complete';
  source: 'landing' | 'dashboard' | 'demo' | 'pricing';
  userSegment: 'new' | 'returning' | 'trial' | 'paid';
}

class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startBatchFlush();
  }

  // Landing page events
  trackLandingPageView(source?: string) {
    this.track({
      event: 'page_view',
      category: 'landing',
      action: 'view',
      label: 'landing_page',
      properties: {
        source,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    });
  }

  trackDemoInteraction(demoType: 'initiative' | 'lair' | 'status', action: 'start' | 'interact' | 'complete') {
    this.track({
      event: 'demo_interaction',
      category: 'engagement',
      action,
      label: demoType,
      properties: {
        demoType,
        interactionTime: Date.now()
      }
    });
  }

  trackSignUpStart(source: 'hero' | 'pricing' | 'demo' | 'navigation') {
    this.track({
      event: 'signup_start',
      category: 'conversion',
      action: 'start',
      label: source,
      properties: {
        source,
        priorEngagement: this.calculateEngagementScore()
      }
    });
  }

  trackSignUpComplete(userId: string, subscriptionTier?: string) {
    this.userId = userId;
    this.track({
      event: 'signup_complete',
      category: 'conversion', 
      action: 'complete',
      label: subscriptionTier || 'free',
      userId,
      properties: {
        subscriptionTier,
        timeToConversion: this.calculateTimeToConversion()
      }
    });
  }

  // Dashboard events
  trackDashboardView(userTier: string) {
    this.track({
      event: 'dashboard_view',
      category: 'dashboard',
      action: 'view',
      label: userTier,
      properties: {
        userTier,
        loginMethod: 'clerk'
      }
    });
  }

  trackQuickAction(action: 'start_combat' | 'create_character' | 'build_encounter' | 'manage_parties') {
    this.track({
      event: 'quick_action',
      category: 'dashboard',
      action: 'click',
      label: action,
      properties: {
        actionType: action,
        fromDashboard: true
      }
    });
  }

  trackFeatureUsage(feature: string, context: string) {
    this.track({
      event: 'feature_usage',
      category: 'engagement',
      action: 'use',
      label: feature,
      properties: {
        feature,
        context,
        userTier: this.getUserTier()
      }
    });
  }

  trackUpgradePrompt(promptType: 'limit_reached' | 'feature_gate' | 'dashboard_card', 
    action: 'shown' | 'clicked' | 'dismissed') {
    this.track({
      event: 'upgrade_prompt',
      category: 'monetization',
      action,
      label: promptType,
      properties: {
        promptType,
        currentTier: this.getUserTier(),
        usageMetrics: this.getCurrentUsage()
      }
    });
  }

  // Private methods
  private track(event: Omit<AnalyticsEvent, 'sessionId' | 'timestamp'>) {
    const fullEvent: AnalyticsEvent = {
      ...event,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      userId: this.userId
    };

    this.events.push(fullEvent);

    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  private async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: eventsToSend,
          sessionId: this.sessionId
        })
      });
    } catch (error) {
      console.error('Analytics flush failed:', error);
      // Re-queue events for retry
      this.events.unshift(...eventsToSend);
    }
  }

  private startBatchFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateEngagementScore(): number {
    // Calculate based on time spent, interactions, etc.
    return this.events.filter(e => e.category === 'engagement').length;
  }

  private calculateTimeToConversion(): number {
    const firstEvent = this.events[0];
    return firstEvent ? Date.now() - firstEvent.timestamp : 0;
  }

  private getUserTier(): string {
    // Get from user context or API
    return 'free'; // placeholder
  }

  private getCurrentUsage(): Record<string, number> {
    // Get current usage metrics
    return {}; // placeholder
  }
}

export const analytics = new AnalyticsTracker();
```

### React Analytics Hook

```typescript
// src/hooks/useAnalytics.ts
'use client';

import { useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/analytics/tracking';

export function useAnalytics() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  // Auto-track page views
  useEffect(() => {
    if (isLoaded) {
      if (pathname === '/') {
        if (user) {
          analytics.trackDashboardView(user.publicMetadata?.subscriptionTier as string || 'free');
        } else {
          analytics.trackLandingPageView(document.referrer);
        }
      }
    }
  }, [pathname, user, isLoaded]);

  // Track demo interactions
  const trackDemo = useCallback((demoType: 'initiative' | 'lair' | 'status', 
    action: 'start' | 'interact' | 'complete') => {
    analytics.trackDemoInteraction(demoType, action);
  }, []);

  // Track conversion events
  const trackSignUp = useCallback((source: 'hero' | 'pricing' | 'demo' | 'navigation') => {
    analytics.trackSignUpStart(source);
  }, []);

  // Track dashboard actions
  const trackQuickAction = useCallback((action: 'start_combat' | 'create_character' | 
    'build_encounter' | 'manage_parties') => {
    analytics.trackQuickAction(action);
  }, []);

  // Track feature usage
  const trackFeature = useCallback((feature: string, context: string = 'unknown') => {
    analytics.trackFeatureUsage(feature, context);
  }, []);

  // Track upgrade prompts
  const trackUpgrade = useCallback((promptType: 'limit_reached' | 'feature_gate' | 'dashboard_card', action: 'shown' | 'clicked' | 'dismissed') => {
    analytics.trackUpgradePrompt(promptType, action);
  }, []);

  return {
    trackDemo,
    trackSignUp,
    trackQuickAction,
    trackFeature,
    trackUpgrade,
    user,
    isAuthenticated: !!user
  };
}
```

### Analytics API Route

```typescript
// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const AnalyticsEventSchema = z.object({
  event: z.string(),
  category: z.string(),
  action: z.string(),
  label: z.string().optional(),
  value: z.number().optional(),
  userId: z.string().optional(),
  sessionId: z.string(),
  timestamp: z.number(),
  properties: z.record(z.any()).optional()
});

const AnalyticsBatchSchema = z.object({
  events: z.array(AnalyticsEventSchema),
  sessionId: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = AnalyticsBatchSchema.parse(body);

    // Process events based on environment
    if (process.env.NODE_ENV === 'production') {
      // Send to production analytics service
      await sendToAnalyticsService(validated.events);
    } else {
      // Log for development
      console.log('Analytics Events:', validated.events);
    }

    // Store critical conversion events in database
    const conversionEvents = validated.events.filter(
      event => event.category === 'conversion' || event.event === 'signup_complete'
    );

    if (conversionEvents.length > 0) {
      await storeConversionEvents(conversionEvents);
    }

    return NextResponse.json({ success: true, processed: validated.events.length });
  } catch (error) {
    console.error('Analytics processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics' },
      { status: 400 }
    );
  }
}

async function sendToAnalyticsService(events: any[]) {
  // Integration with analytics service (e.g., Mixpanel, Amplitude, Google Analytics 4)
  if (process.env.ANALYTICS_API_KEY) {
    try {
      const response = await fetch(process.env.ANALYTICS_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      });

      if (!response.ok) {
        throw new Error(`Analytics service error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send to analytics service:', error);
    }
  }
}

async function storeConversionEvents(events: any[]) {
  // Store in MongoDB for business metrics
  // This would connect to your database to store conversion data
  console.log('Storing conversion events:', events);
}
```

### Conversion Tracking Components

```typescript
// src/components/analytics/ConversionTracker.tsx
'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useUser } from '@clerk/nextjs';

interface ConversionTrackerProps {
  children: React.ReactNode;
}

export default function ConversionTracker({ children }: ConversionTrackerProps) {
  const { user } = useUser();
  const { trackSignUp } = useAnalytics();

  useEffect(() => {
    // Track successful sign-up completion
    if (user && !user.publicMetadata?.analyticsTracked) {
      // This would be set during the sign-up process
      trackSignUp('unknown'); // Default source if not tracked earlier
    }
  }, [user, trackSignUp]);

  return <>{children}</>;
}
```

### A/B Testing Framework

```typescript
// src/lib/analytics/ab-testing.ts
interface ABTest {
  id: string;
  name: string;
  variants: {
    control: string;
    test: string;
  };
  traffic: number; // Percentage of traffic to include
  active: boolean;
}

class ABTestManager {
  private tests: Map<string, ABTest> = new Map();
  private userVariants: Map<string, string> = new Map();

  registerTest(test: ABTest) {
    this.tests.set(test.id, test);
  }

  getVariant(testId: string, userId?: string): 'control' | 'test' {
    const test = this.tests.get(testId);
    if (!test || !test.active) {
      return 'control';
    }

    // Use consistent hashing for user assignment
    const hash = userId ? this.hashString(userId + testId) : Math.random();
    const inTest = hash < test.traffic / 100;
    
    if (!inTest) {
      return 'control';
    }

    // Assign variant based on hash
    const variant = hash % 2 < 1 ? 'control' : 'test';
    
    if (userId) {
      this.userVariants.set(`${userId}_${testId}`, variant);
    }
    
    return variant;
  }

  trackExposure(testId: string, variant: 'control' | 'test', userId?: string) {
    analytics.track({
      event: 'ab_test_exposure',
      category: 'experiment',
      action: 'expose',
      label: testId,
      properties: {
        testId,
        variant,
        userId
      }
    });
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }
}

export const abTestManager = new ABTestManager();

// Register active tests
abTestManager.registerTest({
  id: 'hero_message_v1',
  name: 'Hero Message Optimization',
  variants: {
    control: 'Master Your D&D Combat Encounters',
    test: 'Never Lose Track of Combat Again'
  },
  traffic: 50,
  active: true
});
```

## Testing Requirements

### Unit Tests

**File:** `src/lib/analytics/__tests__/tracking.test.ts`

- Event tracking functions work correctly
- Batch flushing operates properly
- Privacy compliance is maintained
- Error handling for failed requests

**File:** `src/hooks/__tests__/useAnalytics.test.tsx`

- Hook tracks page views automatically
- Event tracking functions work
- User authentication state is handled
- Component lifecycle integration

### Integration Tests

- End-to-end conversion funnel tracking
- Analytics API endpoint functionality
- A/B test variant assignment consistency
- Performance impact measurement

## Quality Checklist

- [ ] GDPR compliance with user consent
- [ ] No PII collected without permission
- [ ] Event batching optimizes performance
- [ ] Error handling prevents data loss
- [ ] A/B tests are statistically valid
- [ ] Analytics don't impact page load times

## Success Metrics

### Implementation KPIs

- [ ] Analytics data capture rate >95%
- [ ] API response time <100ms
- [ ] Zero analytics-related client errors
- [ ] A/B test assignment stability >99%

### Business KPIs

- [ ] Landing page conversion rate tracking
- [ ] Demo completion rate measurement
- [ ] Feature adoption rate monitoring
- [ ] Upgrade prompt effectiveness analysis

## Next Steps

After completing this step:

1. Deploy analytics system to production
2. Set up monitoring dashboards
3. Begin A/B testing hero messages
4. Monitor conversion funnel performance
5. Iterate based on user behavior data

## Milestone Completion

This completes Milestone 11: User Dashboard & Landing Page. The implementation provides:

✅ **Landing Page Foundation** - Authentication-aware routing and layout
✅ **Hero Section & Value Props** - Compelling messaging and benefit showcase  
✅ **Interactive Demos** - Engaging feature previews with D&D examples
✅ **Pricing & Social Proof** - Conversion-optimized pricing table and testimonials
✅ **Dashboard Layout** - Usage metrics and quick stats for authenticated users
✅ **Dashboard Features** - Quick actions, shortcuts, and onboarding
✅ **Sample Data** - Realistic D&D content showcasing platform capabilities
✅ **Analytics & Tracking** - Comprehensive conversion and engagement analytics

The dashboard system is now ready for production deployment and optimization based on real user behavior data.
