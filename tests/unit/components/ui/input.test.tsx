import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('should render input element', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should render with default styles', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass(
      'flex',
      'h-10',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-background',
      'px-3',
      'py-2',
      'text-sm'
    )
  })

  it('should render with different input types', () => {
    const { rerender } = render(<Input type="text" data-testid="test-input" />)
    expect(screen.getByTestId('test-input')).toHaveAttribute('type', 'text')

    rerender(<Input type="email" data-testid="test-input" />)
    expect(screen.getByTestId('test-input')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" data-testid="test-input" />)
    expect(screen.getByTestId('test-input')).toHaveAttribute('type', 'password')

    rerender(<Input type="number" data-testid="test-input" />)
    expect(screen.getByTestId('test-input')).toHaveAttribute('type', 'number')
  })

  it('should render with placeholder text', () => {
    render(<Input placeholder="Enter your name" />)
    const input = screen.getByPlaceholderText('Enter your name')
    expect(input).toBeInTheDocument()
  })

  it('should render with value', () => {
    render(<Input value="test value" readOnly />)
    const input = screen.getByDisplayValue('test value')
    expect(input).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('should apply custom className', () => {
    render(<Input className="custom-input" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input')
  })

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('should handle onChange events', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'test input' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'test input' })
    }))
  })

  it('should handle onFocus events', () => {
    const handleFocus = jest.fn()
    render(<Input onFocus={handleFocus} />)
    const input = screen.getByRole('textbox')

    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
  })

  it('should handle onBlur events', () => {
    const handleBlur = jest.fn()
    render(<Input onBlur={handleBlur} />)
    const input = screen.getByRole('textbox')

    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('should pass through HTML input attributes', () => {
    render(<Input data-testid="custom-input" maxLength={10} required />)
    const input = screen.getByTestId('custom-input')
    expect(input).toHaveAttribute('maxLength', '10')
    expect(input).toHaveAttribute('required')
  })

  it('should have correct display name', () => {
    expect(Input.displayName).toBe('Input')
  })

  it('should handle focus styles correctly', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2'
    )
  })

  it('should handle file input styles correctly', () => {
    render(<Input type="file" data-testid="file-input" />)
    const fileInput = screen.getByTestId('file-input')
    expect(fileInput).toHaveClass(
      'file:border-0',
      'file:bg-transparent',
      'file:text-sm',
      'file:font-medium'
    )
  })
})