import React from 'react'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

describe('Card components', () => {
  describe('Card', () => {
    it('should render with children', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('should render with default styles', () => {
      render(<Card data-testid="card">Card content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass(
        'rounded-lg',
        'border',
        'bg-card',
        'text-card-foreground',
        'shadow-sm'
      )
    })

    it('should apply custom className', () => {
      render(<Card className="custom-card" data-testid="card">Card content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-card')
    })

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Card content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('should have correct display name', () => {
      expect(Card.displayName).toBe('Card')
    })
  })

  describe('CardHeader', () => {
    it('should render with children', () => {
      render(<CardHeader>Header content</CardHeader>)
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })

    it('should render with default styles', () => {
      render(<CardHeader data-testid="card-header">Header content</CardHeader>)
      const header = screen.getByTestId('card-header')
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })

    it('should apply custom className', () => {
      render(<CardHeader className="custom-header" data-testid="card-header">Header content</CardHeader>)
      const header = screen.getByTestId('card-header')
      expect(header).toHaveClass('custom-header')
    })

    it('should have correct display name', () => {
      expect(CardHeader.displayName).toBe('CardHeader')
    })
  })

  describe('CardTitle', () => {
    it('should render with children', () => {
      render(<CardTitle>Title content</CardTitle>)
      expect(screen.getByText('Title content')).toBeInTheDocument()
    })

    it('should render as h3 element', () => {
      render(<CardTitle>Title content</CardTitle>)
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toBeInTheDocument()
    })

    it('should render with default styles', () => {
      render(<CardTitle data-testid="card-title">Title content</CardTitle>)
      const title = screen.getByTestId('card-title')
      expect(title).toHaveClass(
        'text-2xl',
        'font-semibold',
        'leading-none',
        'tracking-tight'
      )
    })

    it('should apply custom className', () => {
      render(<CardTitle className="custom-title" data-testid="card-title">Title content</CardTitle>)
      const title = screen.getByTestId('card-title')
      expect(title).toHaveClass('custom-title')
    })

    it('should have correct display name', () => {
      expect(CardTitle.displayName).toBe('CardTitle')
    })
  })

  describe('CardDescription', () => {
    it('should render with children', () => {
      render(<CardDescription>Description content</CardDescription>)
      expect(screen.getByText('Description content')).toBeInTheDocument()
    })

    it('should render as p element', () => {
      render(<CardDescription data-testid="card-description">Description content</CardDescription>)
      const description = screen.getByTestId('card-description')
      expect(description.tagName).toBe('P')
    })

    it('should render with default styles', () => {
      render(<CardDescription data-testid="card-description">Description content</CardDescription>)
      const description = screen.getByTestId('card-description')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('should apply custom className', () => {
      render(<CardDescription className="custom-description" data-testid="card-description">Description content</CardDescription>)
      const description = screen.getByTestId('card-description')
      expect(description).toHaveClass('custom-description')
    })

    it('should have correct display name', () => {
      expect(CardDescription.displayName).toBe('CardDescription')
    })
  })

  describe('CardContent', () => {
    it('should render with children', () => {
      render(<CardContent>Content here</CardContent>)
      expect(screen.getByText('Content here')).toBeInTheDocument()
    })

    it('should render with default styles', () => {
      render(<CardContent data-testid="card-content">Content here</CardContent>)
      const content = screen.getByTestId('card-content')
      expect(content).toHaveClass('p-6', 'pt-0')
    })

    it('should apply custom className', () => {
      render(<CardContent className="custom-content" data-testid="card-content">Content here</CardContent>)
      const content = screen.getByTestId('card-content')
      expect(content).toHaveClass('custom-content')
    })

    it('should have correct display name', () => {
      expect(CardContent.displayName).toBe('CardContent')
    })
  })

  describe('CardFooter', () => {
    it('should render with children', () => {
      render(<CardFooter>Footer content</CardFooter>)
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('should render with default styles', () => {
      render(<CardFooter data-testid="card-footer">Footer content</CardFooter>)
      const footer = screen.getByTestId('card-footer')
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })

    it('should apply custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="card-footer">Footer content</CardFooter>)
      const footer = screen.getByTestId('card-footer')
      expect(footer).toHaveClass('custom-footer')
    })

    it('should have correct display name', () => {
      expect(CardFooter.displayName).toBe('CardFooter')
    })
  })

  describe('Card composition', () => {
    it('should render a complete card with all components', () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByTestId('full-card')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: 'Card Title' })).toBeInTheDocument()
      expect(screen.getByText('Card description')).toBeInTheDocument()
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })
  })
})