'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { ItemCard, ItemFilters, type ItemFiltersValue, ItemSearchBar } from '@/components/items'
import { itemAdapter } from '@/lib/adapters/items'
import type { Item } from '@/types/item'

type FiltersState = ItemFiltersValue

const INITIAL_FILTERS: FiltersState = {
  category: null,
  rarity: null,
}

function normalizeQuery(value: string): string {
  return value.trim().toLowerCase()
}

function filterItems(items: Item[], filters: FiltersState, query: string): Item[] {
  if (!items.length) {
    return []
  }

  const normalizedQuery = normalizeQuery(query)

  return items.filter((item) => {
    if (filters.category && item.category !== filters.category) {
      return false
    }

    if (filters.rarity && item.rarity !== filters.rarity) {
      return false
    }

    if (normalizedQuery) {
      const haystack = `${item.name} ${item.description ?? ''}`.toLowerCase()
      if (!haystack.includes(normalizedQuery)) {
        return false
      }
    }

    return true
  })
}

export default function ItemsPage() {
  const [items, setItems] = React.useState<Item[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filters, setFilters] = React.useState<FiltersState>(INITIAL_FILTERS)

  useEffect(() => {
    const controller = new AbortController()

    const loadItems = async () => {
      try {
        setLoading(true)
        const allItems = await itemAdapter.findAll()
        if (!controller.signal.aborted) {
          setItems(allItems)
          setError(null)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to load items')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadItems()

    return () => {
      controller.abort()
    }
  }, [])

  const filteredItems = React.useMemo(
    () => filterItems(items, filters, searchQuery),
    [filters, items, searchQuery],
  )

  const handleSearch = React.useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleFilterChange = React.useCallback((nextFilters: FiltersState) => {
    setFilters(nextFilters)
  }, [])

  const hasResults = filteredItems.length > 0
  const totalItems = items.length
  const resultsSummary = loading
    ? 'Loading items…'
    : `${filteredItems.length} of ${totalItems} items`

  return (
    <main className="container mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Catalog</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Item Catalog</h1>
        <p className="text-muted-foreground">
          Browse the D&D SRD item library, combine filters, and search for the perfect equipment for your party.
        </p>
      </header>

      <section className="space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
          <ItemSearchBar onSearch={handleSearch} className="lg:max-w-xl" />
          <ItemFilters onFilterChange={handleFilterChange} value={filters} className="lg:flex-1" />
        </div>

        <div aria-live="polite" role="status" className="text-sm text-muted-foreground">
          {resultsSummary}
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading items">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`item-skeleton-${index}`} className="h-48 animate-pulse rounded-lg border border-border bg-muted" />
            ))}
          </div>
        ) : hasResults ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <Link key={item.id} href={`/items/${item.id}`} className="block" aria-label={`View details for ${item.name}`}>
                <ItemCard item={item} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-center" role="alert">
            <p className="font-medium text-foreground">No items match your criteria.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters to explore more of the catalog.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
