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
    dynamicLabel: 'Character',
  },
  { path: '/parties', label: 'Parties' },
  { path: '/parties/new', label: 'New Party', parent: '/parties' },
  {
    path: '/parties/[id]',
    label: 'Party',
    parent: '/parties',
    dynamicLabel: 'Party',
  },
  { path: '/encounters', label: 'Encounters' },
  { path: '/encounters/new', label: 'New Encounter', parent: '/encounters' },
  {
    path: '/encounters/[id]',
    label: 'Encounter',
    parent: '/encounters',
    dynamicLabel: 'Encounter',
  },
  { path: '/monsters', label: 'Monsters' },
  { path: '/monsters/new', label: 'New Monster', parent: '/monsters' },
  {
    path: '/monsters/[id]',
    label: 'Monster',
    parent: '/monsters',
    dynamicLabel: 'Monster',
  },
  { path: '/items', label: 'Items' },
  { path: '/items/new', label: 'New Item', parent: '/items' },
  {
    path: '/items/[id]',
    label: 'Item',
    parent: '/items',
    dynamicLabel: 'Item',
  },
  { path: '/combat', label: 'Combat' },
  {
    path: '/combat/[sessionId]',
    label: 'Session',
    parent: '/combat',
    dynamicLabel: 'Session',
  },
  { path: '/profile', label: 'Profile' },
  { path: '/settings', label: 'Settings' },
  { path: '/subscription', label: 'Subscription' },
  { path: '/pricing', label: 'Pricing' },
]

export interface BreadcrumbSegment {
  label: string
  href?: string
}

interface MatchedRoute {
  definition: RouteDefinition
  params: Record<string, string>
}

function normalizePath(pathname: string): string {
  if (!pathname) {
    return '/'
  }

  if (pathname === '/') {
    return '/'
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

function splitPath(pathname: string): string[] {
  const normalized = normalizePath(pathname)
  if (normalized === '/') {
    return []
  }
  return normalized.slice(1).split('/')
}

function matchRoute(pathname: string): MatchedRoute | null {
  const pathSegments = splitPath(pathname)

  for (const definition of ROUTE_DEFINITIONS) {
    const defSegments = splitPath(definition.path)
    if (defSegments.length !== pathSegments.length) {
      continue
    }

    const params: Record<string, string> = {}
    let matched = true

    for (let index = 0; index < defSegments.length; index += 1) {
      const current = defSegments[index]
      const actual = pathSegments[index]

      if (current.startsWith('[') && current.endsWith(']')) {
        const paramName = current.slice(1, -1)
        params[paramName] = decodeURIComponent(actual)
        continue
      }

      if (current !== actual) {
        matched = false
        break
      }
    }

    if (matched) {
      return { definition: definition, params }
    }
  }

  return null
}

function buildConcretePath(pattern: string, params: Record<string, string>): string {
  const segments = splitPath(pattern)
  if (segments.length === 0) {
    return '/'
  }

  const resolved = segments.map((segment) => {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      const paramName = segment.slice(1, -1)
      return params[paramName] ?? segment
    }
    return segment
  })

  return `/${resolved.join('/')}`
}

function resolveLabel(definition: RouteDefinition, params: Record<string, string>): string {
  const dynamicSegments = definition.path.match(/\[(.*?)\]/g) ?? []
  if (dynamicSegments.length === 0) {
    return definition.label
  }

  const lastDynamic = dynamicSegments[dynamicSegments.length - 1]
  const paramName = lastDynamic.slice(1, -1)
  const paramValue = params[paramName]

  if (paramValue) {
    return definition.dynamicLabel ? `${definition.dynamicLabel} ${paramValue}` : paramValue
  }

  return definition.dynamicLabel ?? definition.label
}

function fallbackBreadcrumb(pathname: string): BreadcrumbSegment[] {
  const normalized = normalizePath(pathname)
  const segments = splitPath(normalized)

  if (segments.length === 0) {
    return [{ label: 'Home' }]
  }

  const crumbs: BreadcrumbSegment[] = [{ label: 'Home', href: '/' }]
  let currentPath = ''

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const label = decodeURIComponent(segment)
    crumbs.push({
      label,
      href: index === segments.length - 1 ? undefined : currentPath,
    })
  })

  return crumbs
}

export function buildBreadcrumbSegments(pathname: string): BreadcrumbSegment[] {
  const normalized = normalizePath(pathname)
  const matched = matchRoute(normalized)

  if (!matched) {
    return fallbackBreadcrumb(normalized)
  }

  const stack: MatchedRoute[] = []
  let cursor: MatchedRoute | null = matched

  while (cursor) {
    stack.unshift(cursor)
    const parentPath = cursor.definition.parent
    if (!parentPath) {
      break
    }

    const parentMatch = matchRoute(parentPath)
    if (parentMatch) {
      cursor = parentMatch
    } else {
      stack.unshift({
        definition: {
          path: parentPath,
          label: decodeURIComponent(parentPath.split('/').pop() ?? 'Home'),
        },
        params: {},
      })
      break
    }
  }

  if (stack[0]?.definition.path !== '/') {
    stack.unshift({ definition: ROUTE_DEFINITIONS[0], params: {} })
  }

  return stack.map((entry, index) => {
    const resolvedLabel = entry.definition.path === '/'
      ? 'Home'
      : resolveLabel(entry.definition, entry.params)
    const isCurrent = index === stack.length - 1
    const href = isCurrent ? undefined : buildConcretePath(entry.definition.path, entry.params)

    return {
      label: resolvedLabel,
      href: href === normalized ? undefined : href,
    }
  })
}
