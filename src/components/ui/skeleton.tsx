import * as React from 'react'
import { cn } from '@/lib/utils'

const Skeleton = React.forwardRef<
  HTMLDivElement, // eslint-disable-line no-undef -- HTMLDivElement is a DOM global type
  React.HTMLAttributes<HTMLDivElement> // eslint-disable-line no-undef -- HTMLDivElement is a DOM global type
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('animate-pulse rounded-md bg-muted', className)}
    {...props}
  />
))
Skeleton.displayName = 'Skeleton'

export { Skeleton }
