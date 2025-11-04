import { NAVIGATION_ITEMS, ROUTE_DEFINITIONS, buildBreadcrumbSegments } from '@/lib/navigation'

describe('navigation metadata', () => {
  it('defines left and right desktop clusters as specified', () => {
    const leftLabels = NAVIGATION_ITEMS.filter((item) => item.alignment === 'left').map(
      (item) => item.label
    )
    const rightLabels = NAVIGATION_ITEMS.filter((item) => item.alignment === 'right').map(
      (item) => item.label
    )

    expect(leftLabels).toEqual(['Dashboard', 'Collections', 'Combat'])
    expect(rightLabels).toEqual(['User', 'Pricing', 'Help'])
  })

  it('orders Collections submenu children correctly across surfaces', () => {
    const collections = NAVIGATION_ITEMS.find((item) => item.label === 'Collections')

    expect(collections).toBeDefined()
    expect(collections?.children?.map((child) => child.label)).toEqual([
      'Characters',
      'Parties',
      'Encounters',
      'Monsters',
      'Items',
    ])
  })

  it('includes help route metadata with breadcrumb support', () => {
    const hasHelpRoute = ROUTE_DEFINITIONS.some((route) => route.path === '/help')
    const breadcrumb = buildBreadcrumbSegments('/help')

    expect(hasHelpRoute).toBe(true)
    expect(breadcrumb.map((segment) => segment.label)).toEqual(['Home', 'Help'])
  })
})
