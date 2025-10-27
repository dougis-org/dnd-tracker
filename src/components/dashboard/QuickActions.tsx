/**
 * Quick Actions Component
 * Displays primary action buttons for creating parties, encounters, and creatures
 * Constitutional: Max 50 lines per function
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Start</CardTitle>
        <CardDescription>Get started with your first D&D session</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" variant="dragon">
          <Plus className="mr-2 h-4 w-4" />
          Create Party
        </Button>
        <Button className="w-full" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Build Encounter
        </Button>
        <Button className="w-full" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Creature
        </Button>
      </CardContent>
    </Card>
  );
}
