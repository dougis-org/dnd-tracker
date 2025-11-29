'use client'

import { MOCK_AUTH_EVENT_NAME, MOCK_AUTH_STORAGE_KEY } from './authConfig'

export type MockAuthState = 'signed-in' | 'signed-out'

export function setMockAuthState(state: MockAuthState) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(MOCK_AUTH_STORAGE_KEY, state)
  window.dispatchEvent(new Event(MOCK_AUTH_EVENT_NAME))
}

export function clearMockAuthState() {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY)
  window.dispatchEvent(new Event(MOCK_AUTH_EVENT_NAME))
}