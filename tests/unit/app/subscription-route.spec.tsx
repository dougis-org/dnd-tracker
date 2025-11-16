import { render, screen } from '@testing-library/react'
import SubscriptionPage from '@/app/subscription/page'
import { buildBreadcrumbSegments } from '@/lib/navigation'
import { createMockSubscription, createMockUsageMetrics, createMockPlans } from '@fixtures/subscription-fixtures'

// Mock fetcher module used by SubscriptionPage so the route test is deterministic
jest.mock('@/lib/subscription/fetchers', () => ({
  fetchSubscriptionData: jest.fn(),
}))

import { fetchSubscriptionData } from '@/lib/subscription/fetchers'

// Reuse typed link mock pattern from help-route to avoid `any` in tests
type AnchorHref = string | { pathname: string }

import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react'

type AnchorProps = PropsWithChildren<
  Omit<ComponentPropsWithoutRef<'a'>, 'href'> & { href: AnchorHref }
>
// Match layout tests where next/link is mocked to keep tests deterministic
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: AnchorProps) => {
    const resolvedHref = typeof href === 'string' ? href : href.pathname
    return <a href={resolvedHref} {...rest}>{children}</a>
  },
}))

describe('Subscription route', () => {
  it('renders the subscription page and breadcrumb metadata', () => {
    // Provide mock response so SubscriptionPage fetcher resolves immediately
    const subscription = createMockSubscription()
    const usageMetrics = createMockUsageMetrics()
    const availablePlans = createMockPlans()

    ;(fetchSubscriptionData as jest.MockedFunction<typeof fetchSubscriptionData>).mockResolvedValueOnce({
      subscription,
      usageMetrics,
      availablePlans,
    })

    render(<SubscriptionPage />)

    const breadcrumb = buildBreadcrumbSegments('/subscription')
    expect(breadcrumb.map((segment) => segment.label)).toEqual(['Home', 'Subscription'])

    // The subscription route should not render the roadmap "Coming soon" component
    expect(screen.queryByText(/on the roadmap/i)).toBeNull()
  })
})
