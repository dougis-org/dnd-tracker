'use client'

import { useEffect, useMemo, useRef, useState, useId } from 'react'
import type { ComponentRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAVIGATION_ITEMS, type NavigationItem } from '@/lib/navigation'
import { cn } from '@/lib/utils'

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
        className={cn(
          'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          active ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
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

function DesktopNavMenu({ item, pathname }: DesktopNavMenuProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<ComponentRef<'button'> | null>(null)
  const menuRef = useRef<ComponentRef<'ul'> | null>(null)
  const menuId = useId()

  const active = (item.children ?? []).some((child) => isCurrent(pathname, child.href))

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (
        menuRef.current?.contains(event.target as globalThis.Node) ||
        triggerRef.current?.contains(event.target as globalThis.Node)
      ) {
        return
      }
      setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        window.requestAnimationFrame(() => triggerRef.current?.focus())
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const toggleMenu = () => {
    setOpen((value) => !value)
  }

  return (
    <li className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={cn(
          'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          active ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        onClick={toggleMenu}
      >
        {item.label}
        <span className="ml-1 text-xs" aria-hidden>
          v
        </span>
      </button>

      {open ? (
        <ul
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={`${item.label} submenu`}
          className="absolute left-0 top-full z-[60] mt-2 w-56 rounded-md border bg-popover/95 p-2 shadow-lg"
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
                    'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    childActive
                      ? 'bg-muted/80 text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
export function GlobalNav() {
  const pathname = usePathname()

  const orderedTopLevel = useMemo(() => {
    return NAVIGATION_ITEMS.filter((item) => item.alignment)
      .slice()
      .sort((a, b) => (a.mobileOrder ?? 0) - (b.mobileOrder ?? 0))
  }, [])

  const leftCluster = useMemo(
    () => orderedTopLevel.filter((item) => item.alignment === 'left'),
    [orderedTopLevel]
  )
  const rightCluster = useMemo(
    () => orderedTopLevel.filter((item) => item.alignment === 'right'),
    [orderedTopLevel]
  )

  return (
    <nav aria-label="Primary" className="hidden md:flex">
      <div className="flex w-full items-center justify-between gap-6">
        <ul aria-label="Primary navigation left cluster" className="flex items-center gap-2">
          {leftCluster.map((item) =>
            item.children ? (
              <DesktopNavMenu key={item.label} item={item} pathname={pathname} />
            ) : (
              <DesktopNavLink key={item.label} item={item} pathname={pathname} />
            )
          )}
        </ul>
        <ul aria-label="Primary navigation right cluster" className="ml-auto flex items-center gap-2">
          {rightCluster.map((item) =>
            item.children ? (
              <DesktopNavMenu key={item.label} item={item} pathname={pathname} />
            ) : (
              <DesktopNavLink key={item.label} item={item} pathname={pathname} />
            )
          )}
        </ul>
      </div>
    </nav>
  )
}
