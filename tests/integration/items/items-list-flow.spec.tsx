import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ItemsPage from '@/app/items/page'
import { Item, ItemCategory, ItemRarity } from '@/types/item'

const mockItems: Item[] = [
  {
    id: 'item-1',
    name: 'Longsword of Dawn',
    description: 'A radiant blade that shines with the light of dawn.',
    category: ItemCategory.Weapon,
    rarity: ItemRarity.Rare,
    weight: 3,
    cost: '120 gp',
    properties: ['Versatile (1d10)', '+1 to attack and damage rolls'],
    damage: '1d8',
    damageType: 'Slashing',
    armorClass: undefined,
    armorType: undefined,
    strengthRequirement: undefined,
    requiresAttunement: true,
    isSystemItem: true,
    source: 'System Catalog',
    tags: [],
    quantity: undefined,
    uses: undefined,
  },
  {
    id: 'item-2',
    name: 'Healing Potion',
    description: 'Restores a small amount of hit points when consumed.',
    category: ItemCategory.Consumable,
    rarity: ItemRarity.Common,
    weight: 0.5,
    cost: '50 gp',
    properties: ['Regain 2d4 + 2 HP'],
    damage: undefined,
    damageType: undefined,
    armorClass: undefined,
    armorType: undefined,
    strengthRequirement: undefined,
    requiresAttunement: false,
    isSystemItem: true,
    source: 'System Catalog',
    tags: [],
    quantity: undefined,
    uses: undefined,
  },
  {
    id: 'item-3',
    name: 'Warhammer of the Mountain',
    description: 'A heavy hammer that channels the strength of the earth.',
    category: ItemCategory.Weapon,
    rarity: ItemRarity.Uncommon,
    weight: 2,
    cost: '180 gp',
    properties: ['Versatile (1d10)'],
    damage: '1d8',
    damageType: 'Bludgeoning',
    armorClass: undefined,
    armorType: undefined,
    strengthRequirement: undefined,
    requiresAttunement: true,
    isSystemItem: true,
    source: 'System Catalog',
    tags: [],
    quantity: undefined,
    uses: undefined,
  },
]

jest.mock('@/lib/adapters/items', () => ({
  itemAdapter: {
    findAll: jest.fn(() => Promise.resolve(mockItems)),
  },
}))

describe('ItemsPage integration - US1 list filtering and search', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('loads and displays all items on mount', async () => {
    render(<ItemsPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /item catalog/i })).toBeInTheDocument()
    })

    expect(await screen.findByRole('heading', { level: 3, name: /longsword of dawn/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /healing potion/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /warhammer of the mountain/i })).toBeInTheDocument()
  })

  it('filters items by category when filter changes', async () => {
    const user = userEvent.setup({ advanceTimers: (ms) => jest.advanceTimersByTime(ms) })
    render(<ItemsPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /item catalog/i })).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByLabelText('Category'), ItemCategory.Weapon)

    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 3, name: /healing potion/i })).not.toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { level: 3, name: /longsword of dawn/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /warhammer of the mountain/i })).toBeInTheDocument()
  })

  it('filters items by rarity', async () => {
    const user = userEvent.setup({ advanceTimers: (ms) => jest.advanceTimersByTime(ms) })
    render(<ItemsPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /item catalog/i })).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByLabelText('Rarity'), ItemRarity.Rare)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: /longsword of dawn/i })).toBeInTheDocument()
    })

    expect(screen.queryByRole('heading', { level: 3, name: /healing potion/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3, name: /warhammer of the mountain/i })).not.toBeInTheDocument()
  })

  it('searches items by name and description', async () => {
    const user = userEvent.setup({ advanceTimers: (ms) => jest.advanceTimersByTime(ms) })
    render(<ItemsPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /item catalog/i })).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Search items...'), 'potion')
    
    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: /healing potion/i })).toBeInTheDocument()
    })

    expect(screen.queryByRole('heading', { level: 3, name: /longsword of dawn/i })).not.toBeInTheDocument()
  })

  it('shows empty state when no results match', async () => {
    const user = userEvent.setup({ advanceTimers: (ms) => jest.advanceTimersByTime(ms) })
    render(<ItemsPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /item catalog/i })).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('Search items...'), 'nonexistent artifact')
    
    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    expect(await screen.findByText(/no items match your criteria/i)).toBeInTheDocument()
  })

  it('displays results count in aria-live region', async () => {
    render(<ItemsPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /item catalog/i })).toBeInTheDocument()
    })

    const resultsSummary = screen.getByRole('status')
    await waitFor(() => {
      expect(resultsSummary).toHaveTextContent('3 of 3 items')
    })
  })
})
