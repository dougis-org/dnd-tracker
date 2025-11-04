import userEvent from '@testing-library/user-event'
import { render, screen, within } from '@testing-library/react'
import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react'
import { GlobalNav } from '@/components/navigation/GlobalNav'

type AnchorProps = PropsWithChildren<ComponentPropsWithoutRef<'a'> & { href: string }>

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: AnchorProps) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard',
  }),
}))

describe('GlobalNav', () => {
  it('renders desktop left/right clusters with required top-level entries', () => {
    render(<GlobalNav />)

    const nav = screen.getByRole('navigation', { name: /primary/i })
    const leftCluster = within(nav).getByRole('list', { name: /left cluster/i })
    const rightCluster = within(nav).getByRole('list', { name: /right cluster/i })

    expect(rightCluster).toHaveClass('ml-auto')

    expect(within(leftCluster).getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(within(leftCluster).getByRole('button', { name: 'Collections' })).toBeInTheDocument()
    expect(within(leftCluster).getByRole('link', { name: 'Combat' })).toBeInTheDocument()

    expect(within(rightCluster).getByRole('button', { name: 'User' })).toBeInTheDocument()

    const rightLinks = within(rightCluster).getAllByRole('link')
    expect(rightLinks.map((element) => element.textContent)).toEqual(['Pricing', 'Help'])
  })

  it('reveals collections submenu with ordered children', async () => {
    const user = userEvent.setup()
    render(<GlobalNav />)

    const nav = screen.getByRole('navigation', { name: /primary/i })
    const collectionsTrigger = within(nav).getByRole('button', { name: 'Collections' })

    await user.click(collectionsTrigger)

    const submenu = screen.getByRole('menu', { name: /collections submenu/i })
    const submenuLinks = within(submenu).getAllByRole('menuitem')

    expect(submenuLinks.map((element) => element.textContent)).toEqual([
      'Characters',
      'Parties',
      'Encounters',
      'Monsters',
      'Items',
    ])
  })
})
