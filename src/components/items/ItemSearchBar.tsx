import React from 'react'

export interface ItemSearchBarProps {
  onSearch: (query: string) => void
  className?: string
}

const DEBOUNCE_DELAY_MS = 300

export function ItemSearchBar({ onSearch, className }: ItemSearchBarProps) {
  const [query, setQuery] = React.useState('')
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value

      setQuery(value)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        const trimmed = value.trim()
        onSearch(trimmed)
      }, DEBOUNCE_DELAY_MS)
    },
    [onSearch]
  )

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (
    <div className={className}>
      <input
        type="text"
        placeholder="Search items..."
        value={query}
        onChange={handleChange}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
      />
    </div>
  )
}
