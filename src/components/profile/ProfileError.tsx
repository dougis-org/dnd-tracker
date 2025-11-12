import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileErrorProps {
  error: Error;
  onRetry: () => void;
  'data-testid'?: string;
}

export default function ProfileError({
  error,
  onRetry,
  'data-testid': testId,
}: ProfileErrorProps) {
  return (
    <Card className="border-red-200 bg-red-50" data-testid={testId}>
      <CardHeader>
        <CardTitle className="text-red-900">Error Loading Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-red-800">
          {error.message || 'Failed to load your profile. Please try again.'}
        </p>
        <Button onClick={onRetry} variant="outline">
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
