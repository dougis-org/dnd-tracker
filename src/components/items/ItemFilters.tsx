import React from 'react'
import { ItemCategory, ItemRarity } from '@/types/item'

export interface ItemFiltersValue {
  category: ItemCategory | null
  rarity: ItemRarity | null
}

export interface ItemFiltersProps {
  value: ItemFiltersValue
  onFilterChange: (filters: ItemFiltersValue) => void
  className?: string
}

export function ItemFilters({ value, onFilterChange, className }: ItemFiltersProps) {
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value ? (e.target.value as ItemCategory) : null
    onFilterChange({ ...value, category })
  }

  const handleRarityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rarity = e.target.value ? (e.target.value as ItemRarity) : null
    onFilterChange({ ...value, rarity })
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        <label htmlFor="category-select" className="block text-sm font-medium">
          Category
        </label>
        <select
          id="category-select"
          value={value.category ?? ''}
          onChange={handleCategoryChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {Object.values(ItemCategory).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="rarity-select" className="block text-sm font-medium">
          Rarity
        </label>
        <select
          id="rarity-select"
          value={value.rarity ?? ''}
          onChange={handleRarityChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Rarities</option>
          {Object.values(ItemRarity).map((rarity) => (
            <option key={rarity} value={rarity}>
              {rarity}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
