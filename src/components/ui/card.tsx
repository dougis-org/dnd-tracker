import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<
  HTMLDivElement, // eslint-disable-line no-undef -- HTMLDivElement is a DOM global type
  React.HTMLAttributes<HTMLDivElement> // eslint-disable-line no-undef -- HTMLDivElement is a DOM global type
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement, // eslint-disable-line no-undef -- HTMLDivElement is a DOM global type
  React.HTMLAttributes<HTMLDivElement> // eslint-disable-line no-undef -- HTMLDivElement is a DOM global type
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement, // eslint-disable-line no-undef -- HTMLParagraphElement is a DOM global type
  React.HTMLAttributes<HTMLHeadingElement> // eslint-disable-line no-undef -- HTMLHeadingElement is a DOM global type
>(({ className, ...props }, ref) => (
  <h2
    ref={ref as React.Ref<HTMLHeadingElement>} // eslint-disable-line no-undef -- HTMLHeadingElement is a DOM global type
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement, // eslint-disable-line no-undef -- HTMLParagraphElement is a DOM global type
  React.HTMLAttributes<HTMLParagraphElement> // eslint-disable-line no-undef -- HTMLParagraphElement is a DOM global type
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement, // eslint-disable-line no-undef -- HTMLDivElement is a DOM global type
  React.HTMLAttributes<HTMLDivElement> // eslint-disable-line no-undef -- HTMLDivElement is a DOM global type
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement, // eslint-disable-line no-undef -- HTMLDivElement is a DOM global type
  React.HTMLAttributes<HTMLDivElement> // eslint-disable-line no-undef -- HTMLDivElement is a DOM global type
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
