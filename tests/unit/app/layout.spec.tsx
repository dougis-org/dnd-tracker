import '@testing-library/jest-dom'
import { afterAll, beforeAll, describe, it, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import RootLayout from '@/app/layout'

jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'font-inter' }),
}))

jest.mock('@/components/theme/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

describe('RootLayout', () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>
  let originalMatchMedia: typeof window.matchMedia | undefined

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    originalMatchMedia = window.matchMedia

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => undefined,
          removeListener: () => undefined,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          dispatchEvent: () => false,
        }) as globalThis.MediaQueryList,
    })
  })

  afterAll(() => {
    consoleErrorSpy.mockRestore()
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia
    } else {
      Reflect.deleteProperty(window, 'matchMedia')
    }
  })

  const renderLayout = () =>
    render(
      <RootLayout>
        <p>Layout content</p>
      </RootLayout>
    )

  it('renders navigation components in the header', () => {
    renderLayout()

    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /toggle navigation menu/i })).toBeInTheDocument()
  })

  it('renders breadcrumb, footer, and main content region', () => {
    renderLayout()

    expect(screen.queryByRole('navigation', { name: /breadcrumb/i })).toBeNull()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(screen.getByText('Layout content')).toBeInTheDocument()
  })

  it('includes a skip link for accessibility', () => {
    renderLayout()

    const skipLink = screen.getByRole('link', { name: /skip to main content/i })
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })
})
