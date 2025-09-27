'use client'

import { cn } from '@/lib/utils'

const selectStyles = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(selectStyles, className)}
      {...props}
    >
      {children}
    </select>
  )
}

interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode
}

export function SelectOption({ children, ...props }: SelectOptionProps) {
  return <option {...props}>{children}</option>
}