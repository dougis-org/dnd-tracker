import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ItemsPage from '@/app/items/page'
import { ItemCategory, ItemRarity } from '@/types/item'
import {
  mockItemsList,
} from '../../test-helpers/item-fixtures'

jest.mock('@/lib/adapters/items', () => ({
  itemAdapter: {
    findAll: jest.fn(() => Promise.resolve(mockItemsList)),
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
