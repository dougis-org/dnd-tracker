/**
 * Clerk authentication configuration
 * Reference: plan.md:Technical Research - Clerk integration (lines 154-157)
 */

export const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  secretKey: process.env.CLERK_SECRET_KEY!,

  // Session configuration
  sessionTokenTemplate: 'dnd_tracker_session',

  // Sign-in/up configuration
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/profile/setup',

  // Appearance customization for D&D theme
  appearance: {
    baseTheme: 'dark',
    variables: {
      colorPrimary: '#8B0000', // Dragon red
      colorBackground: '#2F2F2F', // Dark background
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    elements: {
      card: 'shadow-xl border border-gray-700',
      headerTitle: 'text-white',
      headerSubtitle: 'text-gray-300',
      formButtonPrimary: 'bg-red-600 hover:bg-red-700 text-white',
      formFieldInput: 'bg-gray-800 border-gray-600 text-white',
      footerActionLink: 'text-red-400 hover:text-red-300',
    },
  },

  // Localization
  localization: {
    signIn: {
      start: {
        title: 'Welcome back, Dungeon Master',
        subtitle: 'Sign in to manage your encounters',
      },
    },
    signUp: {
      start: {
        title: 'Join the Adventure',
        subtitle: 'Create your account to start tracking encounters',
      },
    },
  },
} as const

// Environment validation
if (!clerkConfig.publishableKey) {
  throw new Error('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required')
}

if (!clerkConfig.secretKey) {
  throw new Error('CLERK_SECRET_KEY is required')
}

export default clerkConfig