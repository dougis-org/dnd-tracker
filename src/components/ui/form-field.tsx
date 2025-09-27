'use client'

import { Label } from '@/components/ui/label'

interface FormFieldProps {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string | undefined }>
  error?: string | undefined
  children: React.ReactNode
  className?: string
}

export function FormField({
  id,
  label,
  icon: Icon,
  error,
  children,
  className = "space-y-2"
}: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} className={Icon ? "flex items-center space-x-2" : ""}>
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

interface ErrorDisplayProps {
  error?: string | null
  className?: string
}

export function ErrorDisplay({ error, className = "mb-4" }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <div className={`${className} p-3 rounded-md bg-destructive/10 border border-destructive/20`}>
      <p className="text-sm text-destructive">{error}</p>
    </div>
  )
}

interface SuccessDisplayProps {
  message?: string | null
  show?: boolean
  className?: string
}

export function SuccessDisplay({
  message = "Operation completed successfully!",
  show = false,
  className = "mb-4"
}: SuccessDisplayProps) {
  if (!show) return null

  return (
    <div className={`${className} p-3 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800`}>
      <p className="text-sm text-green-700 dark:text-green-300">{message}</p>
    </div>
  )
}