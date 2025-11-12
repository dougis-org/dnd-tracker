import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileEmptyProps {
  'data-testid'?: string;
}

export default function ProfileEmpty({ 'data-testid': testId }: ProfileEmptyProps) {
  return (
    <Card data-testid={testId}>
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Welcome! Let's get you set up. Start by completing your profile information
          and configuring your D&D preferences. This helps us personalize your experience.
        </p>
      </CardContent>
    </Card>
  );
}
