'use client'

/* eslint-disable no-undef -- DOM globals provided by browser */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import type { Route } from 'next'
import { NAVIGATION_ITEMS, type NavigationItem } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PANEL_ID = 'mobile-navigation-panel'

function isCurrent(pathname: string, href?: string) {
  if (!href) {
    return false
  }

  if (href === '/') {
    return pathname === '/'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function useFocusTrap(enabled: boolean, container: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!enabled || !container.current) {
      return undefined
    }

    const focusables = container.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || focusables.length === 0) {
        return
      }
      handleTabKey(event)
    }

    container.current.addEventListener('keydown', handleKeyDown)
    first?.focus()

    return () => {
      container.current?.removeEventListener('keydown', handleKeyDown)
    }
  }, [container, enabled])
}

function useEscapeToClose(enabled: boolean, close: () => void) {
  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [close, enabled])
}

function useLockBodyScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = original
    }
  }, [enabled])
}

interface MobileSubmenuProps {
  label: string
  isExpanded: boolean
  children: NavigationItem[]
  pathname: string
  onNavigate: () => void
}

function MobileSubmenu({
  label,
  isExpanded,
  children,
  pathname,
  onNavigate,
}: MobileSubmenuProps) {
  const submenuId = `${label.toLowerCase().replace(/\s+/g, '-')}-submenu`

  if (!isExpanded) {
    return null
  }

  return (
    <ul id={submenuId} aria-label={`${label} submenu`} className="mt-1 space-y-1 pl-4">
      {children.map((child) => {
        if (!child.href) {
          return null
        }

        const childActive = isCurrent(pathname, child.href)

        return (
          <li key={child.href}>
            <Link
              href={child.href as Route}
              className={cn(
                'block rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                childActive
                  ? 'bg-muted/80 text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              onClick={onNavigate}
            >
              {child.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

interface MobileNavItemProps {
  item: NavigationItem
  expanded: Record<string, boolean>
  onToggleSubmenu: (label: string) => void
  pathname: string
  onNavigate: () => void
}

function MobileNavItemLink({ item, pathname, onNavigate }: Omit<MobileNavItemProps, 'expanded' | 'onToggleSubmenu'>) {
  const active = isCurrent(pathname, item.href)

  return (
    <li>
      <Link
        href={item.href as Route}
        className={cn(
          'flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          active
            ? 'bg-primary text-primary-foreground shadow'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        aria-current={active ? 'page' : undefined}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    </li>
  )
}

function MobileNavItemButton({
  item,
  expanded,
  onToggleSubmenu,
  pathname,
  onNavigate,
}: Omit<MobileNavItemProps, 'item'> & { item: NavigationItem & { children: NavigationItem[] } }) {
  const children = item.children
  const isExpanded = Boolean(expanded[item.label])
  const submenuId = `${item.label.toLowerCase().replace(/\s+/g, '-')}-submenu`
  const anyChildActive = children.some((child) => isCurrent(pathname, child.href))
  const active = isCurrent(pathname, item.href) || anyChildActive

  return (
    <li>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={submenuId}
        aria-label={`Toggle ${item.label} submenu`}
        className={cn(
          'flex w-full items-center justify-between rounded-md px-3 py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          active
            ? 'bg-primary text-primary-foreground shadow'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        onClick={() => onToggleSubmenu(item.label)}
      >
        {item.label}
      </button>
      <MobileSubmenu
        label={item.label}
        isExpanded={isExpanded}
        children={children}
        pathname={pathname}
        onNavigate={onNavigate}
      />
    </li>
  )
}

function MobileNavItem({
  item,
  expanded,
  onToggleSubmenu,
  pathname,
  onNavigate,
}: MobileNavItemProps) {
  const hasChildren = (item.children ?? []).length > 0

  if (hasChildren) {
    return (
      <MobileNavItemButton
        item={item as NavigationItem & { children: NavigationItem[] }}
        expanded={expanded}
        onToggleSubmenu={onToggleSubmenu}
        pathname={pathname}
        onNavigate={onNavigate}
      />
    )
  }

  if (!item.href) {
    return null
  }

  return <MobileNavItemLink item={item} pathname={pathname} onNavigate={onNavigate} />
}

interface MobileNavPanelProps {
  open: boolean
  pathname: string
  onClose: () => void
  panelRef: React.RefObject<HTMLDivElement | null>
  items: NavigationItem[]
}

function MobileNavPanel({ open, pathname, onClose, panelRef, items }: MobileNavPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setExpanded({})
  }, [pathname])

  const toggleSubmenu = (label: string) => {
    setExpanded((state) => ({ ...state, [label]: !state[label] }))
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />
      <div
        id={PANEL_ID}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Primary navigation"
        className="absolute inset-y-0 right-0 flex w-80 max-w-full flex-col gap-6 border-l bg-background p-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold">Explore the app</p>
          <Button variant="ghost" size="icon" aria-label="Close navigation" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>
        <nav aria-label="Primary mobile" className="flex-1 overflow-y-auto">
          <ul aria-label="Primary mobile navigation" className="space-y-2">
            {items.map((item) => (
              <MobileNavItem
                key={item.href ?? item.label}
                item={item}
                expanded={expanded}
                onToggleSubmenu={toggleSubmenu}
                pathname={pathname}
                onNavigate={onClose}
              />
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export function GlobalNavMobile() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const previousPathRef = useRef(pathname)

  const orderedTopLevel = useMemo(() => {
    return NAVIGATION_ITEMS.filter((item) => item.alignment)
      .slice()
      .sort((a, b) => (a.mobileOrder ?? 0) - (b.mobileOrder ?? 0))
  }, [])

  const closeMenu = useCallback(() => {
    setOpen(false)
    requestAnimationFrame(() => {
      buttonRef.current?.focus()
    })
  }, [])

  useFocusTrap(open, panelRef)
  useEscapeToClose(open, closeMenu)
  useLockBodyScroll(open)

  useEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname
      if (open) {
        closeMenu()
      }
    }
  }, [closeMenu, open, pathname])

  return (
    <div className="md:hidden">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        aria-controls={PANEL_ID}
        aria-expanded={open}
        aria-label="Toggle navigation menu"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </Button>

      <MobileNavPanel
        open={open}
        pathname={pathname}
        onClose={closeMenu}
        panelRef={panelRef}
        items={orderedTopLevel}
      />
    </div>
  )
}
