import { Page } from '@playwright/test'
import { MOCK_AUTH_EVENT_NAME, MOCK_AUTH_STORAGE_KEY } from '@/lib/auth/authConfig'

const mockAuthEnv = process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH
const mockAuthEnabled = mockAuthEnv !== 'false'

export async function mockSignIn(page: Page, redirectPath = '/'): Promise<void> {
  if (!mockAuthEnabled) return

  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(
    ({ storageKey, eventName }) => {
      localStorage.setItem(storageKey, 'signed-in')
      window.dispatchEvent(new Event(eventName))
    },
    { storageKey: MOCK_AUTH_STORAGE_KEY, eventName: MOCK_AUTH_EVENT_NAME }
  )

  // Wait for sign-in state to propagate (e.g., "Sign Out" button appears)
  await page.waitForSelector('[data-testid="sign-out"], body', { timeout: 5000 }).catch(() => {})

  if (redirectPath !== '/') {
    await page.goto(redirectPath)
    await page.waitForLoadState('networkidle')
  } else {
    await page.reload()
  }
}

export async function mockSignOut(page: Page): Promise<void> {
  if (!mockAuthEnabled) return

  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(
    ({ storageKey, eventName }) => {
      localStorage.setItem(storageKey, 'signed-out')
      window.dispatchEvent(new Event(eventName))
    },
    { storageKey: MOCK_AUTH_STORAGE_KEY, eventName: MOCK_AUTH_EVENT_NAME }
  )
}
