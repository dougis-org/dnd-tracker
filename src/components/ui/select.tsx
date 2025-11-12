import * as React from 'react'
import { cn } from '@/lib/utils'

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    className={cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      className
    )}
    ref={ref}
    {...props}
  />
))
Select.displayName = 'Select'

const SelectOption = React.forwardRef<
  HTMLOptionElement, // eslint-disable-line no-undef -- HTMLOptionElement is a DOM global type
  React.OptionHTMLAttributes<HTMLOptionElement> // eslint-disable-line no-undef -- HTMLOptionElement is a DOM global type
>(({ ...props }, ref) => <option ref={ref} {...props} />)
SelectOption.displayName = 'SelectOption'

export { Select, SelectOption }
