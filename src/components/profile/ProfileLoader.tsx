import React, { HTMLAttributes } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// eslint-disable-next-line no-undef -- HTMLDivElement is available in browser DOM
export default function ProfileLoader(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="space-y-6" {...props}>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name field skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Email field skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Experience level dropdown skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Preferred role dropdown skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Ruleset dropdown skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Save button skeleton */}
          <Skeleton className="h-10 w-32 mt-6" />
        </CardContent>
      </Card>
    </div>
  );
}
