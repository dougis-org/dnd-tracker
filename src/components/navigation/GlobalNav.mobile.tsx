'use client'

/* eslint-disable no-undef -- DOM globals (HTMLElement, requestAnimationFrame, etc.) are provided by the browser */

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import type { Route } from 'next'
import { NAVIGATION_ITEMS, type NavigationItem } from '@/lib/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PANEL_ID = 'mobile-navigation-panel'

function isCurrent(pathname: string, item: NavigationItem) {
  if (item.href === '/') {
    return pathname === '/'
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function useFocusTrap(enabled: boolean, container: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const panel = container.current
    if (!panel) {
      return undefined
    }

    const focusables = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || focusables.length === 0) {
        return
      }

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        }
        return
      }

      if (document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    panel.addEventListener('keydown', handleKeyDown)
    first?.focus()

    return () => {
      panel.removeEventListener('keydown', handleKeyDown)
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

interface MobileNavPanelProps {
  open: boolean
  pathname: string
  onClose: () => void
  panelRef: React.RefObject<HTMLDivElement | null>
}

function MobileNavPanel({ open, pathname, onClose, panelRef }: MobileNavPanelProps) {
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
          <ul className="space-y-2">
            {NAVIGATION_ITEMS.map((item) => {
              const active = isCurrent(pathname, item)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href as Route}
                    className={cn(
                      'flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      active
                        ? 'bg-primary text-primary-foreground shadow'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
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
      />
    </div>
  )
}
