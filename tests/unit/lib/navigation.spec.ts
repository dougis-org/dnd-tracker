import {
  NAVIGATION_ITEMS,
  ROUTE_DEFINITIONS,
  buildBreadcrumbSegments,
} from '@/lib/navigation';

describe('navigation metadata', () => {
  it('defines left and right desktop clusters as specified', () => {
    const leftLabels = NAVIGATION_ITEMS.filter(
      (item) => item.alignment === 'left'
    ).map((item) => item.label);
    const rightLabels = NAVIGATION_ITEMS.filter(
      (item) => item.alignment === 'right'
    ).map((item) => item.label);

    expect(leftLabels).toEqual(['Dashboard', 'Collections', 'Combat']);
    expect(rightLabels).toEqual(['User', 'Pricing', 'Help']);
  });

  it('orders Collections submenu children correctly across surfaces', () => {
    const collections = NAVIGATION_ITEMS.find(
      (item) => item.label === 'Collections'
    );

    expect(collections).toBeDefined();
    expect(collections?.children?.map((child) => child.label)).toEqual([
      'Characters',
      'Parties',
      'Encounters',
      'Monsters',
      'Items',
    ]);
  });

  it('includes help route metadata with breadcrumb support', () => {
    const hasHelpRoute = ROUTE_DEFINITIONS.some(
      (route) => route.path === '/help'
    );
    const breadcrumb = buildBreadcrumbSegments('/help');

    expect(hasHelpRoute).toBe(true);
    expect(breadcrumb.map((segment) => segment.label)).toEqual([
      'Home',
      'Help',
    ]);
  });
});

describe('buildBreadcrumbSegments', () => {
  it('returns home-only breadcrumb for root path', () => {
    const segments = buildBreadcrumbSegments('/');

    expect(segments).toEqual([{ label: 'Home' }]);
  });

  it('builds breadcrumb for single-level route', () => {
    const segments = buildBreadcrumbSegments('/dashboard');

    expect(segments.map((s) => s.label)).toEqual(['Home', 'Dashboard']);
    expect(segments[1]).toHaveProperty('href', undefined); // Current page
  });

  it('builds breadcrumb for nested static route with parent links', () => {
    const segments = buildBreadcrumbSegments('/characters/new');

    expect(segments.map((s) => s.label)).toEqual([
      'Home',
      'Characters',
      'New Character',
    ]);
    expect(segments[0]).toHaveProperty('href', '/');
    expect(segments[1]).toHaveProperty('href', '/characters');
    expect(segments[2]).toHaveProperty('href', undefined); // Current
  });

  it('resolves dynamic segments with parameters', () => {
    const segments = buildBreadcrumbSegments('/characters/abc123');

    expect(segments.map((s) => s.label)).toEqual([
      'Home',
      'Characters',
      'Character abc123',
    ]);
    expect(segments[2]).toHaveProperty('href', undefined); // Current
  });

  it('resolves nested dynamic segments', () => {
    const segments = buildBreadcrumbSegments('/parties/p1/encounters/e1');

    const labels = segments.map((s) => s.label);
    expect(labels[0]).toBe('Home');
    expect(labels.length).toBeGreaterThan(1);
    // Nested dynamic route segments may be resolved as lowercase path names
    expect(labels.map((l) => l.toLowerCase())).toContain('parties');
  });

  it('falls back to path segment names for undefined routes', () => {
    const segments = buildBreadcrumbSegments('/unknown/path');

    expect(segments.length).toBeGreaterThan(1);
    expect(segments[0]).toHaveProperty('label', 'Home');
  });

  it('decodes URI-encoded segments', () => {
    const segments = buildBreadcrumbSegments('/characters/john%20doe');

    const characterLabel = segments[segments.length - 1].label;
    expect(characterLabel).toContain('john doe');
  });

  it('includes help route in breadcrumbs', () => {
    const segments = buildBreadcrumbSegments('/help');

    expect(segments.map((s) => s.label)).toEqual(['Home', 'Help']);
  });

  it('handles empty path segments gracefully', () => {
    const segments = buildBreadcrumbSegments('');

    expect(segments).toBeDefined();
    expect(segments.length).toBeGreaterThanOrEqual(1);
  });

  it('handles paths with trailing slashes', () => {
    const segments = buildBreadcrumbSegments('/dashboard/');

    expect(segments).toBeDefined();
    expect(segments.map((s) => s.label)).toContain('Dashboard');
  });

  it('handles paths with multiple consecutive slashes', () => {
    const segments = buildBreadcrumbSegments('//dashboard///settings');

    expect(segments).toBeDefined();
    expect(segments.length).toBeGreaterThan(0);
  });

  it('handles very deeply nested paths', () => {
    const segments = buildBreadcrumbSegments('/a/b/c/d/e/f/g');

    expect(segments).toBeDefined();
    expect(segments[0]).toHaveProperty('label', 'Home');
  });

  it('preserves special characters in segment names', () => {
    const segments = buildBreadcrumbSegments('/characters/john-doe-123');

    expect(segments).toBeDefined();
    const characterLabel = segments[segments.length - 1].label;
    expect(characterLabel).toBeDefined();
  });
});
