# Step 06: Quick Actions & Dashboard Features

## Overview

Implement quick action buttons, content shortcuts, and onboarding features to maximize user engagement and feature discovery on the dashboard.

## Objectives

- [ ] Create prominent quick action buttons for primary workflows
- [ ] Build recently used content shortcuts with quick edit access
- [ ] Implement progressive onboarding for new users
- [ ] Add feature discovery and tips system
- [ ] Ensure all actions integrate with existing app navigation

## Technical Requirements

### 1. Quick Actions Components

**File:** `src/components/dashboard/QuickActions.tsx`
- Primary action buttons (Start Combat, Create Character, etc.)
- Secondary action buttons (Import, Export, etc.)
- Responsive button layout
- Analytics tracking for action clicks

**File:** `src/components/dashboard/ContentShortcuts.tsx`
- Recently used characters carousel
- Recent encounters with copy/modify options
- Favorite creature templates
- Horizontal scroll with touch support

### 2. Onboarding Components

**File:** `src/components/dashboard/OnboardingOverlay.tsx`
- First-time user tutorial overlay
- Feature highlight tooltips
- Dismissible onboarding steps
- Progress tracking

**File:** `src/components/dashboard/TipsWidget.tsx`
- Weekly tips banner
- Achievement notifications
- Feature announcements
- Contextual help suggestions

## Implementation Details

### Quick Actions Component

```typescript
// src/components/dashboard/QuickActions.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Swords, 
  Users, 
  Zap, 
  Download, 
  Upload, 
  History,
  FileText 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function QuickActions() {
  const router = useRouter();
  const { user } = useUser();

  const primaryActions = [
    {
      label: 'Start New Combat',
      icon: Swords,
      action: () => router.push('/combat/new'),
      variant: 'default' as const,
      size: 'lg' as const,
      description: 'Begin a new combat encounter'
    },
    {
      label: 'Create Character',
      icon: Plus,
      action: () => router.push('/characters/new'),
      variant: 'outline' as const,
      size: 'default' as const,
      description: 'Add a new character to your collection'
    },
    {
      label: 'Build Encounter',
      icon: Zap,
      action: () => router.push('/encounters/new'),
      variant: 'outline' as const,
      size: 'default' as const,
      description: 'Design a new encounter'
    },
    {
      label: 'Manage Parties',
      icon: Users,
      action: () => router.push('/parties'),
      variant: 'outline' as const,
      size: 'default' as const,
      description: 'Organize your adventuring parties'
    }
  ];

  const secondaryActions = [
    {
      label: 'Import from D&D Beyond',
      icon: Download,
      action: () => router.push('/import'),
      description: 'Import characters and monsters'
    },
    {
      label: 'View Combat History',
      icon: History,
      action: () => router.push('/history'),
      description: 'Review past combat sessions'
    },
    {
      label: 'Export Campaign Data',
      icon: FileText,
      action: () => router.push('/export'),
      description: 'Backup your campaign data'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {primaryActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  variant={action.variant}
                  size={action.size}
                  onClick={action.action}
                  className={`flex flex-col h-auto py-4 px-3 ${
                    index === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
                  }`}
                  title={action.description}
                >
                  <Icon className={`${action.size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} mb-2`} />
                  <span className="text-sm font-medium text-center leading-tight">
                    {action.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Tools & Utilities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {secondaryActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  variant="ghost"
                  size="sm"
                  onClick={action.action}
                  className="justify-start h-auto py-2"
                  title={action.description}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Content Shortcuts Component

```typescript
// src/components/dashboard/ContentShortcuts.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Copy, 
  Heart,
  User,
  Swords,
  Zap
} from 'lucide-react';

interface RecentItem {
  id: string;
  name: string;
  type: 'character' | 'encounter' | 'creature';
  lastUsed: Date;
  details?: string;
  isFavorite?: boolean;
}

interface ContentShortcutsProps {
  recentCharacters: RecentItem[];
  recentEncounters: RecentItem[];
  favoriteCreatures: RecentItem[];
}

