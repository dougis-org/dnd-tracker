import type { Session, UserProfile } from '@/types/auth'
import { MOCK_AUTH_EVENT_NAME, MOCK_AUTH_STORAGE_KEY } from './authConfig'

export const mockUserProfile: UserProfile = {
  clerkId: 'mock-user-123',
  email: 'mock-user@example.com',
  name: 'Mock Adventurer',
  avatarUrl: null,
  firstName: 'Mock',
  lastName: 'User',
}

export const anonymousSession: Session = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
}

export const authenticatedSession: Session = {
  isAuthenticated: true,
  user: mockUserProfile,
  isLoading: false,
}

export function readMockSessionFromStorage(): Session {
  if (typeof window === 'undefined') {
    return { ...anonymousSession, isLoading: true }
  }

  const state = window.localStorage.getItem(MOCK_AUTH_STORAGE_KEY)
  if (state === 'signed-in') {
    return authenticatedSession
  }

  return anonymousSession
}

export function dispatchMockAuthEvent() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(MOCK_AUTH_EVENT_NAME))
}
