const mockAuthFlag = process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true'
const hasPublishableKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
const hasServerKeys = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)

export const MOCK_AUTH_STORAGE_KEY = 'dnd-tracker:mock-auth-state'
export const MOCK_AUTH_EVENT_NAME = 'dnd-tracker:mock-auth-changed'

export const mockAuthEnabledClient = mockAuthFlag || !hasPublishableKey
export const mockAuthEnabledServer = mockAuthFlag || !hasServerKeys
export const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
