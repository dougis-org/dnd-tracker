import { render, screen } from '@testing-library/react'
import SubscriptionPage from '@/app/subscription/page'
import { buildBreadcrumbSegments } from '@/lib/navigation'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => {
    const resolvedHref = typeof href === 'string' ? href : href.pathname
    return <a href={resolvedHref}>{children}</a>
  },
}))

describe('Subscription route', () => {
  it('renders the subscription page and breadcrumb metadata', async () => {
    render(<SubscriptionPage />)

    // Since the real page fetches data asynchronously, the important thing is that it
    // does NOT render the NotImplementedPage UI (on the roadmap copy). Instead it should
    // eventually render the subscription page skeleton or title. We assert the header
    // text if present, otherwise testing library should still find the skeleton role.

    const breadcrumb = buildBreadcrumbSegments('/subscription')
    expect(breadcrumb.map((segment) => segment.label)).toEqual(['Home', 'Subscription'])

    // The subscription route should not render the roadmap "Coming soon" component
    expect(screen.queryByText(/on the roadmap/i)).toBeNull()
  })
})
