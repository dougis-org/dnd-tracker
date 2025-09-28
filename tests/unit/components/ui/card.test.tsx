import React from 'react'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

describe('Card components', () => {
  const cardComponents = [
    {
      name: 'Card',
      Component: Card,
      content: 'Card content',
      testId: 'card',
      customClass: 'custom-card',
      expectedClasses: ['rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm']
    },
    {
      name: 'CardHeader',
      Component: CardHeader,
      content: 'Header content',
      testId: 'card-header',
      customClass: 'custom-header',
      expectedClasses: ['flex', 'flex-col', 'space-y-1.5', 'p-6']
    },
    {
      name: 'CardContent',
      Component: CardContent,
      content: 'Content here',
      testId: 'card-content',
      customClass: 'custom-content',
      expectedClasses: ['p-6', 'pt-0']
    },
    {
      name: 'CardFooter',
      Component: CardFooter,
      content: 'Footer content',
      testId: 'card-footer',
      customClass: 'custom-footer',
      expectedClasses: ['flex', 'items-center', 'p-6', 'pt-0']
    }
  ]

  cardComponents.forEach(({ name, Component, content, testId, customClass, expectedClasses }) => {
    describe(name, () => {
      it('should render with children', () => {
        render(<Component>{content}</Component>)
        expect(screen.getByText(content)).toBeInTheDocument()
      })

      it('should render with default styles', () => {
        render(<Component data-testid={testId}>{content}</Component>)
        const element = screen.getByTestId(testId)
        expect(element).toHaveClass(...expectedClasses)
      })

      it('should apply custom className', () => {
        render(<Component className={customClass} data-testid={testId}>{content}</Component>)
        const element = screen.getByTestId(testId)
        expect(element).toHaveClass(customClass)
      })

      it('should have correct display name', () => {
        expect(Component.displayName).toBe(name)
      })
    })
  })

  const textComponents = [
    {
      name: 'CardTitle',
      Component: CardTitle,
      content: 'Title content',
      testId: 'card-title',
      customClass: 'custom-title',
      expectedClasses: ['text-2xl', 'font-semibold', 'leading-none', 'tracking-tight'],
      elementTest: () => expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    },
    {
      name: 'CardDescription',
      Component: CardDescription,
      content: 'Description content',
      testId: 'card-description',
      customClass: 'custom-description',
      expectedClasses: ['text-sm', 'text-muted-foreground'],
      elementTest: () => expect(screen.getByTestId('card-description').tagName).toBe('P')
    }
  ]

  textComponents.forEach(({ name, Component, content, testId, customClass, expectedClasses, elementTest }) => {
    describe(name, () => {
      it('should render with children', () => {
        render(<Component>{content}</Component>)
        expect(screen.getByText(content)).toBeInTheDocument()
      })

      it('should render with correct element type', () => {
        render(<Component data-testid={testId}>{content}</Component>)
        elementTest()
      })

      it('should render with default styles', () => {
        render(<Component data-testid={testId}>{content}</Component>)
        expect(screen.getByTestId(testId)).toHaveClass(...expectedClasses)
      })

      it('should apply custom className', () => {
        render(<Component className={customClass} data-testid={testId}>{content}</Component>)
        expect(screen.getByTestId(testId)).toHaveClass(customClass)
      })

      it('should have correct display name', () => {
        expect(Component.displayName).toBe(name)
      })
    })
  })

  describe('Card with ref forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Card ref={ref}>Card content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
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