/**
 * Usage Metrics Component
 * Displays subscription usage across parties, encounters, creatures, and tier
 * Constitutional: Max 50 lines per function
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Swords, BookOpen, Star } from 'lucide-react';

interface UsageMetricsProps {
  metrics: {
    subscription: {
      tier: string;
      usage: {
        parties: number;
        encounters: number;
        characters: number;
      };
      limits: {
        parties: number;
        encounters: number;
        characters: number;
        maxParticipants: number;
      };
      percentages: {
        parties: number;
        encounters: number;
        characters: number;
      };
      warnings: any[];
    };
  };
}

export function UsageMetrics({ metrics }: UsageMetricsProps) {
  const { subscription } = metrics;
  const formatLimit = (limit: number) => (limit === Infinity ? '∞' : limit);

  // Format tier name for display
  const tierName = subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Parties</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {subscription.usage.parties}/{formatLimit(subscription.limits.parties)}
          </div>
          <p className="text-xs text-muted-foreground">parties used</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Encounters</CardTitle>
          <Swords className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {subscription.usage.encounters}/{formatLimit(subscription.limits.encounters)}
          </div>
          <p className="text-xs text-muted-foreground">encounters saved</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Creatures</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {subscription.usage.characters}/{formatLimit(subscription.limits.characters)}
          </div>
          <p className="text-xs text-muted-foreground">creatures created</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tier</CardTitle>
          <Star className="h-4 w-4 text-dragon-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tierName}</div>
          <p className="text-xs text-muted-foreground">Adventurer</p>
        </CardContent>
      </Card>
    </div>
  );
}
