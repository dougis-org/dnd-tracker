import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickActions } from '@/components/dashboard/QuickActions'

describe('QuickActions', () => {
  it('renders configured actions and responds to click', async () => {
    const user = userEvent.setup()
    const actions = [
      { label: 'New Party', href: '/parties/new' },
      { label: 'Start Session', href: '/combat' },
    ]

    render(<QuickActions actions={actions} />)

    expect(screen.getByRole('button', { name: 'New Party' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Session' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'New Party' }))

    // For unit test, ensure the button was clickable (no errors)
    expect(screen.getByRole('button', { name: 'New Party' })).toBeEnabled()
  })
})
