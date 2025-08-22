import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input', () => {
  it('renders with default type text', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    // When no type is specified, HTML input defaults to text but doesn't have the attribute
    expect(input).not.toHaveAttribute('type')
  })

  it('renders with specified type', () => {
    render(<Input type="email" placeholder="Enter email" />)
    const input = screen.getByPlaceholderText('Enter email')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('renders with number type', () => {
    render(<Input type="number" placeholder="Enter number" />)
    const input = screen.getByPlaceholderText('Enter number')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('renders with password type', () => {
    render(<Input type="password" placeholder="Enter password" />)
    const input = screen.getByPlaceholderText('Enter password')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('has correct base classes', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('flex')
    expect(input).toHaveClass('h-10')
    expect(input).toHaveClass('w-full')
    expect(input).toHaveClass('rounded-md')
    expect(input).toHaveClass('border')
    expect(input).toHaveClass('border-input')
    expect(input).toHaveClass('bg-background')
  })

  it('merges custom className', () => {
    render(<Input className="custom-class" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('custom-class')
    expect(input).toHaveClass('border-input')
  })

  it('handles value changes', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    
    render(<Input onChange={handleChange} placeholder="Type here" />)
    const input = screen.getByPlaceholderText('Type here')
    
    await user.type(input, 'Hello')
    expect(handleChange).toHaveBeenCalledTimes(5) // One for each character
  })

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled input" />)
    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed')
    expect(input).toHaveClass('disabled:opacity-50')
  })

  it('supports controlled value', () => {
    const { rerender } = render(<Input value="initial" readOnly />)
    const input = screen.getByDisplayValue('initial')
    expect(input).toHaveValue('initial')

    rerender(<Input value="updated" readOnly />)
    expect(input).toHaveValue('updated')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('supports placeholder text', () => {
    render(<Input placeholder="Enter your name" />)
    const input = screen.getByPlaceholderText('Enter your name')
    expect(input).toHaveAttribute('placeholder', 'Enter your name')
  })

  it('supports required attribute', () => {
    render(<Input required data-testid="required-input" />)
    const input = screen.getByTestId('required-input')
    expect(input).toBeRequired()
  })

  it('supports min and max for number inputs', () => {
    render(<Input type="number" min="1" max="10" data-testid="number-input" />)
    const input = screen.getByTestId('number-input')
    expect(input).toHaveAttribute('min', '1')
    expect(input).toHaveAttribute('max', '10')
  })
})