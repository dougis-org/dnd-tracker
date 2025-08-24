# Step 03: Interactive Demo Components

## Overview

Build the interactive demo section with tabbed interface showcasing Initiative Tracker,
Lair Actions, and Status Effects using realistic D&D examples.

## Objectives

- [ ] Create tabbed demo interface with smooth transitions
- [ ] Implement mock Initiative Tracker with sample characters
- [ ] Build Lair Actions demo with countdown timer
- [ ] Add Status Effects showcase with duration tracking
- [ ] Ensure demos are engaging and conversion-focused

## Technical Requirements

### 1. Demo Container Components

**File:** `src/components/landing/InteractiveDemoSection.tsx`

- Tabbed interface using shadcn/ui Tabs
- State management for active demo
- Analytics tracking for engagement
- Mobile-optimized tab navigation

**File:** `src/components/demo/DemoTabs.tsx`

- Tab switching logic
- Smooth transitions between demos
- Keyboard navigation support

### 2. Individual Demo Components

**File:** `src/components/demo/InitiativeTrackerDemo.tsx`

- Mock initiative order with 4 characters
- Animated turn progression
- HP bars with visual indicators
- Real-time updates simulation

**File:** `src/components/demo/LairActionsDemo.tsx`

- Dragon lair example with initiative 20 triggers
- Countdown timer animation
- Environmental effect descriptions
- Interactive action selection

**File:** `src/components/demo/StatusEffectsDemo.tsx`

- Character with multiple conditions
- Duration countdown animations
- Color-coded status indicators
- Automatic effect expiration

## Implementation Details

### Interactive Demo Section

```typescript
// src/components/landing/InteractiveDemoSection.tsx
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InitiativeTrackerDemo from '@/components/demo/InitiativeTrackerDemo';
import LairActionsDemo from '@/components/demo/LairActionsDemo';
import StatusEffectsDemo from '@/components/demo/StatusEffectsDemo';

export default function InteractiveDemoSection() {
  return (
    <section className="py-16 bg-muted/50" aria-labelledby="demo-heading">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="demo-heading" className="text-3xl font-bold mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the power of our combat tracker with these interactive demos
          </p>
        </div>

        <Tabs defaultValue="initiative" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="initiative" className="text-sm">
              Initiative Tracker
            </TabsTrigger>
            <TabsTrigger value="lair" className="text-sm">
              Lair Actions
            </TabsTrigger>
            <TabsTrigger value="status" className="text-sm">
              Status Effects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="initiative">
            <InitiativeTrackerDemo />
          </TabsContent>
          
          <TabsContent value="lair">
            <LairActionsDemo />
          </TabsContent>
          
          <TabsContent value="status">
            <StatusEffectsDemo />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
```

### Initiative Tracker Demo

```typescript
// src/components/demo/InitiativeTrackerDemo.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight } from 'lucide-react';

interface Character {
  name: string;
  class: string;
  initiative: number;
  hp: { current: number; max: number };
  isActive: boolean;
}

const initialCharacters: Character[] = [
  { name: 'Thorin', class: 'Fighter', initiative: 18, hp: { current: 45, max: 45 }, isActive: false },
  { name: 'Lyra', class: 'Wizard', initiative: 15, hp: { current: 28, max: 32 }, isActive: true },
  { name: 'Goblin Archer', class: 'Monster', initiative: 12, hp: { current: 7, max: 7 }, isActive: false },
  { name: 'Orc Warrior', class: 'Monster', initiative: 8, hp: { current: 15, max: 15 }, isActive: false },
];

export default function InitiativeTrackerDemo() {
  const [characters, setCharacters] = useState(initialCharacters);
  const [round, setRound] = useState(1);

  // Simulate turn progression every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCharacters(prevChars => {
        const currentIndex = prevChars.findIndex(char => char.isActive);
        const nextIndex = (currentIndex + 1) % prevChars.length;

        if (nextIndex === 0) {
          setRound(prevRound => prevRound + 1);
        }

        return prevChars.map((char, index) => ({
          ...char,
          isActive: index === nextIndex,
        }));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Combat Round {round}</span>
          <Badge variant="outline">Initiative Order</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {characters.map((character, index) => (
          <div
            key={character.name}
            className={`flex items-center p-3 rounded-lg border transition-all ${
              character.isActive 
                ? 'bg-primary/10 border-primary shadow-sm' 
                : 'bg-background border-border'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              {character.isActive && (
                <ChevronRight className="h-5 w-5 text-primary animate-pulse" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{character.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {character.class}
                  </Badge>
                  <span className="text-sm text-muted-foreground ml-auto">
                    Initiative: {character.initiative}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">HP:</span>
                  <Progress 
                    value={(character.hp.current / character.hp.max) * 100}
                    className="flex-1 h-2"
                  />
                  <span className="text-sm font-medium">
                    {character.hp.current}/{character.hp.max}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

### Lair Actions Demo

```typescript
// src/components/demo/LairActionsDemo.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timer, Zap } from 'lucide-react';

export default function LairActionsDemo() {
  const [countdown, setCountdown] = useState(3);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsActive(true);
          setTimeout(() => setIsActive(false), 2000);
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const lairActions = [
    "Stalactites fall from ceiling (DC 15 Dex save or 2d6 bludgeoning)",
    "Poisonous gas fills a 20ft radius (DC 18 Con save or poisoned)",
    "The ground trembles, difficult terrain in 30ft radius"
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          Ancient Red Dragon's Lair
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 rounded-lg border-2 border-dashed border-orange-200 bg-orange-50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className="h-5 w-5 text-orange-600" />
            <span className="font-semibold text-orange-800">
              Initiative Count 20
            </span>
          </div>
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {isActive ? "LAIR ACTION!" : `Next in ${countdown} turns`}
          </div>
        </div>

        {isActive && (
          <div className="animate-in slide-in-from-bottom duration-500">
            <h4 className="font-semibold mb-3 text-orange-800">
              The ancient dragon's lair trembles with malevolent energy. Choose one:
            </h4>
            <div className="space-y-2">
              {lairActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start h-auto p-3 border-orange-200 hover:bg-orange-50"
                >
                  <span className="text-sm">• {action}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <Badge variant="secondary" className="mb-2">Demo Feature</Badge>
          <p className="text-sm text-muted-foreground">
            Lair actions automatically trigger every round, keeping combat dynamic and engaging.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Testing Requirements

### Unit Tests

**File:** `src/components/demo/__tests__/InitiativeTrackerDemo.test.tsx`

- Character list renders correctly
- Turn progression animation works
- HP bars display proper percentages
- Round counter increments properly

**File:** `src/components/demo/__tests__/LairActionsDemo.test.tsx`

- Countdown timer functions correctly
- Lair actions appear at proper timing
- Action buttons are interactive
- Animations trigger smoothly

### Accessibility Tests

- Tab navigation between demo tabs
- Screen reader announces state changes
- Keyboard interaction with demo elements
- Focus management during transitions

## Quality Checklist

- [ ] Animations are smooth and performant
- [ ] Timers reset properly on component unmount
- [ ] Mobile layout is touch-friendly
- [ ] Color contrast meets accessibility standards
- [ ] Loading states handle edge cases
- [ ] Memory leaks prevented in intervals

## Next Steps

After completing this step:

1. Integrate demos into main landing page
2. Add analytics tracking for demo engagement
3. Test performance with multiple running timers
4. Proceed to Step 04: Pricing & Social Proof
