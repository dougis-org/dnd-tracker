import React from 'react'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  describe('variants', () => {
    const variantTests = [
      { variant: undefined, text: 'Default', expectedClasses: ['bg-primary', 'text-primary-foreground', 'h-10', 'px-4', 'py-2'] },
      { variant: 'destructive', text: 'Delete', expectedClasses: ['bg-destructive', 'text-destructive-foreground'] },
      { variant: 'outline', text: 'Outline', expectedClasses: ['border', 'border-input', 'bg-background'] },
      { variant: 'secondary', text: 'Secondary', expectedClasses: ['bg-secondary', 'text-secondary-foreground'] },
      { variant: 'ghost', text: 'Ghost', expectedClasses: ['hover:bg-accent', 'hover:text-accent-foreground'] },
      { variant: 'link', text: 'Link', expectedClasses: ['text-primary', 'underline-offset-4'] },
      { variant: 'dragon', text: 'Dragon', expectedClasses: ['bg-dragon-red', 'text-white'] },
      { variant: 'lair', text: 'Lair', expectedClasses: ['bg-lair-dungeon', 'text-white'] }
    ]

    variantTests.forEach(({ variant, text, expectedClasses }) => {
      it(`should render with ${variant || 'default'} variant`, () => {
        render(<Button variant={variant as any}>{text}</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass(...expectedClasses)
      })
    })
  })

  describe('sizes', () => {
    const sizeTests = [
      { size: 'sm', text: 'Small', expectedClasses: ['h-9', 'px-3'] },
      { size: 'lg', text: 'Large', expectedClasses: ['h-11', 'px-8'] },
      { size: 'icon', text: '🔥', expectedClasses: ['h-10', 'w-10'] }
    ]

    sizeTests.forEach(({ size, text, expectedClasses }) => {
      it(`should render with ${size} size`, () => {
        render(<Button size={size as any}>{text}</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass(...expectedClasses)
      })
    })
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })

  it('should render as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = screen.getByRole('link', { name: 'Link Button' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Ref Test</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('should handle onClick events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click Test</Button>)
    const button = screen.getByRole('button')
    button.click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should pass through HTML button attributes', () => {
    render(<Button type="submit" data-testid="submit-btn">Submit</Button>)
    const button = screen.getByTestId('submit-btn')
    expect(button).toHaveAttribute('type', 'submit')
  })
})