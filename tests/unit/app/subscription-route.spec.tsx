import { render, screen } from '@testing-library/react'
import SubscriptionPage from '@/app/subscription/page'
import { buildBreadcrumbSegments } from '@/lib/navigation'

// Reuse typed link mock pattern from help-route to avoid `any` in tests
type AnchorHref = string | { pathname: string }

type AnchorProps = React.PropsWithChildren<
  Omit<React.ComponentPropsWithoutRef<'a'>, 'href'> & { href: AnchorHref }
>
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: AnchorProps) => {
    const resolvedHref = typeof href === 'string' ? href : href.pathname
    return <a href={resolvedHref} {...rest}>{children}</a>
  },
}))

describe('Subscription route', () => {
  it('renders the subscription page and breadcrumb metadata', async () => {
    render(<SubscriptionPage />)

    const breadcrumb = buildBreadcrumbSegments('/subscription')
    expect(breadcrumb.map((segment) => segment.label)).toEqual(['Home', 'Subscription'])

    // The subscription route should not render the roadmap "Coming soon" component
    expect(screen.queryByText(/on the roadmap/i)).toBeNull()
  })
})
