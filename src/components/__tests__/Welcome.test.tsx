import { render, screen } from '@testing-library/react'
import { Welcome } from '../Welcome'

// Mock the useWelcome hook
jest.mock('@/hooks/useWelcome', () => ({
  useWelcome: () => ({
    message: {
      title: 'Test Welcome Title',
      description: 'Test welcome description'
    }
  })
}))

describe('Welcome Component', () => {
  it('renders the welcome message', () => {
    render(<Welcome />)
    
    expect(screen.getByText('Test Welcome Title')).toBeInTheDocument()
    expect(screen.getByText('Test welcome description')).toBeInTheDocument()
  })

  it('has correct HTML structure', () => {
    render(<Welcome />)
    
    const container = screen.getByText('Test Welcome Title').closest('div')
    expect(container).toHaveClass('text-center')
    
    const title = screen.getByText('Test Welcome Title')
    expect(title.tagName).toBe('H2')
    expect(title).toHaveClass('text-2xl', 'font-semibold')
    
    const description = screen.getByText('Test welcome description')
    expect(description.tagName).toBe('P')
    expect(description).toHaveClass('text-gray-600')
  })
})