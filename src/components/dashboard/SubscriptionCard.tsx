/**
 * Subscription Card Component
 * Displays current subscription tier and limits with upgrade CTA
 * Constitutional: Max 50 lines per function
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SubscriptionCardProps {
  metrics: {
    subscription: {
      tier: string;
      limits: {
        parties: number;
        encounters: number;
        characters: number;
        maxParticipants: number;
      };
    };
  };
}

export function SubscriptionCard({ metrics }: SubscriptionCardProps) {
  const { tier, limits } = metrics.subscription;

  // Format tier name for display
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);

  // Helper to format limit with infinity handling
  const formatLimit = (count: number, label: string) => {
    if (count === Infinity) {
      return `Unlimited ${label}`;
    }
    // Handle pluralization for "Parties" -> "Party", "Encounters" -> "Encounter", etc.
    let displayLabel = label;
    if (count === 1) {
      // Convert plural to singular
      if (label.endsWith('ies')) {
        displayLabel = `${label.slice(0, -3)  }y`; // Parties -> Party
      } else if (label.endsWith('s')) {
        displayLabel = label.slice(0, -1); // Encounters -> Encounter
      }
    }
    return `${count} ${displayLabel}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tierName} Adventurer</CardTitle>
        <CardDescription>Your current subscription tier</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{formatLimit(limits.parties, 'Parties')}</span>
            <span className="text-muted-foreground">up to {limits.maxParticipants} members</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{formatLimit(limits.encounters, 'Encounters')}</span>
            <span className="text-muted-foreground">saved encounters</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{formatLimit(limits.characters, 'Creatures')}</span>
            <span className="text-muted-foreground">custom creatures</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{limits.maxParticipants} Max Participants</span>
            <span className="text-muted-foreground">per encounter</span>
          </div>
        </div>
        <Button className="w-full" variant="outline">
          Upgrade for More
        </Button>
      </CardContent>
    </Card>
  );
}
