import React from 'react'
import { render, screen } from '@testing-library/react'
import { ItemCard } from '@/components/items'
import { Item, ItemCategory, ItemRarity } from '@/types/item'

const mockItem: Item = {
  id: 'test-001',
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
}

describe('ItemCard', () => {
  it('renders item name and category', () => {
    render(<ItemCard item={mockItem} />)

    expect(screen.getByRole('heading', { level: 3, name: /longsword of dawn/i })).toBeInTheDocument()
    expect(screen.getByText('Weapon')).toBeInTheDocument()
  })

  it('displays rarity badge with correct styling', () => {
    render(<ItemCard item={mockItem} />)

    const rarityBadge = screen.getByText('Rare')
    expect(rarityBadge).toBeInTheDocument()
    expect(rarityBadge).toHaveClass('bg-sky-100', 'text-sky-800')
  })

  it('shows item description', () => {
    render(<ItemCard item={mockItem} />)

    expect(screen.getByText('A radiant blade that shines with the light of dawn.')).toBeInTheDocument()
  })

  it('displays weight in proper format', () => {
    render(<ItemCard item={mockItem} />)

    expect(screen.getByTestId('item-weight')).toHaveTextContent('3 lbs')
  })

  it('displays cost', () => {
    render(<ItemCard item={mockItem} />)

    expect(screen.getByTestId('item-cost')).toHaveTextContent('120 gp')
  })

  it('shows attunement requirement badge', () => {
    render(<ItemCard item={mockItem} />)

    expect(screen.getByText('REQUIRES ATTUNEMENT')).toBeInTheDocument()
  })

  it('displays source as User Created for non-system items', () => {
    const userItem: Item = { ...mockItem, isSystemItem: false }
    render(<ItemCard item={userItem} />)

    expect(screen.getByTestId('item-source')).toHaveTextContent('User Created')
  })

  it('formats properties as "+N more" when multiple', () => {
    render(<ItemCard item={mockItem} />)

    expect(screen.getByTestId('item-properties')).toHaveTextContent('+1 more')
  })

  it('handles null weight gracefully', () => {
    const itemNoWeight: Item = { ...mockItem, weight: null }
    render(<ItemCard item={itemNoWeight} />)

    expect(screen.getByTestId('item-weight')).toHaveTextContent('—')
  })
})
