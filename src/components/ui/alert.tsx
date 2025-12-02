import * as React from "react"

import { cn } from "@/lib/utils"

const Alert = React.forwardRef<
  HTMLDivElement, // eslint-disable-line no-undef -- HTMLDivElement is a DOM global type
  React.HTMLAttributes<HTMLDivElement> & { // eslint-disable-line no-undef -- HTMLDivElement is a DOM global type
    variant?: 'default' | 'destructive'
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current",
      variant === 'destructive' &&
        "border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600",
      variant === 'default' &&
        "border-gray-200 bg-white text-gray-900 [&>svg]:text-gray-600",
      className
    )}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLHeadingElement, // eslint-disable-line no-undef -- HTMLHeadingElement is a DOM global type
  React.HTMLAttributes<HTMLHeadingElement> // eslint-disable-line no-undef -- HTMLHeadingElement is a DOM global type
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLDivElement, // eslint-disable-line no-undef -- HTMLDivElement is a DOM global type
  React.HTMLAttributes<HTMLDivElement> // eslint-disable-line no-undef -- HTMLDivElement is a DOM global type
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