export default function ContentShortcuts({ 
  recentCharacters, 
  recentEncounters, 
  favoriteCreatures 
}: ContentShortcutsProps) {
  const [activeSection, setActiveSection] = useState<'characters' | 'encounters' | 'creatures'>('characters');

  const sections = [
    {
      key: 'characters' as const,
      title: 'Recent Characters',
      icon: User,
      items: recentCharacters,
      emptyMessage: 'No characters yet'
    },
    {
      key: 'encounters' as const,
      title: 'Recent Encounters', 
      icon: Swords,
      items: recentEncounters,
      emptyMessage: 'No encounters created'
    },
    {
      key: 'creatures' as const,
      title: 'Favorite Creatures',
      icon: Zap,
      items: favoriteCreatures,
      emptyMessage: 'No favorites saved'
    }
  ];

  const activeItems = sections.find(s => s.key === activeSection)?.items || [];

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'character': return 'bg-blue-500';
      case 'encounter': return 'bg-green-500';
      case 'creature': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg">Quick Access</CardTitle>
        <div className="flex gap-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.key}
                variant={activeSection === section.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection(section.key)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {section.title}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        {activeItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              {sections.find(s => s.key === activeSection)?.icon && (
                <sections.find(s => s.key === activeSection)!.icon className="h-8 w-8" />
              )}
            </div>
            <p>{sections.find(s => s.key === activeSection)?.emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeItems.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={getTypeColor(item.type)}>
                    {getInitials(item.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    {item.isFavorite && (
                      <Heart className="h-3 w-3 text-red-500 fill-current" />
                    )}
                  </div>
                  {item.details && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.details}
                    </p>
                  )}
                  <Badge variant="outline" className="text-xs mt-1">
                    {item.type}
                  </Badge>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Edit className="h-3 w-3" />
                  </Button>
                  {activeSection === 'encounters' && (
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeItems.length > 8 && (
          <div className="text-center mt-4">
            <Button variant="link" size="sm">
              View All {sections.find(s => s.key === activeSection)?.title}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Onboarding Overlay Component

```typescript
// src/components/dashboard/OnboardingOverlay.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  ArrowRight, 
  CheckCircle, 
  Lightbulb,
  Target,
  Rocket
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  action?: {
    label: string;
    href: string;
  };
}

interface OnboardingOverlayProps {
  isVisible: boolean;
  onDismiss: () => void;
  userProgress: {
    hasCreatedCharacter: boolean;
    hasCreatedParty: boolean;
    hasRunCombat: boolean;
  };
}

export default function OnboardingOverlay({ 
  isVisible, 
  onDismiss, 
  userProgress 
}: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: 'create-character',
      title: 'Create Your First Character',
      description: 'Start by adding a character with their stats, class, and abilities.',
      icon: Target,
      completed: userProgress.hasCreatedCharacter,
      action: {
        label: 'Create Character',
        href: '/characters/new'
      }
    },
    {
      id: 'create-party',
      title: 'Form an Adventuring Party',
      description: 'Group your characters together to prepare for encounters.',
      icon: Lightbulb,
      completed: userProgress.hasCreatedParty,
      action: {
        label: 'Create Party',
        href: '/parties/new'
      }
    },
    {
      id: 'run-combat',
      title: 'Run Your First Combat',
      description: 'Experience the power of automated initiative tracking and combat flow.',
      icon: Rocket,
      completed: userProgress.hasRunCombat,
      action: {
        label: 'Start Combat',
        href: '/combat/new'
      }
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Getting Started</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {completedSteps} of {steps.length} steps completed
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  step.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-background border-border'
                }`}
              >
                <div className={`rounded-full p-2 ${
                  step.completed ? 'bg-green-100' : 'bg-primary/10'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Icon className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  {!step.completed && step.action && (
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => window.location.href = step.action!.href}
                    >
                      {step.action.label}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          
          {completedSteps === steps.length && (
            <div className="text-center pt-4 border-t">
              <Badge className="mb-2">🎉 Congratulations!</Badge>
              <p className="text-sm text-muted-foreground">
                You've completed the getting started guide. Happy adventuring!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

## Testing Requirements

### Unit Tests

**File:** `src/components/dashboard/__tests__/QuickActions.test.tsx`
- All primary actions render correctly
- Button clicks navigate to correct routes
- Responsive layout works on mobile
- Analytics tracking fires on clicks

**File:** `src/components/dashboard/__tests__/ContentShortcuts.test.tsx`
- Section switching works properly
- Item cards display correct information
- Empty states show appropriate messages
- Hover effects work on interactive elements

**File:** `src/components/dashboard/__tests__/OnboardingOverlay.test.tsx`
- Progress calculation is accurate
- Dismissal works correctly
- Completed steps show proper state
- Action buttons navigate correctly

## Quality Checklist

- [ ] All navigation routes are valid
- [ ] Touch interactions work on mobile
- [ ] Keyboard navigation is complete
- [ ] Loading states for content shortcuts
- [ ] Onboarding persists user preferences
- [ ] Analytics events are properly tracked

## Next Steps

After completing this step:
1. Test all quick action navigation flows
2. Validate onboarding with new user accounts
3. Test content shortcuts with real data
4. Proceed to Step 07: Sample Data & Content
