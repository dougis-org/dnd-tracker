import React from 'react'
import { render, screen } from '@testing-library/react'
import { Label } from '@/components/ui/label'

describe('Label', () => {
  it('should render with children', () => {
    render(<Label>Test Label</Label>)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should render with default styles', () => {
    render(<Label>Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label).toHaveClass(
      'text-sm',
      'font-medium',
      'leading-none',
      'peer-disabled:cursor-not-allowed',
      'peer-disabled:opacity-70'
    )
  })

  it('should apply custom className', () => {
    render(<Label className="custom-label">Test Label</Label>)
    const label = screen.getByText('Test Label')
    expect(label).toHaveClass('custom-label')
  })

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLLabelElement>()
    render(<Label ref={ref}>Test Label</Label>)
    expect(ref.current).toBeInstanceOf(HTMLLabelElement)
  })

  it('should pass through HTML label attributes', () => {
    render(<Label htmlFor="test-input" data-testid="test-label">Test Label</Label>)
    const label = screen.getByTestId('test-label')
    expect(label).toHaveAttribute('for', 'test-input')
  })

  it('should have correct display name', () => {
    expect(Label.displayName).toBe('Label')
  })

  it('should support aria attributes', () => {
    render(
      <Label aria-describedby="help-text" data-testid="aria-label">
        Accessible Label
      </Label>
    )
    const label = screen.getByTestId('aria-label')
    expect(label).toHaveAttribute('aria-describedby', 'help-text')
  })

  it('should work with form inputs', () => {
    render(
      <div>
        <Label htmlFor="email">Email Address</Label>
        <input id="email" type="email" />
      </div>
    )

    const label = screen.getByText('Email Address')
    const input = screen.getByRole('textbox')

    expect(label).toHaveAttribute('for', 'email')
    expect(input).toHaveAttribute('id', 'email')
  })
})