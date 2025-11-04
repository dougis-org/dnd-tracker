import userEvent from '@testing-library/user-event'
import { render, screen, within } from '@testing-library/react'
import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react'
import { GlobalNavMobile } from '@/components/navigation/GlobalNav.mobile'

type AnchorProps = PropsWithChildren<ComponentPropsWithoutRef<'a'> & { href: string }>

jest.mock('next/navigation', () => ({
  usePathname: () => '/characters/alpha',
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: AnchorProps) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

describe('GlobalNavMobile', () => {
  it('lists top-level entries in the specified order', async () => {
    const user = userEvent.setup()
    render(<GlobalNavMobile />)

    const toggle = screen.getByRole('button', { name: /toggle navigation menu/i })
    await user.click(toggle)

    const list = screen.getByRole('list', { name: /primary mobile navigation/i })
    const topLevelItems = within(list).getAllByRole('listitem')

    expect(topLevelItems.map((item) => item.textContent)).toEqual([
      'Dashboard',
      'Collections',
      'Combat',
      'User',
      'Pricing',
      'Help',
    ])
  })

  it('expands collections submenu preserving child order', async () => {
    const user = userEvent.setup()
    render(<GlobalNavMobile />)

    const toggle = screen.getByRole('button', { name: /toggle navigation menu/i })
    await user.click(toggle)

    const collectionsToggle = screen.getByRole('button', { name: /toggle collections submenu/i })
    await user.click(collectionsToggle)

    const submenu = screen.getByRole('list', { name: /collections submenu/i })
    const submenuLinks = within(submenu).getAllByRole('link')

    expect(submenuLinks.map((link) => link.textContent)).toEqual([
      'Characters',
      'Parties',
      'Encounters',
      'Monsters',
      'Items',
    ])
  })
})
