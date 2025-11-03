export interface NavigationItem {
  label: string
  href: string
  children?: NavigationItem[]
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Characters', href: '/characters' },
  { label: 'Parties', href: '/parties' },
  { label: 'Encounters', href: '/encounters' },
  { label: 'Monsters', href: '/monsters' },
  { label: 'Items', href: '/items' },
  { label: 'Combat', href: '/combat' },
  { label: 'Profile', href: '/profile' },
  { label: 'Settings', href: '/settings' },
  { label: 'Subscription', href: '/subscription' },
  { label: 'Pricing', href: '/pricing' },
]

export interface RouteDefinition {
  path: string
  label: string
  parent?: string
  /** Optional hint for dynamic segments (e.g., [id]). */
  dynamicLabel?: string
}

export const ROUTE_DEFINITIONS: RouteDefinition[] = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/characters', label: 'Characters' },
  { path: '/characters/new', label: 'New Character', parent: '/characters' },
  {
    path: '/characters/[id]',
    label: 'Character',
    parent: '/characters',
    dynamicLabel: 'Character Details',
  },
  { path: '/parties', label: 'Parties' },
  { path: '/parties/new', label: 'New Party', parent: '/parties' },
  {
    path: '/parties/[id]',
    label: 'Party',
    parent: '/parties',
    dynamicLabel: 'Party Details',
  },
  { path: '/encounters', label: 'Encounters' },
  { path: '/encounters/new', label: 'New Encounter', parent: '/encounters' },
  {
    path: '/encounters/[id]',
    label: 'Encounter',
    parent: '/encounters',
    dynamicLabel: 'Encounter Details',
  },
  { path: '/monsters', label: 'Monsters' },
  { path: '/monsters/new', label: 'New Monster', parent: '/monsters' },
  {
    path: '/monsters/[id]',
    label: 'Monster',
    parent: '/monsters',
    dynamicLabel: 'Monster Details',
  },
  { path: '/items', label: 'Items' },
  { path: '/items/new', label: 'New Item', parent: '/items' },
  {
    path: '/items/[id]',
    label: 'Item',
    parent: '/items',
    dynamicLabel: 'Item Details',
  },
  { path: '/combat', label: 'Combat' },
  {
    path: '/combat/[sessionId]',
    label: 'Session',
    parent: '/combat',
    dynamicLabel: 'Combat Session',
  },
  { path: '/profile', label: 'Profile' },
  { path: '/settings', label: 'Settings' },
  { path: '/subscription', label: 'Subscription' },
  { path: '/pricing', label: 'Pricing' },
]
