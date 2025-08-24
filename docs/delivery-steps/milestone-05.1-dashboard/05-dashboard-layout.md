# Step 05: Authenticated Dashboard Layout

## Overview

Create the main dashboard layout for authenticated users with quick stats overview, usage
metrics, and responsive card-based design.

## Objectives

- [ ] Build dashboard container with responsive grid layout
- [ ] Create usage metrics cards showing tier limits and progress
- [ ] Implement recent activity tracking display
- [ ] Add upgrade prompts when approaching limits
- [ ] Ensure seamless integration with existing navigation

## Technical Requirements

### 1. Dashboard Components

**File:** `src/components/Dashboard.tsx`

- Main dashboard container component
- Authentication state integration
- Responsive grid system for dashboard cards
- Loading states and error handling

**File:** `src/components/dashboard/DashboardStats.tsx`

- Usage metrics display with progress bars
- Tier-specific limit visualization
- Upgrade prompts and notifications

**File:** `src/components/dashboard/RecentActivity.tsx`

- Last combat sessions list
- Quick resume functionality
- Session metadata display

### 2. Data Hooks and State

**File:** `src/hooks/useDashboardData.ts`

- Fetch user stats and recent activity
- Cache management for dashboard data
- Real-time usage updates

**File:** `src/lib/dashboard-utils.ts`

- Usage calculation utilities
- Progress percentage calculations
- Upgrade suggestion logic

## Implementation Details

### Main Dashboard Component

```typescript
// src/components/Dashboard.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardStats from './dashboard/DashboardStats';
import QuickActions from './dashboard/QuickActions';
import RecentActivity from './dashboard/RecentActivity';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { data, isLoading, error } = useDashboardData();

  if (!isLoaded || isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <DashboardError error={error} />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName || 'Dungeon Master'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready to run your next epic encounter?
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <QuickActions />
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardStats data={data} />
        <RecentActivity activities={data?.recentActivities || []} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DashboardError({ error }: { error: Error }) {
  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          We couldn't load your dashboard data. Please try refreshing the page.
        </p>
        <p className="text-sm text-muted-foreground">
          Error: {error.message}
        </p>
      </CardContent>
    </Card>
  );
}
```

### Dashboard Stats Component

```typescript
// src/components/dashboard/DashboardStats.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Swords, Zap, TrendingUp } from 'lucide-react';
import { calculateUsagePercentage, shouldShowUpgradePrompt } from '@/lib/dashboard-utils';

interface DashboardStatsProps {
  data: {
    subscription: {
      tier: string;
      limits: {
        parties: number;
        encounters: number;
        creatures: number;
      };
    };
    usage: {
      parties: number;
      encounters: number;
      creatures: number;
    };
    activeCampaigns: number;
    totalSessions: number;
  };
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  const { subscription, usage, activeCampaigns, totalSessions } = data;
  
  const stats = [
    {
      title: 'Active Campaigns',
      value: activeCampaigns,
      icon: Users,
      description: `${totalSessions} total sessions`,
      color: 'blue'
    },
    {
      title: 'Parties Used',
      value: usage.parties,
      max: subscription.limits.parties,
      icon: Users,
      percentage: calculateUsagePercentage(usage.parties, subscription.limits.parties),
      color: 'green'
    },
    {
      title: 'Encounters Created', 
      value: usage.encounters,
      max: subscription.limits.encounters,
      icon: Swords,
      percentage: calculateUsagePercentage(usage.encounters, subscription.limits.encounters),
      color: 'orange'
    },
    {
      title: 'Creatures Library',
      value: usage.creatures,
      max: subscription.limits.creatures,
      icon: Zap,
      percentage: calculateUsagePercentage(usage.creatures, subscription.limits.creatures),
      color: 'purple'
    }
  ];

  const showUpgradePrompt = shouldShowUpgradePrompt(usage, subscription.limits);

  return (
    <>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isLimitedStat = stat.max !== undefined;
        
        return (
          <Card key={stat.title} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 text-${stat.color}-500`} />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {stat.value}
                  {isLimitedStat && (
                    <span className="text-lg font-normal text-muted-foreground">
                      /{stat.max}
                    </span>
                  )}
                </div>
                
                {isLimitedStat && (
                  <div className="space-y-1">
                    <Progress value={stat.percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{stat.percentage}% used</span>
                      {stat.percentage > 80 && (
                        <Badge variant="outline" className="text-xs">
                          Nearly Full
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {stat.description && (
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Upgrade Prompt Card */}
      {showUpgradePrompt && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Upgrade Recommended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              You're approaching your plan limits. Upgrade to continue growing your campaigns.
            </p>
            <Button size="sm" className="w-full">
              View Plans
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
```

### Recent Activity Component

```typescript
// src/components/dashboard/RecentActivity.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'combat' | 'party' | 'encounter';
  title: string;
  participants: number;
  duration?: number;
  createdAt: Date;
  canResume: boolean;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Swords className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Start your first combat to see activity here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {activity.participants} participants
                      </span>
                      {activity.duration && (
                        <span>Duration: {formatDuration(activity.duration)}</span>
                      )}
                      <span>{formatDistanceToNow(activity.createdAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                
                {activity.canResume && (
                  <Button size="sm" variant="outline" className="ml-4">
                    <Play className="h-3 w-3 mr-1" />
                    Resume
                  </Button>
                )}
              </div>
            ))}
            
            {activities.length > 5 && (
              <Button variant="link" className="w-full text-sm">
                View All Activity
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Testing Requirements

### Unit Tests

**File:** `src/components/__tests__/Dashboard.test.tsx`

- Renders correctly for authenticated users
- Shows loading state while fetching data
- Handles error states gracefully
- Displays welcome message with user name

**File:** `src/components/dashboard/__tests__/DashboardStats.test.tsx`

- Usage percentages calculate correctly
- Progress bars display proper values
- Upgrade prompts appear at correct thresholds
- Different subscription tiers display correctly

### Integration Tests

- Dashboard data fetching and caching
- Real-time usage updates
- Navigation between dashboard sections
- Responsive layout across devices

## Quality Checklist

- [ ] Loading skeletons match final layout
- [ ] Error boundaries handle all failure cases
- [ ] Usage calculations are accurate
- [ ] Progress bars animate smoothly
- [ ] Mobile layout is touch-friendly
- [ ] All interactive elements are accessible

## Next Steps

After completing this step:

1. Test with different subscription tiers
2. Validate usage calculation accuracy
