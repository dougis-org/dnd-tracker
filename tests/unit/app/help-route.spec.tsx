import { render, screen } from '@testing-library/react'
import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react'
import HelpPage from '@/app/help/page'
import { buildBreadcrumbSegments } from '@/lib/navigation'

type AnchorHref = string | { pathname: string }
type AnchorProps = PropsWithChildren<Omit<ComponentPropsWithoutRef<'a'>, 'href'> & { href: AnchorHref }>

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: AnchorProps) => {
    const resolvedHref = typeof href === 'string' ? href : href.pathname

    return (
      <a href={resolvedHref} {...rest}>
        {children}
      </a>
    )
  },
}))

describe('Help route', () => {
  it('renders the NotImplementedPage and surfaces breadcrumb metadata', () => {
    render(<HelpPage />)

    expect(screen.getByRole('status')).toHaveTextContent(/on the roadmap/i)
    expect(screen.getByRole('link', { name: /return to home/i })).toHaveAttribute('href', '/')

    const breadcrumb = buildBreadcrumbSegments('/help')
    expect(breadcrumb.map((segment) => segment.label)).toEqual(['Home', 'Help'])
  })
})
