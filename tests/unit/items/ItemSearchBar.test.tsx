import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemSearchBar } from '@/components/items'

describe('ItemSearchBar', () => {
  it('renders search input with placeholder', () => {
    render(<ItemSearchBar onSearch={jest.fn()} />)

    const input = screen.getByPlaceholderText('Search items...')
    expect(input).toBeInTheDocument()
  })

  it('calls onSearch after debounce when user types', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const handleSearch = jest.fn()

    jest.useFakeTimers()
    render(<ItemSearchBar onSearch={handleSearch} />)

    const input = screen.getByPlaceholderText('Search items...')
    await user.type(input, 'longsword')

    expect(handleSearch).not.toHaveBeenCalled()

    jest.advanceTimersByTime(300)

    expect(handleSearch).toHaveBeenCalledWith('longsword')

    jest.useRealTimers()
  })

  it('debounces multiple rapid keystrokes into single callback', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const handleSearch = jest.fn()

    jest.useFakeTimers()
    render(<ItemSearchBar onSearch={handleSearch} />)

    const input = screen.getByPlaceholderText('Search items...')
    await user.type(input, 'sword', { delay: 50 })

    expect(handleSearch).not.toHaveBeenCalled()

    jest.advanceTimersByTime(300)

    expect(handleSearch).toHaveBeenCalledTimes(1)
    expect(handleSearch).toHaveBeenCalledWith('sword')

    jest.useRealTimers()
  })

  it('trims whitespace from search input', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const handleSearch = jest.fn()

    jest.useFakeTimers()
    render(<ItemSearchBar onSearch={handleSearch} />)

    const input = screen.getByPlaceholderText('Search items...')
    await user.type(input, '  sword  ')

    jest.advanceTimersByTime(300)

    expect(handleSearch).toHaveBeenCalledWith('sword')

    jest.useRealTimers()
  })

  it('accepts custom className', () => {
    const { container } = render(
      <ItemSearchBar onSearch={jest.fn()} className="custom-class" />
    )

    const wrapper = container.querySelector('.custom-class')
    expect(wrapper).toBeInTheDocument()
  })
})
