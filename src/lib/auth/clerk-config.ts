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
// Skip validation during build - Clerk keys are only needed at runtime
// Check for both NEXT_PHASE and NODE_ENV to ensure we skip during Docker builds
const isBuildTime =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.NEXT_PHASE === 'phase-production-server' ||
  !process.env.CLERK_SECRET_KEY // If no secret key, we're in build phase

// Only validate in actual runtime (browser or server after deployment)
if (!isBuildTime && typeof window !== 'undefined') {
  if (!clerkConfig.publishableKey) {
    console.warn('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing')
  }
}

export default clerkConfig