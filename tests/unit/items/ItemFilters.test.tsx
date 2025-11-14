import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemFilters, type ItemFiltersValue } from '@/components/items'
import { ItemCategory, ItemRarity } from '@/types/item'

const renderWithFilters = (value: ItemFiltersValue, onChange: jest.Mock) => {
  return render(<ItemFilters onFilterChange={onChange} value={value} />)
}

describe('ItemFilters', () => {
  const defaultFilters = { category: null, rarity: null }

  it('renders category and rarity select inputs', () => {
    renderWithFilters(defaultFilters, jest.fn())

    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Rarity')).toBeInTheDocument()
  })

  it('calls onFilterChange when category is selected', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()

    renderWithFilters(defaultFilters, handleChange)

    const categorySelect = screen.getByLabelText('Category')
    await user.selectOptions(categorySelect, ItemCategory.Weapon)

    expect(handleChange).toHaveBeenCalledWith({ category: ItemCategory.Weapon, rarity: null })
  })

  it('calls onFilterChange when rarity is selected', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()

    renderWithFilters(defaultFilters, handleChange)

    const raritySelect = screen.getByLabelText('Rarity')
    await user.selectOptions(raritySelect, ItemRarity.Rare)

    expect(handleChange).toHaveBeenCalledWith({ category: null, rarity: ItemRarity.Rare })
  })

  it('maintains previous filter values when changing one filter', async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    const currentFilters = { category: ItemCategory.Weapon, rarity: null }

    renderWithFilters(currentFilters, handleChange)

    const raritySelect = screen.getByLabelText('Rarity')
    await user.selectOptions(raritySelect, ItemRarity.Legendary)

    expect(handleChange).toHaveBeenCalledWith({
      category: ItemCategory.Weapon,
      rarity: ItemRarity.Legendary,
    })
  })

  it('reflects controlled values from props', () => {
    const value: ItemFiltersValue = { category: ItemCategory.Armor, rarity: ItemRarity.Uncommon }

    renderWithFilters(value, jest.fn())

    expect(screen.getByLabelText('Category')).toHaveValue(ItemCategory.Armor)
    expect(screen.getByLabelText('Rarity')).toHaveValue(ItemRarity.Uncommon)
  })

  it('includes "All" option in category select', () => {
    renderWithFilters(defaultFilters, jest.fn())

    const categoryOptions = screen.getByLabelText('Category').querySelectorAll('option')
    const allOption = Array.from(categoryOptions).find((opt) => opt.textContent === 'All Categories')
    expect(allOption).toBeInTheDocument()
  })

  it('includes "All" option in rarity select', () => {
    renderWithFilters(defaultFilters, jest.fn())

    const rarityOptions = screen.getByLabelText('Rarity').querySelectorAll('option')
    const allOption = Array.from(rarityOptions).find((opt) => opt.textContent === 'All Rarities')
    expect(allOption).toBeInTheDocument()
  })
})
