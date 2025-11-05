import Link from 'next/link'
import type { LinkProps } from 'next/link'
import { Github, Twitter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FooterLink {
  label: string
  href: string
}

const legalLinks: FooterLink[] = [
  { label: 'Privacy', href: '/legal/privacy' },
  { label: 'Terms', href: '/legal/terms' },
  { label: 'Changelog', href: '/changelog' },
]

const socialLinks: FooterLink[] = [
  { label: 'GitHub', href: 'https://github.com/dougis-org/dnd-tracker' },
  { label: 'Twitter', href: 'https://x.com/dougis_org' },
]

function isExternalLink(href: string) {
  return href.startsWith('http')
}

function toInternalHref(path: string): LinkProps<string>['href'] {
  return { pathname: path }
}

function LegalLinks() {
  return (
    <nav aria-label="Legal">
      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {legalLinks.map((link) => (
          <li key={link.label}>
            {isExternalLink(link.href) ? (
              <a className="hover:text-foreground" href={link.href}>
                {link.label}
              </a>
            ) : (
              <Link className="hover:text-foreground" href={toInternalHref(link.href)}>
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

function SocialLinks() {
  return (
    <nav aria-label="Social">
      <ul className="flex items-center justify-center gap-4">
        {socialLinks.map((link) => (
          <li key={link.label}>
            {isExternalLink(link.href) ? (
              <a
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {link.label === 'GitHub' ? <Github className="h-4 w-4" aria-hidden /> : null}
                {link.label === 'Twitter' ? <Twitter className="h-4 w-4" aria-hidden /> : null}
                <span>{link.label}</span>
              </a>
            ) : (
              <Link
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                href={toInternalHref(link.href)}
              >
                {link.label === 'GitHub' ? <Github className="h-4 w-4" aria-hidden /> : null}
                {link.label === 'Twitter' ? <Twitter className="h-4 w-4" aria-hidden /> : null}
                <span>{link.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={cn(
        'border-t bg-muted/40 py-10 text-center text-sm text-muted-foreground',
        className
      )}
    >
      <div className="container space-y-6">
        <div>
          <p className="font-semibold text-foreground">D&D Tracker</p>
          <p>Built for dungeon masters who want to run smoother encounters.</p>
        </div>
        <LegalLinks />
        <SocialLinks />
        <p>&copy; {currentYear} D&D Tracker. All rights reserved.</p>
      </div>
    </footer>
  )
}
