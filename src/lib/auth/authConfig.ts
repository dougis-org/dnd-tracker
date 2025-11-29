const mockAuthFlag = process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true'
const isProduction = process.env.NODE_ENV === 'production'

export const MOCK_AUTH_STORAGE_KEY = 'dnd-tracker:mock-auth-state'
export const MOCK_AUTH_EVENT_NAME = 'dnd-tracker:mock-auth-changed'

// Mock auth is only enabled if explicitly flagged AND not in production
// NEVER enable mock auth in production without explicit flag
export const mockAuthEnabledClient = mockAuthFlag && !isProduction
export const mockAuthEnabledServer = mockAuthFlag && !isProduction
export const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
