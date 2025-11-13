import React from 'react'
import { render, screen } from '@testing-library/react'
import { ItemCard } from '@/components/items'
import { Item } from '@/types/item'
import { mockItemLongswordOfDawn } from '../../test-helpers/item-fixtures'

describe('ItemCard', () => {
  it('renders item name and category', () => {
    render(<ItemCard item={mockItemLongswordOfDawn} />)

    expect(screen.getByRole('heading', { level: 3, name: /longsword of dawn/i })).toBeInTheDocument()
    expect(screen.getByText('Weapon')).toBeInTheDocument()
  })

  it('displays rarity badge with correct styling', () => {
    render(<ItemCard item={mockItemLongswordOfDawn} />)

    const rarityBadge = screen.getByText('Rare')
    expect(rarityBadge).toBeInTheDocument()
    expect(rarityBadge).toHaveClass('bg-sky-100', 'text-sky-800')
  })

  it('shows item description', () => {
    render(<ItemCard item={mockItemLongswordOfDawn} />)

    expect(screen.getByText('A radiant blade that shines with the light of dawn.')).toBeInTheDocument()
  })

  it('displays weight in proper format', () => {
    render(<ItemCard item={mockItemLongswordOfDawn} />)

    expect(screen.getByTestId('item-weight')).toHaveTextContent('3 lbs')
  })

  it('displays cost', () => {
    render(<ItemCard item={mockItemLongswordOfDawn} />)

    expect(screen.getByTestId('item-cost')).toHaveTextContent('120 gp')
  })

  it('shows attunement requirement badge', () => {
    render(<ItemCard item={mockItemLongswordOfDawn} />)

    expect(screen.getByText('REQUIRES ATTUNEMENT')).toBeInTheDocument()
  })

  it('displays source as User Created for non-system items', () => {
    const userItem: Item = { ...mockItemLongswordOfDawn, isSystemItem: false }
    render(<ItemCard item={userItem} />)

    expect(screen.getByTestId('item-source')).toHaveTextContent('User Created')
  })

  it('formats properties as "+N more" when multiple', () => {
    render(<ItemCard item={mockItemLongswordOfDawn} />)

    expect(screen.getByTestId('item-properties')).toHaveTextContent('+1 more')
  })

  it('handles null weight gracefully', () => {
    const itemNoWeight: Item = { ...mockItemLongswordOfDawn, weight: null }
    render(<ItemCard item={itemNoWeight} />)

    expect(screen.getByTestId('item-weight')).toHaveTextContent('—')
  })
})
