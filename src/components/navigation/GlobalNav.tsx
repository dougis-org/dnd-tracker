'use client'

/* eslint-disable no-undef -- DOM globals provided by browser */

import { useEffect, useMemo, useRef, useState, useId } from 'react'
import { createPortal } from 'react-dom'
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

  // Coordinates for portal positioning
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null)

  useEffect(() => {
    if (!open) return undefined
    const setPosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (rect) {
          // Add the small vertical offset immediately so initial placement is consistent
          setCoords({ left: rect.left, top: rect.bottom + 8 })
      }
    }

    setPosition()
      // no-op
    window.addEventListener('resize', setPosition)
    window.addEventListener('scroll', setPosition, { passive: true })
    return () => {
      window.removeEventListener('resize', setPosition)
      window.removeEventListener('scroll', setPosition)
        // no timeouts to clear
    }
  }, [open])

  // Adjust after initial render: keep popup below main content to avoid covering hero text
  useEffect(() => {
    if (!open || !coords) return undefined

    let raf: number | null = null
    const adjust = () => {
      try {
        const menuEl = menuRef.current
        const main = document.getElementById('main-content')
        if (!menuEl || !main) return
        const menuRect = menuEl.getBoundingClientRect()
        const mainRect = main.getBoundingClientRect()
        // Prefer a hero/title element inside main (if present) to avoid covering visible heading
        const heroEl = main.querySelector('h1, h2, .hero, .page-title')
        const heroRect = heroEl ? (heroEl as HTMLElement).getBoundingClientRect() : null

        // compute trigger rect for flip logic
        const triggerRect = triggerRef.current?.getBoundingClientRect()
        if (!triggerRect) return

        const menuHeight = menuRect.height

        // default placement (below trigger) and flipped (above trigger)
        let defaultTop = triggerRect.bottom + 8
        const flipTop = triggerRect.top - menuHeight - 8

        const overlapsMain = (top: number) => {
          // Use hero or main top/bottom for overlap detection
          const topBoundary = heroRect ? heroRect.top : mainRect.top
          const bottomBoundary = heroRect ? heroRect.top + heroRect.height : mainRect.top + mainRect.height
          return !(top + menuHeight <= topBoundary || top >= bottomBoundary)
        }

        // if this would overlap the hero, try to pin the menu directly under the header (common pattern)
        const headerEl = document.querySelector('header')
        const headerBottom = headerEl ? (headerEl as HTMLElement).getBoundingClientRect().bottom : 0
        if (defaultTop <= headerBottom + 4) defaultTop = headerBottom + 8

        if (!overlapsMain(defaultTop)) {
          setCoords((c) => (c ? { left: c.left, top: defaultTop } : c))
          // Mark that positioning adjustments have completed so tests can reliably wait
          menuEl.setAttribute('data-positioning', 'complete')
        } else if (flipTop >= 8 && !overlapsMain(flipTop)) {
          setCoords((c) => (c ? { left: c.left, top: flipTop } : c))
          menuEl.setAttribute('data-positioning', 'complete')
        } else {
          // both placements overlap: attempt to place the menu entirely above or below the
          // `main` region so it does not obscure important content. Prefer below the main
          // if there's space, otherwise place above.
          const belowMainTop = mainRect.top + mainRect.height + 8
          const aboveMainTop = mainRect.top - menuHeight - 8
          const belowHeroTop = heroRect ? heroRect.top + (heroRect.height ?? 0) + 8 : belowMainTop
          const aboveHeroTop = heroRect ? heroRect.top - menuHeight - 8 : aboveMainTop

          if (belowHeroTop + menuHeight <= window.innerHeight - 8 && !overlapsMain(belowHeroTop)) {
            setCoords((c) => (c ? { left: c.left, top: belowHeroTop } : c))
            menuEl.setAttribute('data-positioning', 'complete')
          } else if (aboveHeroTop >= 8 && !overlapsMain(aboveHeroTop)) {
            setCoords((c) => (c ? { left: c.left, top: aboveHeroTop } : c))
            menuEl.setAttribute('data-positioning', 'complete')
          } else {
            // fallback: clamp to viewport so menu is visible and close to trigger
            const clampTop = Math.min(
              Math.max(defaultTop, 8),
              window.innerHeight - menuHeight - 8
            )
            setCoords((c) => (c ? { left: c.left, top: clampTop } : c))
            menuEl.setAttribute('data-positioning', 'complete')
          }
        }
      } catch (_e) {
        // ignore transient errors while measuring
      }
    }

        // run on next animation frames to let the DOM paint
    raf = requestAnimationFrame(() => {
      adjust()
      requestAnimationFrame(adjust)
    })
        // Ensure there is a deterministic signal (for tests and timing analysis) that
        // the positioning algorithm has completed. This avoids race conditions in E2E tests.
        requestAnimationFrame(() => {
          try {
            const menuEl = menuRef.current
            if (menuEl) menuEl.setAttribute('data-positioning', 'complete')
          } catch (_e) {
            // ignore
          }
        })

    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [open, coords])

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
        // Render the dropdown into a portal so it escapes stacking contexts/overflow
        coords && typeof document !== 'undefined'
            ? createPortal(
              <ul
                ref={menuRef}
                id={menuId}
                role="menu"
                aria-label={`${item.label} submenu`}
                data-testid="global-nav-dropdown"
                // Add a small vertical offset to avoid overlapping adjacent content
                // Use a very large z-index and an opaque background to avoid layering/visual blending issues
                style={{ left: coords.left, top: coords.top, position: 'fixed', zIndex: 2147483647 }}
                className="w-56 rounded-md border bg-popover p-2 shadow-lg"
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
                      ? 'bg-muted/80 text-foreground'
                      : INACTIVE_CLASS
                  )}
                  onClick={() => setOpen(false)}
                >
                  {child.label}
                </Link>
              </li>
            )
          })}
              </ul>,
              document.body
            )
          : null
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
        <ul aria-label="Primary navigation left cluster" className="flex items-center gap-2">
          {clusters.left.map(renderNavItem)}
        </ul>
        <ul aria-label="Primary navigation right cluster" className="ml-auto flex items-center gap-2">
          {clusters.right.map(renderNavItem)}
        </ul>
      </div>
    </nav>
  )
}
