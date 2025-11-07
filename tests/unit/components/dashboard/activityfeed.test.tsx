import { render, screen } from '@testing-library/react'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

describe('ActivityFeed', () => {
  it('lists recent activity items and links to targets', () => {
    const items = [
      { id: 'a1', type: 'session', timestamp: '2025-11-05T12:34:56Z', description: "Combat 'Goblin Ambush' ended", targetUrl: '/combat/123' },
    ]

    render(<ActivityFeed items={items} />)

    expect(screen.getByText(/Goblin Ambush/)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Goblin Ambush/i })
    expect(link).toHaveAttribute('href', '/combat/123')
  })
})
