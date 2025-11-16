'use client'

/* eslint-disable no-undef -- DOM globals provided by browser */

import { useEffect, useMemo, useRef, useState, useId } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { NAVIGATION_ITEMS, type NavigationItem } from '@/lib/navigation'
import { cn } from '@/lib/utils'

const LINK_CLASS = 'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
const ACTIVE_CLASS = 'bg-primary text-primary-foreground shadow'
const INACTIVE_CLASS = 'text-muted-foreground hover:bg-muted hover:text-foreground'

function toLink(href: string) {
  return { pathname: href } as const
}

function isCurrent(pathname: string | null, href?: string) {
  if (!href || !pathname) {
    return false
  }

  if (href === '/') {
    return pathname === '/'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function getLinkClassName(active: boolean): string {
  return cn(LINK_CLASS, active ? ACTIVE_CLASS : INACTIVE_CLASS)
}

interface DesktopNavLinkProps {
  item: NavigationItem
  pathname: string | null
}

function DesktopNavLink({ item, pathname }: DesktopNavLinkProps) {
  if (!item.href) {
    return null
  }

  const active = isCurrent(pathname, item.href)

  return (
    <li className="relative">
      <Link
        href={toLink(item.href)}
        aria-current={active ? 'page' : undefined}
        className={getLinkClassName(active)}
      >
        {item.label}
      </Link>
    </li>
  )
}

interface DesktopNavMenuProps {
  item: NavigationItem
  pathname: string | null
}

function useClickOutsideClose(
  open: boolean,
  menuRef: React.RefObject<HTMLUListElement | null>,
  triggerRef: React.RefObject<HTMLButtonElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (
        menuRef.current?.contains(event.target as globalThis.Node) ||
        triggerRef.current?.contains(event.target as globalThis.Node)
      ) {
        return
      }
      onClose()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open, onClose, menuRef, triggerRef])
}

function useEscapeKeyClose(open: boolean, triggerRef: React.RefObject<HTMLButtonElement | null>, onClose: () => void) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        window.requestAnimationFrame(() => triggerRef.current?.focus())
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose, triggerRef])
}

function DesktopNavMenu({ item, pathname }: DesktopNavMenuProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLUListElement | null>(null)
  const menuId = useId()

  const active = (item.children ?? []).some((child) => isCurrent(pathname, child.href))
  const closeMenu = () => setOpen(false)

  useClickOutsideClose(open, menuRef, triggerRef, closeMenu)
  useEscapeKeyClose(open, triggerRef, closeMenu)

  // Close menu on path change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <li className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={getLinkClassName(active)}
        onClick={() => setOpen((v) => !v)}
      >
        {item.label}
        <span className="ml-1" aria-hidden>
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      {open ? (
        <ul
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={`${item.label} submenu`}
          className="absolute left-0 top-full z-60 mt-2 w-56 rounded-md border bg-background p-2 shadow-lg"
          style={{ backgroundColor: 'hsl(var(--background-opaque))' }}
        >
          {(item.children ?? []).map((child) => {
            if (!child.href) {
              return null
            }

            const childActive = isCurrent(pathname, child.href)

            return (
              <li key={child.href} role="none">
          <Link
            href={toLink(child.href)}
            role="menuitem"
            aria-current={childActive ? 'page' : undefined}
            className={cn(
              LINK_CLASS,
              childActive
          ? 'bg-muted text-foreground'
          : INACTIVE_CLASS
            )}
            onClick={() => setOpen(false)}
          >
            {child.label}
          </Link>
              </li>
            )
          })}
        </ul>
      ) : null}
    </li>
  )
}

function useNavClusters(items: NavigationItem[]) {
  return useMemo(() => {
    const ordered = items
      .filter((item) => item.alignment)
      .slice()
      .sort((a, b) => (a.mobileOrder ?? 0) - (b.mobileOrder ?? 0))

    return {
      left: ordered.filter((item) => item.alignment === 'left'),
      right: ordered.filter((item) => item.alignment === 'right'),
    }
  }, [items])
}

export function GlobalNav() {
  const pathname = usePathname()
  const clusters = useNavClusters(NAVIGATION_ITEMS)

  const renderNavItem = (item: NavigationItem) =>
    item.children ? (
      <DesktopNavMenu key={item.label} item={item} pathname={pathname} />
    ) : (
      <DesktopNavLink key={item.label} item={item} pathname={pathname} />
    )

  return (
    <nav aria-label="Primary" className="hidden md:flex">
      <div className="flex w-full items-center justify-between gap-6">
        <ul aria-label="Primary navigation left cluster" className="flex items-center gap-2" >
          {clusters.left.map(renderNavItem)}
        </ul>
        <ul aria-label="Primary navigation right cluster" className="ml-auto flex items-center gap-2">
          {clusters.right.map(renderNavItem)}
        </ul>
      </div>
    </nav>
  )
}
